// A shared deadline bounds the whole operation, including backoff.
export async function geminiRequest(url,options,{fetcher=fetch,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),random=Math.random}={}){
 for(let attempt=0;attempt<3;attempt++){
  options.signal?.throwIfAborted();
  const response=await fetcher(url,options);
  if(response.ok||![500,502,503,504].includes(response.status)||attempt===2)return response;
  console.warn('Gemini temporary failure; retry',response.status,attempt+1);
  await response.body?.cancel();
  await wait(1000*2**attempt+Math.floor(random()*250));
 }
}
