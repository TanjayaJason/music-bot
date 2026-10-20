import { describe,expect,it } from "vitest";
import { chatSchema,documentMetadataSchema } from "@/lib/validation/schemas";
describe("validasi API",()=>{it("menolak pertanyaan terlalu pendek",()=>expect(chatSchema.safeParse({message:"x"}).success).toBe(false));it("menolak prioritas sumber di luar batas",()=>expect(documentMetadataSchema.safeParse({title:"Dokumen Uji",category:"Uji",documentType:"mixed",authorityRank:101}).success).toBe(false))});
