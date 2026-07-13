import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/googleCalendar";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const { milestoneId, title, date, projectName } = await request.json();

  const eventId = await createCalendarEvent({
    title: `${projectName}: ${title}`,
    date,
  });

  if (eventId) {
    await supabaseAdmin
      .from("timeline_milestones")
      .update({ gcal_event_id: eventId })
      .eq("id", milestoneId);
  }

  return NextResponse.json({ pushed: !!eventId, eventId });
}

export async function DELETE(request: NextRequest) {
  const { eventId } = await request.json();
  if (eventId) await deleteCalendarEvent(eventId);
  return NextResponse.json({ ok: true });
}
