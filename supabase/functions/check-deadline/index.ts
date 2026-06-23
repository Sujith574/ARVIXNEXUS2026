// Deno / Supabase Edge Function to check hackathon submission deadline
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const HACKATHON_DEADLINE = new Date("2026-07-31T23:59:59Z")

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const now = new Date()
  const isPast = now > HACKATHON_DEADLINE

  const responseBody = {
    current_time: now.toISOString(),
    deadline: HACKATHON_DEADLINE.toISOString(),
    is_open: !isPast,
    time_remaining_ms: isPast ? 0 : HACKATHON_DEADLINE.getTime() - now.getTime(),
  }

  return new Response(
    JSON.stringify(responseBody),
    { 
      status: 200, 
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      } 
    }
  )
})
