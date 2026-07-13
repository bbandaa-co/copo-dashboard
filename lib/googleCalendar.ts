import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TokenRow {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id: string;
}

async function getStoredTokens(): Promise<TokenRow | null> {
  const { data } = await supabaseAdmin
    .from("google_calendar_tokens")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data;
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh Google access token");
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

async function getValidAccessToken(): Promise<{
  accessToken: string;
  calendarId: string;
} | null> {
  const tokens = await getStoredTokens();
  if (!tokens) return null;

  const expiresAt = new Date(tokens.expires_at).getTime();
  const isExpired = expiresAt - Date.now() < 60_000;

  if (!isExpired) {
    return { accessToken: tokens.access_token, calendarId: tokens.calendar_id };
  }

  const refreshed = await refreshAccessToken(tokens.refresh_token);
  const newExpiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000
  ).toISOString();

  await supabaseAdmin
    .from("google_calendar_tokens")
    .update({ access_token: refreshed.access_token, expires_at: newExpiresAt })
    .eq("id", 1);

  return { accessToken: refreshed.access_token, calendarId: tokens.calendar_id };
}

export async function isCalendarConnected(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return !!tokens;
}

export async function createCalendarEvent(input: {
  title: string;
  date: string;
}): Promise<string | null> {
  const auth = await getValidAccessToken();
  if (!auth) return null;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      auth.calendarId
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        start: { date: input.date },
        end: { date: input.date },
      }),
    }
  );

  if (!res.ok) {
    console.error("Google Calendar event creation failed", await res.text());
    return null;
  }

  const event = await res.json();
  return event.id as string;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = await getValidAccessToken();
  if (!auth) return;

  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      auth.calendarId
    )}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    }
  );
}
