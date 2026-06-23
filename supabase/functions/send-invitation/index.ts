// Deno / Supabase Edge Function to send invitation email using Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { email, code, invitee_name, type } = await req.json()

    if (!email || !code || !invitee_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, code, invitee_name" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "National Launch & Hackathon <onboarding@resend.dev>", // Or verified domain
        to: email,
        subject: `Exclusive Invitation: Central Launch Event & Hackathon [Code: ${code}]`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-lg;">
            <h2 style="color: #1d4ed8; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Official Government Invitation</h2>
            <p>Dear <strong>${invitee_name}</strong>,</p>
            <p>You have been extended an exclusive invitation to attend the upcoming <strong>Central Government Launch Event & National Hybrid Hackathon</strong> at Vigyan Bhawan, New Delhi.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #1d4ed8; margin: 20px 0;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Invitation Type</span><br/>
              <span style="font-size: 16px; font-weight: bold; color: #1e293b;">${type.toUpperCase()} Access Tier</span><br/><br/>
              
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Unique Access Code</span><br/>
              <span style="font-size: 24px; font-family: monospace; font-bold; color: #1d4ed8; letter-spacing: 2px;">${code}</span>
            </div>
            
            <p>Please claim your entry e-ticket and secure QR code by visiting our RSVP portal:</p>
            <p><a href="http://your-hackathon.gov.in/event/rsvp" style="background-color: #1d4ed8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirm Attendance RSVP</a></p>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-t: 1px solid #f1f5f9; pt: 10px;">
              This is an official communication from the Ministry of Electronics and Information Technology (MeitY), Government of India.
            </p>
          </div>
        `,
      }),
    })

    const resData = await res.json()
    return new Response(JSON.stringify(resData), {
      status: res.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }
})
