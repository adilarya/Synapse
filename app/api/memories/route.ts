import { NextResponse } from "next/server";
import type { MemoryItem } from "@/lib/types";

// TODO(eshwar): wire to xtrace.getRecentMemories() (falls back to memoryFallback).

export async function GET() {
  const memories: MemoryItem[] = [];
  return NextResponse.json({ memories });
}
