import { initializeApp,applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'node:crypto';
import { blankPreferences,readiness,Problem } from './domain.js';
let database,auth;
export function setTestServices(value){if(process.env.NODE_ENV!=='test')throw new Error('Test services are disabled.');database=value.db;auth=value.auth;}
export function configured(){return process.env.ENABLE_FIREBASE_ADMIN==='true'&&Boolean(process.env.FIREBASE_PROJECT_ID);}
export function services(){if(!configured())throw new Problem(503,'Firebase Admin is not configured. This preview has no live sign-in or database.');if(!database){const app=initializeApp({credential:applicationDefault(),projectId:process.env.FIREBASE_PROJECT_ID});database=getFirestore(app,process.env.FIRESTORE_DATABASE_ID||'(default)');auth=getAuth(app);}return {db:database,auth};}
export const userRef=uid=>services().db.doc(`users/${uid}`);
export const draftRef=uid=>services().db.doc(`users/${uid}/state/draft`);
export const freshDraft=()=>({preferences:blankPreferences(),messages:[],version:0,lease:null});
export async function getDraft(uid){const d=(await draftRef(uid).get()).data()||freshDraft();return {preferences:d.preferences,messages:d.messages||[],version:d.version,lease:d.lease};}
export async function assertActive(tx,uid){const user=await tx.get(userRef(uid));if(user.data()?.deleting)throw new Problem(409,'Account deletion is in progress.');}
export async function lockDraft(uid,version){const {db}=services(),ref=draftRef(uid),token=randomUUID();return db.runTransaction(async tx=>{await assertActive(tx,uid);const draft={...freshDraft(),...((await tx.get(ref)).data()||{})};if(draft.version!==version)throw new Problem(409,'The draft changed in another tab. Reload before editing.');if(draft.lease&&draft.lease.until>Date.now())throw new Problem(409,'Another operation is in progress. Please wait.');tx.set(ref,{...draft,lease:{token,until:Date.now()+90000}});return {draft,token};});}
export async function unlockDraft(uid,token){const {db}=services(),ref=draftRef(uid);await db.runTransaction(async tx=>{const d=(await tx.get(ref)).data();if(d?.lease?.token===token)tx.update(ref,{lease:null});});}
export async function commitDraft(uid,token,update,trip){const {db}=services(),ref=draftRef(uid);return db.runTransaction(async tx=>{await assertActive(tx,uid);const d=(await tx.get(ref)).data();if(d?.lease?.token!==token||d.lease.until<Date.now())throw new Problem(409,'The operation expired; reload and retry.');const next={preferences:d.preferences,messages:d.messages||[],...update,version:d.version+1,lease:null};tx.set(ref,next);if(trip){tx.create(db.doc(`trips/${trip.id}`),trip);tx.create(db.doc(`automationEvents/${trip.id}`),{tripId:trip.id,owner:uid,status:'queued',createdAt:trip.createdAt});}return {...next,readiness:readiness(next.preferences)};});}
export async function ownedTrip(uid,id){if(!/^[a-f0-9-]{36}$/.test(id))throw new Problem(404,'Trip not found.');const s=await services().db.doc(`trips/${id}`).get();if(!s.exists||s.data().owner!==uid)throw new Problem(404,'Trip not found.');return s.data();}
