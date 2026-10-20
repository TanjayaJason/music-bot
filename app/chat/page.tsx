import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";
import { ChatInterface } from "@/components/chat-interface";
export const metadata:Metadata={title:"Tanya AI"};
export default function ChatPage(){return <div className="min-h-screen bg-[#f5f1e9]"><PublicNav/><ChatInterface/></div>}
