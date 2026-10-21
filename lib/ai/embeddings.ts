import "server-only";

import { getEnv } from "@/lib/config";

type EmbeddingTask = "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT";

const EMBEDDING_DIMENSIONS = 768;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([408,429]);

function retryDelay(response:Response,attempt:number){
  const retryAfter=Number.parseFloat(response.headers.get("retry-after")??"");
  if(Number.isFinite(retryAfter))return Math.min(Math.max(retryAfter*1000,250),2500);
  return 400*2**attempt;
}

function wait(milliseconds:number){return new Promise((resolve)=>setTimeout(resolve,milliseconds))}

async function requestEmbedding(text:string,taskType:EmbeddingTask){
  const env=getEnv();
  if(!env.GEMINI_API_KEY)throw new Error("GEMINI_API_KEY belum dikonfigurasi.");

  let lastStatus:number|undefined;
  let lastDetail="";
  for(let attempt=0;attempt<MAX_ATTEMPTS;attempt+=1){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15_000);
    try{
      const response=await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_EMBEDDING_MODEL)}:embedContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            model:`models/${env.GEMINI_EMBEDDING_MODEL}`,
            content:{parts:[{text:text.slice(0,12_000)}]},
            outputDimensionality:EMBEDDING_DIMENSIONS,
            taskType,
          }),
          signal:controller.signal,
        },
      );

      if(response.ok){
        const result=(await response.json()) as {embedding?:{values?:number[]}};
        if(result.embedding?.values?.length!==EMBEDDING_DIMENSIONS)throw new Error("Dimensi embedding tidak sesuai (diharapkan 768).");
        return result.embedding.values;
      }

      lastStatus=response.status;
      lastDetail=(await response.text()).slice(0,200);
      const retryable=RETRYABLE_STATUS.has(response.status)||response.status>=500;
      if(!retryable||attempt===MAX_ATTEMPTS-1)break;
      await wait(retryDelay(response,attempt));
    }catch(error){
      const retryableNetworkError=error instanceof TypeError||(error instanceof Error&&error.name==="AbortError");
      if(!retryableNetworkError)throw error;
      if(attempt===MAX_ATTEMPTS-1)throw new Error("Layanan embedding tidak merespons setelah beberapa percobaan.");
      await wait(400*2**attempt);
    }finally{
      clearTimeout(timeout);
    }
  }

  if(lastStatus===429)throw new Error("Kuota embedding Gemini sedang habis. Coba lagi setelah kuota direset.");
  throw new Error(`Embedding gagal (${lastStatus??"tidak diketahui"}): ${lastDetail||"layanan tidak tersedia"}`);
}

export function createEmbedding(text:string):Promise<number[]>{
  return requestEmbedding(text,"RETRIEVAL_QUERY");
}

export function createDocumentEmbedding(text:string):Promise<number[]>{
  return requestEmbedding(text,"RETRIEVAL_DOCUMENT");
}
