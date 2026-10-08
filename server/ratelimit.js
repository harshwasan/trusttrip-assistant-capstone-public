// Fixed-window request limits for non-AI routes. AI calls keep their durable Firestore
// counters in usage.js; these in-memory windows protect database quota and stop floods.
// Limits are per server instance: N instances allow up to N times the configured rate.
import { Problem } from './domain.js';

const MAX_KEYS=50000;
const configError=key=>new Error(`${key} must be a whole number between 1 and 100000.`);
function limitFrom(env,key,fallback){const raw=env[key];if(raw===undefined||raw==='')return fallback;if(!/^[1-9]\d*$/.test(raw)||Number(raw)>100000)throw configError(key);return Number(raw);}

export function rateLimitConfig(env=process.env){
 return {
  ipPerMinute:limitFrom(env,'RATE_LIMIT_IP_PER_MINUTE',120),
  ipAiPerMinute:limitFrom(env,'RATE_LIMIT_IP_AI_PER_MINUTE',12),
  userReadsPerMinute:limitFrom(env,'RATE_LIMIT_USER_READS_PER_MINUTE',60),
  userWritesPerMinute:limitFrom(env,'RATE_LIMIT_USER_WRITES_PER_MINUTE',20)
 };
}

export function createLimiter({name,max,windowMs=60000,key,now=()=>Date.now()}){
 const hits=new Map();
 return function limiter(req,res,next){
  const id=key(req);
  if(!id)return next();
  const t=now();
  let entry=hits.get(id);
  if(!entry||entry.reset<=t){
   if(!entry&&hits.size>=MAX_KEYS){for(const [k,v] of hits)if(v.reset<=t)hits.delete(k);}
   // Fail closed rather than grow memory without bound under a key-spraying flood.
   if(!entry&&hits.size>=MAX_KEYS)return next(limitProblem(t+windowMs));
   entry={count:0,reset:t+windowMs};hits.set(id,entry);
  }
  entry.count++;
  if(entry.count>max)return next(limitProblem(entry.reset,name));
  next();
 };
}

function limitProblem(reset,name){
 const problem=new Problem(429,'Too many requests. Please wait a moment and try again.');
 problem.code=name?`RATE_LIMIT_${name}`:'RATE_LIMIT';problem.retryAt=new Date(reset).toISOString();problem.operatorRequired=false;
 return problem;
}

const isWrite=req=>!['GET','HEAD','OPTIONS'].includes(req.method);
const isAiRoute=req=>req.method==='POST'&&(req.path==='/chat'||req.path==='/trips');

export function limiters(config=rateLimitConfig()){
 return {
  // Applied to every /api request, including unauthenticated ones and failed sign-ins.
  perIp:createLimiter({name:'IP',max:config.ipPerMinute,key:req=>req.ip}),
  // Extra per-IP cap on AI routes so many free accounts from one client cannot drain the global AI allowance.
  perIpAi:createLimiter({name:'IP_AI',max:config.ipAiPerMinute,key:req=>isAiRoute(req)?req.ip:null}),
  // Per verified user, after authentication: separate read and write budgets.
  userReads:createLimiter({name:'USER_READS',max:config.userReadsPerMinute,key:req=>!isWrite(req)&&req.identity?.uid}),
  userWrites:createLimiter({name:'USER_WRITES',max:config.userWritesPerMinute,key:req=>isWrite(req)&&req.identity?.uid})
 };
}
