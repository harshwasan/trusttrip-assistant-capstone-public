import test from 'node:test';
import assert from 'node:assert/strict';
import {createLimiter,limiters,rateLimitConfig} from '../server/ratelimit.js';
import {automationReady} from '../server/automation.js';

const run=(mw,req)=>{let out='unset';mw(req,{},e=>{out=e??null;});return out;};

test('fixed window blocks after max and resets after the window',()=>{
 let t=0;const mw=createLimiter({name:'T',max:2,windowMs:1000,key:r=>r.ip,now:()=>t});
 assert.equal(run(mw,{ip:'a'}),null);assert.equal(run(mw,{ip:'a'}),null);
 const blocked=run(mw,{ip:'a'});assert.equal(blocked.status,429);assert.equal(blocked.code,'RATE_LIMIT_T');assert.ok(blocked.retryAt);
 assert.equal(run(mw,{ip:'b'}),null,'other keys are independent');
 t=1000;assert.equal(run(mw,{ip:'a'}),null,'window resets');
});

test('user limits key on the verified uid and split reads from writes',()=>{
 const l=limiters({ipPerMinute:100,ipAiPerMinute:100,userReadsPerMinute:1,userWritesPerMinute:1});
 const get={method:'GET',path:'/trips',identity:{uid:'u1'}},put={method:'PUT',path:'/draft',identity:{uid:'u1'}};
 assert.equal(run(l.userReads,get),null);assert.equal(run(l.userWrites,get),null,'writes limiter ignores reads');
 assert.equal(run(l.userReads,get).status,429);
 assert.equal(run(l.userWrites,put),null);assert.equal(run(l.userWrites,put).status,429);
 assert.equal(run(l.userReads,{...get,identity:{uid:'u2'}}),null,'another user is unaffected');
});

test('per-IP AI limit applies only to AI routes so many accounts on one client share it',()=>{
 const l=limiters({ipPerMinute:100,ipAiPerMinute:1,userReadsPerMinute:100,userWritesPerMinute:100});
 const chat=uid=>({method:'POST',path:'/chat',ip:'9.9.9.9',identity:{uid}});
 assert.equal(run(l.perIpAi,chat('first-account')),null);
 assert.equal(run(l.perIpAi,chat('second-account')).status,429);
 assert.equal(run(l.perIpAi,{method:'PUT',path:'/draft',ip:'9.9.9.9'}),null,'non-AI routes are not counted');
});

test('rate limit configuration rejects invalid values and uses defaults',()=>{
 assert.deepEqual(rateLimitConfig({}),{ipPerMinute:120,ipAiPerMinute:12,userReadsPerMinute:60,userWritesPerMinute:20});
 for(const bad of ['0','-1','1.5','abc','100001'])assert.throws(()=>rateLimitConfig({RATE_LIMIT_IP_PER_MINUTE:bad}));
});

test('automation stays disabled with a short service token',()=>{
 const saved=process.env.AUTOMATION_TOKEN;
 try{process.env.AUTOMATION_TOKEN='short-token';assert.equal(automationReady(),false);}
 finally{process.env.AUTOMATION_TOKEN=saved;}
});
