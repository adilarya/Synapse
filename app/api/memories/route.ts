import { NextResponse } from "next/server";
import { getRecentMemories } from "@/lib/xtrace";

export const runtime = "nodejs";

export async function GET() {
  const memories = await getRecentMemories();
  return NextResponse.json({ memories });
}
