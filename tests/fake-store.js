// Test-only serializable store. Writes are staged and committed atomically; failed
// callbacks roll back, and concurrent transactions execute against current state.
export function fakeDB(seed={}){
 const data=new Map(Object.entries(seed).map(([k,v])=>[k,structuredClone(v)]));let queue=Promise.resolve();
 const exclusive=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
 const snapshot=(key,source=data)=>{const exists=source.has(key),value=structuredClone(source.get(key));return {exists,id:key.split('/').at(-1),data:()=>structuredClone(value),ref:db.doc(key)};};
 const put=(source,key,value,merge=false)=>source.set(key,structuredClone(merge?{...source.get(key),...value}:value));
 const readQuery=(query,source)=>({docs:[...source.keys()].filter(k=>k.startsWith(query.prefix+'/')&&k.split('/').length===query.prefix.split('/').length+1&&query.filters.every(f=>{const v=source.get(k)[f.field];return f.op==='in'?f.value.includes(v):f.op==='<='?v<=f.value:v===f.value;})).slice(0,query.limitCount).map(k=>snapshot(k,source))});
 const query=(prefix,filters=[],limitCount=Infinity)=>({prefix,filters,limitCount,where:(field,op,value)=>query(prefix,[...filters,{field,op,value}],limitCount),limit:n=>query(prefix,filters,n),get:()=>exclusive(()=>readQuery({prefix,filters,limitCount},data))});
 const db={
  doc:key=>({path:key,get:()=>exclusive(()=>snapshot(key)),set:(v,o)=>exclusive(()=>put(data,key,v,o?.merge)),update:v=>exclusive(()=>{if(!data.has(key))throw Error('not found');put(data,key,v,true);}),delete:()=>exclusive(()=>data.delete(key))}),
  runTransaction:fn=>exclusive(async()=>{const working=new Map([...data].map(([k,v])=>[k,structuredClone(v)])),writes=[];let wrote=false;const tx={get:async ref=>{if(wrote)throw Error('Transaction reads must precede writes');return ref.path?snapshot(ref.path,working):readQuery(ref,working);},set:(ref,v,o)=>{wrote=true;writes.push(()=>put(working,ref.path,v,o?.merge));},update:(ref,v)=>{wrote=true;writes.push(()=>{if(!working.has(ref.path))throw Error('not found');put(working,ref.path,v,true);});},create:(ref,v)=>{wrote=true;writes.push(()=>{if(working.has(ref.path))throw Error('exists');put(working,ref.path,v);});}};const result=await fn(tx);writes.forEach(fn=>fn());data.clear();for(const [k,v] of working)data.set(k,v);return result;}),
  collection:prefix=>query(prefix),recursiveDelete:ref=>exclusive(()=>{for(const k of data.keys())if(k===ref.path||k.startsWith(ref.path+'/'))data.delete(k);})
 };return {db,data};
}
