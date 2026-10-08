export async function requestJson(url,options={},timeoutMs=75000){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetch(url,{...options,signal:controller.signal});
  if(!(response.headers.get('content-type')||'').includes('application/json')){
   const error=new Error(`The server returned an unexpected response (${response.status}). Check that the full app server is running.`);
   if(!response.ok)error.status=response.status;
   throw error;
  }
  const data=await response.json();
  if(!response.ok){
   const retryTime=data.retryAt?new Date(data.retryAt):null;
   const retry=retryTime&&Number.isFinite(+retryTime)?' Try again after '+retryTime.toLocaleString()+'.':'';
   const error=new Error((data.error||'Request failed.')+retry);
   error.status=response.status;
   throw error;
  }
  return data;
 }catch(error){
  if(controller.signal.aborted)throw new Error('The server took too long to respond. A submitted change may still finish; check saved trips before submitting again.');
  throw error;
 }finally{clearTimeout(timer);}
}

// A definite rejection cannot have created a trip. Only an ambiguous response
// warrants checking whether the server completed after the connection dropped.
export function mayHaveSaved(error){return !error.status||error.status>=500||error.status===408;}
