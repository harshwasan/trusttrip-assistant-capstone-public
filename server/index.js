import './env.js';
import express from 'express';
import { access, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { z } from 'zod';
import { Problem,preferencesSchema,readiness,acceptPlan,publicTrip,catalogueSchema,samePreferences } from './domain.js';
import { converse,generate } from './ai.js';
import {publicUsageConfig} from './usage.js';
import {limiters} from './ratelimit.js';
import { configured,services,userRef,draftRef,getDraft,lockDraft,unlockDraft,commitDraft,ownedTrip } from './store.js';
import { automationReady,serviceAuth,processEvent,review,dispatch,deleteExternal,pendingEvents } from './automation.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogue=catalogueSchema.parse(JSON.parse(await readFile(path.join(root,'catalogue/catalogue.json'),'utf8')));
const coverage=[...new Set([...catalogue.hotels,...catalogue.activities].map(x=>x.destination))].map(name=>({name,properties:catalogue.hotels.filter(h=>h.destination===name).length,activities:catalogue.activities.filter(a=>a.destination===name).length}));
export const app=express();
const httpServer=createServer(app);
const development=process.env.NODE_ENV!=='test'&&process.argv.includes('--dev');
const trustProxy=process.env.TRUST_PROXY??'0';if(!/^\d+$/.test(trustProxy))throw new Error('TRUST_PROXY must be the number of proxy hops in front of the app (0 when none).');app.set('trust proxy',Number(trustProxy));
const limit=limiters();app.disable('x-powered-by');app.use(express.json({limit:'24kb'}));
app.use((req,res,next)=>{res.set({'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':'no-store'});const forwarded=req.headers['x-forwarded-host'];const allowed=[process.env.APP_ORIGIN,`http://localhost:${process.env.PORT||3000}`,`http://127.0.0.1:${process.env.PORT||3000}`,req.headers.host&&`http://${req.headers.host}`,req.headers.host&&`https://${req.headers.host}`,forwarded&&`https://${forwarded}`,forwarded&&`http://${forwarded}`].filter(Boolean);if(req.method!=='GET'&&req.headers.origin&&!allowed.includes(req.headers.origin))return res.status(403).json({error:'Cross-origin write blocked.'});next();});
app.use('/api',limit.perIp,limit.perIpAi);
app.get('/api/config',(req,res)=>res.json({firebase:{apiKey:process.env.FIREBASE_API_KEY||'',authDomain:process.env.FIREBASE_AUTH_DOMAIN||'',projectId:process.env.FIREBASE_PROJECT_ID||'',appId:process.env.FIREBASE_APP_ID||''},firebaseConfigured:configured()&&Boolean(process.env.FIREBASE_API_KEY&&process.env.FIREBASE_AUTH_DOMAIN&&process.env.FIREBASE_APP_ID),geminiConfigured:Boolean(process.env.GEMINI_API_KEY&&process.env.GEMINI_MODEL),automationConfigured:automationReady(),databaseId:process.env.FIRESTORE_DATABASE_ID||'(default)',catalogue:{version:catalogue.version,properties:catalogue.hotels.length,activities:catalogue.activities.length,destinations:coverage},connectionVerified:false,usageLimits:publicUsageConfig()}));
app.get('/api/health',(req,res)=>res.json({ok:true,mode:configured()?'configured-not-verified':'unconfigured'}));
async function authenticate(req,res,next){try{const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)throw new Problem(401,'Sign in to access private trip data.');let identity;try{identity=await services().auth.verifyIdToken(token,true);}catch(e){if(e instanceof Problem)throw e;throw new Problem(401,'Your sign-in session could not be verified.');}req.identity=identity;next();}catch(e){next(e);}}
const reviewer=(req,res,next)=>req.identity.trusttripReviewer===true?next():res.status(403).json({error:'A server-assigned reviewer role is required.'});
app.get('/api/automation/events',serviceAuth,async(req,res)=>{res.json({events:await pendingEvents()});});
app.post('/api/automation/run',serviceAuth,async(req,res)=>{const {tripId}=z.object({tripId:z.string().uuid()}).strict().parse(req.body);res.json(await processEvent(tripId));});
app.use('/api',authenticate,limit.userReads,limit.userWrites);
app.get('/api/me',(req,res)=>res.json({reviewer:req.identity.trusttripReviewer===true}));
app.get('/api/draft',async(req,res)=>{const draft=await getDraft(req.identity.uid);const {lease,...safe}=draft;res.json({...safe,readiness:readiness(draft.preferences)});});
app.post('/api/chat',async(req,res)=>{const {message,version}=z.object({message:z.string().trim().min(1).max(2500),version:z.number().int().nonnegative()}).strict().parse(req.body);const uid=req.identity.uid,{draft,token}=await lockDraft(uid,version);try{if(draft.messages.length>=100)throw new Problem(422,'This conversation has reached 100 messages. Edit the summary or start a fresh draft.');const result=await converse(uid,draft,message);const next=await commitDraft(uid,token,{preferences:result.preferences,messages:[...draft.messages,{role:'user',text:message},{role:'assistant',text:result.reply}]});delete next.lease;res.json(next);}finally{await unlockDraft(uid,token);}});

