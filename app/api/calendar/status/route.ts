import { NextResponse } from "next/server";
import { isCalendarConnected } from "@/lib/googleCalendar";

export async function GET() {
  const connected = await isCalendarConnected();
  return NextResponse.json({ connected });
}
