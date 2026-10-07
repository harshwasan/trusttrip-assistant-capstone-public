import { createHash } from 'node:crypto';
import { Problem } from './domain.js';
import { services } from './store.js';

export class UsageProblem extends Problem {
 constructor(message,{code='AI_LIMIT_REACHED',retryAt=null,operatorRequired=false,status=429}={}){super(status,message);this.code=code;this.retryAt=retryAt;this.operatorRequired=operatorRequired;}
}
const configError=()=>new UsageProblem('AI limits are not configured correctly. Ask the operator to check server settings.',{code:'AI_CONFIG_INVALID',operatorRequired:true,status:503});
function integer(env,key,fallback,max){const raw=env[key];if(raw===undefined)return fallback;if(!/^(0|[1-9]\d*)$/.test(raw))throw configError();const n=Number(raw);if(!Number.isSafeInteger(n)||n>max)throw configError();return n;}
export function usageConfig(env=process.env){
 if(env.AI_ENABLED!==undefined&&!['true','false'].includes(env.AI_ENABLED))throw configError();
 return {enabled:env.AI_ENABLED!=='false',chatPerMinute:integer(env,'AI_CHAT_PER_MINUTE',5,1000),chatPerDay:integer(env,'AI_CHAT_PER_DAY',30,100000),itinerariesPerDay:integer(env,'AI_ITINERARIES_PER_DAY',5,100000),globalPerDay:integer(env,'AI_GLOBAL_PER_DAY',200,1000000),explanationsPerTrip:integer(env,'AI_EXPLANATIONS_PER_TRIP',2,2),maxInputChars:integer(env,'AI_MAX_INPUT_CHARS',60000,200000),tokens:{chat:integer(env,'AI_CHAT_MAX_OUTPUT_TOKENS',2048,32768),itinerary:integer(env,'AI_ITINERARY_MAX_OUTPUT_TOKENS',4096,32768),explanation:integer(env,'AI_EXPLANATION_MAX_OUTPUT_TOKENS',512,32768)},resetTimezone:'UTC'};
}
export function publicUsageConfig(){const c=usageConfig();return {enabled:c.enabled,chatPerMinute:c.chatPerMinute,chatPerDay:c.chatPerDay,itinerariesPerDay:c.itinerariesPerDay,globalPerDay:c.globalPerDay,resetTimezone:c.resetTimezone};}
export const usageUserKey=uid=>createHash('sha256').update(uid).digest('hex');
const storageError=()=>new UsageProblem('AI usage could not be checked safely. Please try again later.',{code:'AI_USAGE_UNAVAILABLE',status:503,retryAt:new Date(Date.now()+60000).toISOString()});
function counter(value){if(!Number.isSafeInteger(value)||value<0)throw storageError();return value;}
export function validateContext(context){if(!context||typeof context.uid!=='string'||!context.uid||context.uid.length>128||!['chat','itinerary','explanation'].includes(context.action)||(context.action==='explanation'&&!/^[a-f0-9-]{36}$/.test(context.tripId||'')))throw new UsageProblem('The server could not identify this AI request.',{code:'AI_CONTEXT_INVALID',status:503,operatorRequired:true});}
export function ensureEnabled(config,action){if(!config.enabled)throw new UsageProblem('AI generation is temporarily paused. Saved trips and human reviews remain available.',{code:'AI_DISABLED',status:503,operatorRequired:true});if(config.globalPerDay===0||config.maxInputChars===0||config.tokens[action]===0||(action==='chat'&&(config.chatPerMinute===0||config.chatPerDay===0))||(action==='itinerary'&&config.itinerariesPerDay===0)||(action==='explanation'&&config.explanationsPerTrip===0))throw new UsageProblem('This AI action is disabled by the operator.',{code:'AI_ACTION_DISABLED',operatorRequired:true});}