app.put('/api/draft',async(req,res)=>{const {preferences,version}=z.object({preferences:preferencesSchema,version:z.number().int().nonnegative()}).strict().parse(req.body);const uid=req.identity.uid,{token}=await lockDraft(uid,version);try{const next=await commitDraft(uid,token,{preferences});delete next.lease;res.json(next);}finally{await unlockDraft(uid,token);}});
app.post('/api/draft/reset',async(req,res)=>{const {version}=z.object({version:z.number().int().nonnegative()}).strict().parse(req.body);const uid=req.identity.uid,{token}=await lockDraft(uid,version);try{const {freshDraft}=await import('./store.js');const {preferences,messages}=freshDraft();const next=await commitDraft(uid,token,{preferences,messages});delete next.lease;res.json(next);}finally{await unlockDraft(uid,token);}});
app.post('/api/trips',async(req,res)=>{const {version,evaluationOnly,confirmedPreferences}=z.object({version:z.number().int().nonnegative(),evaluationOnly:z.literal(true),reviewed:z.literal(true),confirmedPreferences:preferencesSchema}).strict().parse(req.body);const uid=req.identity.uid,{draft,token}=await lockDraft(uid,version);try{if(!samePreferences(confirmedPreferences,draft.preferences))throw new Problem(409,'The preferences you reviewed have changed. Reload the summary before generating.');if(!readiness(draft.preferences).ready)throw new Problem(422,'Complete and review the required preferences first.');const raw=await generate(uid,draft.preferences,catalogue),plan=acceptPlan(raw,draft.preferences,catalogue),trip={id:randomUUID(),owner:uid,createdAt:new Date().toISOString(),preferences:draft.preferences,plan,reviewStatus:'Queued',approvedExplanation:null,evaluationOnly};const next=await commitDraft(uid,token,{},trip);delete next.lease;void dispatch(trip.id).catch(()=>{});res.status(201).json({trip:publicTrip(trip),draft:next});}finally{await unlockDraft(uid,token);}});
app.get('/api/trips',async(req,res)=>{const rows=await services().db.collection('trips').where('owner','==',req.identity.uid).get();res.json({trips:rows.docs.map(d=>publicTrip(d.data())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});});
app.get('/api/trips/:id',async(req,res)=>res.json(publicTrip(await ownedTrip(req.identity.uid,req.params.id))));
app.get('/api/reviews',reviewer,async(req,res)=>{const rows=await services().db.collection('privateReviews').where('status','in',['Pending','Sync failed','Failed','Blocked']).limit(50).get();const reviews=await Promise.all(rows.docs.map(async d=>{const j=d.data(),trip=(await services().db.doc(`trips/${d.id}`).get()).data();return {id:d.id,status:j.status,draft:j.draft||'',error:j.error||null,approvedText:j.approvedText||'',trip:trip?publicTrip(trip):null};}));res.json({reviews});});
app.post('/api/reviews/:id',reviewer,async(req,res)=>{z.string().uuid().parse(req.params.id);const input=z.object({decision:z.enum(['Approved','Rejected']),text:z.string().trim().max(400),humanConfirmed:z.literal(true)}).strict().parse(req.body);if(input.decision==='Approved'&&input.text.length<10)throw new Problem(422,'Review and enter the approved explanation.');res.json(await review(req.params.id,input.decision,input.text,req.identity.uid));});
app.delete('/api/account',async(req,res)=>{const uid=req.identity.uid,{db,auth}=services();if(Date.now()/1000-req.identity.auth_time>300)throw new Problem(401,'Sign out and sign in again before deleting your account.');z.object({confirm:z.literal('DELETE')}).strict().parse(req.body);
 let jobs;
 await db.runTransaction(async tx=>{const d=(await tx.get(draftRef(uid))).data();jobs=await tx.get(db.collection('privateReviews').where('owner','==',uid));if(jobs.docs.some(j=>j.data().writeAttempted&&!j.data().airtableId))throw new Problem(409,'An external write has an unresolved outcome. Reconcile the Airtable row before deleting.');if(d?.lease?.until>Date.now()||jobs.docs.some(j=>j.data().leaseUntil>Date.now()))throw new Problem(409,'Wait for active generation or review before deleting.');tx.set(userRef(uid),{deleting:true},{merge:true});});
 // On external failure, retain the tombstone and private data for a visible retry; never claim deletion.
 for(const j of jobs.docs)if(j.data().airtableId){await deleteExternal(j.data().airtableId);await j.ref.update({airtableId:null});}
 const trips=await db.collection('trips').where('owner','==',uid).get();for(const t of trips.docs){await db.doc(`automationEvents/${t.id}`).delete();await db.doc(`privateReviews/${t.id}`).delete();await t.ref.delete();}await db.recursiveDelete(userRef(uid));await auth.deleteUser(uid);res.json({deleted:true});});
app.use('/api',(req,res)=>res.status(404).json({error:'API route not found.'}));
if(development){
 const {createServer:createViteServer}=await import('vite');
 const vite=await createViteServer({root,server:{middlewareMode:true,hmr:{server:httpServer}},appType:'spa'});
 app.use(vite.middlewares);
}else{
 if(process.env.NODE_ENV!=='test'){
  try{await access(path.join(root,'dist/index.html'));}
  catch{throw new Error('Production build is missing. Run npm run build before npm start, or use npm run dev for the source preview.');}
 }
 app.use(express.static(path.join(root,'dist')));
 app.get('/{*path}',(req,res)=>res.sendFile(path.join(root,'dist/index.html')));
}
app.use((error,req,res,next)=>{if(res.headersSent)return next(error);const status=error instanceof Problem?error.status:error instanceof z.ZodError?422:error.type==='entity.too.large'?413:500;if(status===429)res.set('Retry-After',String(error.retryAt?Math.max(1,Math.ceil((Date.parse(error.retryAt)-Date.now())/1000)):86400));res.status(status).json({...(error instanceof Problem&&'code' in error?{code:error.code,retryAt:error.retryAt??null,operatorRequired:Boolean(error.operatorRequired)}:{}),error:status===422?(error instanceof Problem?error.message:'Invalid input. Check formats, counts and required fields.'):status===500?'The operation failed. No successful save is being claimed. Check the server configuration and retry.':error.message});});
if(process.env.NODE_ENV!=='test'){const port=Number(process.env.PORT||3000);httpServer.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`TrustTrip ${development?'source preview':'built app'}: http://localhost:${port} (cloud verification pending)`));}

