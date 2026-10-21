"use client";

import { useEffect,useRef,useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight,BookOpen,Check,Copy,MessageCircle,RotateCcw,Send,ThumbsDown,ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Citation } from "@/types/database";

type Message={id:string;role:"user"|"assistant";content:string;citations?:Citation[];messageId?:string};
type FeedbackState="helpful"|"not_helpful"|"sending";
type StreamEvent=
  | {type:"meta";sessionId?:string}
  | {type:"delta";content:string}
  | {type:"done";messageId?:string;citations:Citation[]}
  | {type:"error";message:string};
const suggestions=["Apa pedoman pemilihan lagu pembuka?","Apa ketentuan penggunaan Mazmur Tanggapan?","Apa aturan pemilihan lagu persembahan?","Tampilkan sumber ketentuan nyanyian komuni."];

export function ChatInterface(){
  const [messages,setMessages]=useState<Message[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [receivingAnswer,setReceivingAnswer]=useState(false);
  const [sessionId,setSessionId]=useState<string>();
  const [copied,setCopied]=useState<string>();
  const [feedbackState,setFeedbackState]=useState<Record<string,FeedbackState>>({});
  const endRef=useRef<HTMLDivElement>(null);
  const textareaRef=useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth",block:"end"});},[messages,loading]);

  async function ask(question:string){
    if(loading||question.trim().length<3)return;
    const user:{id:string;role:"user";content:string}={id:crypto.randomUUID(),role:"user",content:question.trim()};
    let assistantId:string|undefined;
    setMessages((current)=>[...current,user]);
    setInput("");
    if(textareaRef.current)textareaRef.current.style.height="auto";
    setLoading(true);
    try{
      const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:user.content,sessionId})});
      if(!response.ok){
        const data=await response.json() as {error?:string};
        throw new Error(data.error||"Permintaan gagal.");
      }
      if(!response.body)throw new Error("Layanan tidak mengirimkan jawaban.");

      assistantId=crypto.randomUUID();
      setMessages((current)=>[...current,{id:assistantId!,role:"assistant",content:""}]);

      const reader=response.body.getReader();
      const decoder=new TextDecoder();
      let buffer="";
      const handleEvent=(event:StreamEvent)=>{
        if(event.type==="meta")setSessionId(event.sessionId);
        if(event.type==="delta"){
          setReceivingAnswer(true);
          setMessages((current)=>current.map((message)=>message.id===assistantId?{...message,content:message.content+event.content}:message));
        }
        if(event.type==="done"){
          setMessages((current)=>current.map((message)=>message.id===assistantId?{...message,messageId:event.messageId,citations:event.citations}:message));
        }
        if(event.type==="error")throw new Error(event.message);
      };

      while(true){
        const {done,value}=await reader.read();
        if(done)break;
        buffer+=decoder.decode(value,{stream:true});
        const lines=buffer.split("\n");
        buffer=lines.pop()??"";
        for(const line of lines){if(line.trim())handleEvent(JSON.parse(line) as StreamEvent)}
      }
      buffer+=decoder.decode();
      if(buffer.trim())handleEvent(JSON.parse(buffer) as StreamEvent);
    }catch(error){
      const errorMessage=`Maaf, ${error instanceof Error?error.message:"layanan sedang tidak tersedia."}`;
      setMessages((current)=>assistantId
        ?current.map((message)=>message.id===assistantId?{...message,content:message.content?`${message.content}\n\n_Jawaban terputus. ${errorMessage}_`:errorMessage}:message)
        :[...current,{id:crypto.randomUUID(),role:"assistant",content:errorMessage}]);
    }finally{setLoading(false);setReceivingAnswer(false)}
  }

  async function feedback(messageId:string,rating:"helpful"|"not_helpful"){
    if(feedbackState[messageId])return;
    setFeedbackState((current)=>({...current,[messageId]:"sending"}));
    try{
      const response=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messageId,rating})});
      if(!response.ok)throw new Error();
      setFeedbackState((current)=>({...current,[messageId]:rating}));
    }catch{
      setFeedbackState((current)=>{const next={...current};delete next[messageId];return next});
    }
  }

  async function copyAnswer(message:Message){
    await navigator.clipboard.writeText(message.content);
    setCopied(message.id);
    window.setTimeout(()=>setCopied((current)=>current===message.id?undefined:current),1800);
  }

  function resizeComposer(element:HTMLTextAreaElement){element.style.height="auto";element.style.height=`${Math.min(element.scrollHeight,144)}px`}

  return <main id="main-content" className="shell grid h-[calc(100dvh-var(--header-height))] min-h-[34rem] py-0 sm:min-h-[38rem] sm:py-5 lg:py-8">
    <div className="grid min-h-0 overflow-hidden border-x border-[#ded6c6] bg-white shadow-[0_24px_80px_rgba(59,45,25,.1)] sm:rounded-[2rem] sm:border lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-[#e7e0d4] bg-[#f8f5ee] p-6 lg:flex lg:flex-col"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#6d5130] text-white"><MessageCircle className="size-5"/></span><div><h1 className="font-bold">CHORD</h1><p className="text-xs text-[#7c766d]">Sumber terverifikasi</p></div></div><div className="mt-8"><p className="text-xs font-bold uppercase tracking-wider text-[#8a806e]">Pertanyaan awal</p><div className="mt-3 space-y-2">{suggestions.map((question)=><button type="button" key={question} onClick={()=>ask(question)} className="w-full rounded-xl border border-transparent px-3 py-2.5 text-left text-sm leading-5 text-[#5d574d] transition hover:border-[#ddd2bd] hover:bg-white">{question}</button>)}</div></div><div className="mt-auto rounded-2xl border border-[#e2d8c3] bg-white p-4 text-xs leading-5 text-[#756d61]"><BookOpen className="mb-2 size-4 text-[#967238]"/>Jawaban hanya menggunakan dokumen berstatus terbit.</div></aside>
      <section className="flex min-h-0 flex-col"><div className="flex min-h-16 shrink-0 items-center justify-between border-b border-[#ece6db] px-4 py-3 sm:px-5 lg:px-7"><div><h1 className="font-bold lg:hidden">CHORD</h1><p className="text-xs text-[#7a746c]">Asisten musik liturgi · selalu periksa sumber</p></div>{messages.length>0&&<Button variant="ghost" size="sm" disabled={loading} onClick={()=>{setMessages([]);setSessionId(undefined);setFeedbackState({})}}><RotateCcw className="size-4"/>Baru</Button>}</div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-8" role="log" aria-live="polite" aria-busy={loading}>{messages.length===0?<div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-8 text-center"><span className="grid size-14 place-items-center rounded-3xl bg-[#efe5d1] text-[#775a2c] sm:size-16"><MessageCircle className="size-6 sm:size-7"/></span><h2 className="serif mt-4 text-2xl font-semibold sm:mt-5 sm:text-3xl">Apa yang ingin Anda ketahui?</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#756f65]">Saya akan mencari jawaban dari dokumen Musica Liturgia yang telah diterbitkan. Bila sumber tidak cukup, saya akan mengatakannya tanpa berasumsi.</p><div className="mt-6 grid w-full gap-2 sm:mt-7 sm:grid-cols-2">{suggestions.map((question)=><button type="button" key={question} onClick={()=>ask(question)} className="tap-target rounded-2xl border border-[#e0d7c6] p-3 text-left text-sm text-[#5d5549] transition hover:border-[#cdbd9f] hover:bg-[#faf7f1]">{question}</button>)}</div></div>:<div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">{messages.map((message)=><div key={message.id} className={`message-enter ${message.role==="user"?"flex justify-end":"flex justify-start"}`}><div className={message.role==="user"?"max-w-[90%] rounded-2xl rounded-br-md bg-[#6d5130] px-4 py-3 text-sm leading-6 text-white sm:max-w-[86%]":"max-w-[96%] sm:max-w-[94%]"}>{message.role==="assistant"?<><div className="prose-answer min-h-11 rounded-2xl rounded-bl-md bg-[#f7f3eb] px-4 py-3 text-sm text-[#4f4940] sm:px-5 sm:py-4"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>{loading&&message.id===messages.at(-1)?.id&&<span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[#a61b29] align-middle" aria-hidden="true"/>}</div>{message.citations&&message.citations.length>0&&<details className="mt-2 rounded-xl border border-[#e5dccb] bg-white px-4 py-3"><summary className="cursor-pointer text-xs font-bold text-[#785b2e]">{message.citations.length} sumber dokumen</summary><div className="mt-3 space-y-3">{message.citations.map((citation,citationIndex)=><a key={`${citation.documentId}-${citation.pageStart}-${citation.pageEnd}-${citationIndex}`} href={`/api/documents/${citation.documentId}/preview#page=${citation.pageStart}`} target="_blank" rel="noreferrer" className="group block border-l-2 border-[#c8ae72] pl-3"><p className="flex items-center gap-1 text-xs font-bold group-hover:text-[#a61b29]">{citation.documentTitle} · hlm. {citation.pageStart}{citation.pageEnd!==citation.pageStart?`–${citation.pageEnd}`:""}<ArrowUpRight className="size-3"/></p><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#777066]">{citation.excerpt}</p></a>)}</div></details>}<div className="mt-2 flex min-h-10 items-center gap-1"><Button variant="ghost" size="sm" className="size-10 p-0" aria-label={copied===message.id?"Jawaban disalin":"Salin jawaban"} disabled={loading&&message.id===messages.at(-1)?.id} onClick={()=>copyAnswer(message)}>{copied===message.id?<Check className="size-4 text-emerald-700"/>:<Copy className="size-3.5"/>}</Button>{message.messageId&&feedbackState[message.messageId]&&feedbackState[message.messageId]!=="sending"?<span className="ml-1 flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check className="size-3.5"/>Terima kasih atas masukannya</span>:message.messageId&&<><Button variant="ghost" size="sm" className="size-10 p-0" aria-label="Jawaban membantu" disabled={feedbackState[message.messageId]==="sending"} onClick={()=>feedback(message.messageId!,"helpful")}><ThumbsUp className="size-3.5"/></Button><Button variant="ghost" size="sm" className="size-10 p-0" aria-label="Jawaban tidak membantu" disabled={feedbackState[message.messageId]==="sending"} onClick={()=>feedback(message.messageId!,"not_helpful")}><ThumbsDown className="size-3.5"/></Button></>}</div></>:message.content}</div></div>)}{loading&&!receivingAnswer&&<div className="flex items-center gap-2 text-sm text-[#746d62]" role="status"><span className="size-2 animate-pulse rounded-full bg-[#9b773a]"/><span className="size-2 animate-pulse rounded-full bg-[#9b773a] [animation-delay:150ms]"/><span className="size-2 animate-pulse rounded-full bg-[#9b773a] [animation-delay:300ms]"/>Mencari pada dokumen…</div>}{loading&&receivingAnswer&&<p className="sr-only" role="status">CHORD sedang menyusun jawaban.</p>}<div ref={endRef}/></div>}</div>
        <form onSubmit={(event)=>{event.preventDefault();ask(input)}} className="safe-bottom shrink-0 border-t border-[#ece5da] bg-white p-3 sm:p-4 lg:p-6"><div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-[#d9cfbd] bg-white p-2 shadow-sm transition focus-within:border-[#b4232d] focus-within:ring-2 focus-within:ring-[#fee4e2]"><textarea ref={textareaRef} aria-label="Pertanyaan" rows={1} value={input} onChange={(event)=>{setInput(event.target.value);resizeComposer(event.currentTarget)}} onKeyDown={(event)=>{if(event.key==="Enter"&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();ask(input)}}} placeholder="Tanyakan pedoman atau rekomendasi…" className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-6 outline-none sm:text-sm"/><Button aria-label="Kirim pertanyaan" disabled={loading||input.trim().length<3} className="size-11 shrink-0 p-0"><Send className="size-4"/></Button></div><p className="mt-2 text-center text-[11px] text-[#928b80]">Bukan otoritas resmi. Verifikasi keputusan liturgis kepada pengurus.</p></form>
      </section>
    </div>
  </main>;
}
