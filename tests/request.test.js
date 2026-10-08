import test from 'node:test';
import assert from 'node:assert/strict';
import {requestJson,mayHaveSaved} from '../src/request.js';

test('quota rejection is immediate and does not trigger saved-trip recovery',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({error:'Daily limit reached.'},{status:429});};
 try{await assert.rejects(requestJson('/api/trips'),error=>{
  assert.equal(error.status,429);assert.equal(mayHaveSaved(error),false);return true;
 });assert.equal(calls,1);}finally{globalThis.fetch=original;}
});
test('stalled API request times out and permits saved-trip recovery without resubmitting',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
 try{await assert.rejects(requestJson('/api/trips',{},20),error=>{
  assert.match(error.message,/took too long/);assert.equal(mayHaveSaved(error),true);return true;
 });}finally{globalThis.fetch=original;}
});
test('HTML from a misconfigured server is reported instead of parsed as JSON',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response('<html>wrong server</html>',{headers:{'Content-Type':'text/html'}});
 try{await assert.rejects(requestJson('/api/config'),/full app server/);}finally{globalThis.fetch=original;}
});
