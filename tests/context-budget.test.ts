import { describe,expect,it } from "vitest";
import { estimateTokenCount,fitSourcesToContextBudget } from "@/lib/rag/context-budget";
import type { RetrievalResult } from "@/types/database";

function source(index:number,content:string):RetrievalResult{return {documentId:String(index),documentTitle:`Dokumen ${index}`,pageStart:index,pageEnd:index,sectionTitle:null,excerpt:content.slice(0,80),content,score:1-index/100,metadata:{}}}

describe("anggaran konteks",()=>{
  it("membatasi jumlah sumber terbaik",()=>{
    const result=fitSourcesToContextBudget(Array.from({length:7},(_,index)=>source(index,"Pedoman singkat.")),3200,4);
    expect(result).toHaveLength(4);
    expect(result.map((item)=>item.documentId)).toEqual(["0","1","2","3"]);
  });

  it("memotong isi agar tetap di dalam anggaran token",()=>{
    const result=fitSourcesToContextBudget([source(1,"kata ".repeat(5000))],300,4);
    expect(result).toHaveLength(1);
    expect(result[0].content.endsWith("…")).toBe(true);
    expect(estimateTokenCount(result[0].content)).toBeLessThan(300);
  });
});