// This is a durable attempt reservation, not a currency budget. No refunds: even
// a timeout, malformed provider response, or process crash may have incurred cost.
export async function reserveUsage(context,config=usageConfig(),now=Date.now()){
 validateContext(context);ensureEnabled(config,context.action);
 const {uid,action,tripId}=context,day=new Date(now).toISOString().slice(0,10),reset=new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString(),hash=usageUserKey(uid);
 try{
  const {db}=services(),globalRef=db.doc(`aiUsageDays/${day}`),userRef=db.doc(`aiUsageUsers/${hash}`),tripRef=action==='explanation'?db.doc(`aiExplanationUsage/${tripId}`):null;
  return await db.runTransaction(async tx=>{
   const globalSnap=await tx.get(globalRef),userSnap=await tx.get(userRef);
   const oldGlobal=globalSnap.data(),oldUser=userSnap.data();
   if(oldGlobal&&(oldGlobal.day!==day||!Number.isSafeInteger(oldGlobal.attempts)))throw storageError();
   if(oldUser&&(!/^\d{4}-\d{2}-\d{2}$/.test(oldUser.day)||!Array.isArray(oldUser.recentChat)||oldUser.recentChat.length>1000||oldUser.recentChat.some(t=>!Number.isSafeInteger(t)||t<0)))throw storageError();
   const globalCount=oldGlobal?counter(oldGlobal.attempts):0;
   if(oldUser){counter(oldUser.chat);counter(oldUser.itinerary);}
   const user={day,chat:oldUser?.day===day?oldUser.chat:0,itinerary:oldUser?.day===day?oldUser.itinerary:0,recentChat:(oldUser?.recentChat||[]).filter(t=>t>now-60000)};
   let attempts=0;
   if(tripRef){
    const storedTrip=(await tx.get(db.doc(`trips/${tripId}`))).data(),job=(await tx.get(db.doc(`privateReviews/${tripId}`))).data(),storedUsage=(await tx.get(tripRef)).data();
    if(!storedTrip||storedTrip.owner!==uid||!job||job.owner!==uid)throw new UsageProblem('Explanation ownership could not be verified.',{code:'AI_CONTEXT_INVALID',status:503,operatorRequired:true});
    if(storedUsage&&storedUsage.ownerHash!==hash)throw storageError();
    attempts=storedUsage?counter(storedUsage.attempts):0;
    if(job.draft){if(typeof job.draft!=='string'||job.draft.length<10||job.draft.length>400)throw storageError();return {cachedExplanation:job.draft,explanationAttempts:attempts};}
    if(attempts>=config.explanationsPerTrip)throw new UsageProblem('This trip has reached its explanation attempt limit. An operator must review it.',{code:'AI_EXPLANATION_EXHAUSTED',operatorRequired:true});
   }
   if(globalCount>=config.globalPerDay)throw new UsageProblem('The daily AI limit has been reached. Try again after the UTC reset.',{code:'AI_GLOBAL_DAILY_LIMIT',retryAt:reset});
   if(action==='chat'&&user.chat>=config.chatPerDay)throw new UsageProblem('You have reached today’s chat limit. Try again after the UTC reset.',{code:'AI_CHAT_DAILY_LIMIT',retryAt:reset});
   if(action==='itinerary'&&user.itinerary>=config.itinerariesPerDay)throw new UsageProblem('You have reached today’s itinerary limit. Try again after the UTC reset.',{code:'AI_ITINERARY_DAILY_LIMIT',retryAt:reset});
   if(action==='chat'&&user.recentChat.length>=config.chatPerMinute){const sorted=[...user.recentChat].sort((a,b)=>a-b);throw new UsageProblem('Please wait a little before sending another message.',{code:'AI_CHAT_RATE_LIMIT',retryAt:new Date(sorted[sorted.length-config.chatPerMinute]+60000).toISOString()});}
   if(action==='chat'){user.chat++;user.recentChat.push(now);}if(action==='itinerary')user.itinerary++;
   tx.set(globalRef,{day,attempts:globalCount+1});tx.set(userRef,user);
   if(tripRef)tx.set(tripRef,{ownerHash:hash,attempts:attempts+1});
   return {explanationAttempts:tripRef?attempts+1:0};
  });
 }catch(error){if(error instanceof UsageProblem)throw error;throw storageError();}
}
