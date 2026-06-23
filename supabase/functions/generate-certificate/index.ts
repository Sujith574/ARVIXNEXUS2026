// Deno / Supabase Edge Function to generate certificates using pdf-lib or serverless PDF builders
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { profile_id, type } = await req.json()

    if (!profile_id || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: profile_id, type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // 1. Initialize admin Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 2. Fetch profile details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profile_id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // 3. Render HTML Certificate and print to PDF or generate PDF using standard library
    // In Deno Edge Environment, we can construct the PDF structure or generate an elegant SVG/PDF document.
    // For demo/production integration, we write out the Deno logic that creates a certificate file,
    // uploads it to the 'certificates' storage bucket, and logs it.
    
    const fileName = `${profile_id}_certificate_${Date.now()}.pdf`
    const filePath = `certs/${fileName}`
    
    // We create a mock elegant PDF byte array representing the certificate for sandbox simulation.
    // In full deployment, this is compiled using Playwright/Puppeteer or PDF-Lib.
    const mockPdfBytes = new Uint8Array([
      // Minimal PDF header and file contents
      37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 255, 255, 255, 255, 10, 49, 32, 48, 32, 111, 98, 106, 10
    ])

    // Upload PDF to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, mockPdfBytes, {
        contentType: "application/pdf",
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath)

    const pdfUrl = urlData.publicUrl

    // 4. Save certificate metadata in table
    const { error: dbError } = await supabase
      .from("certificates")
      .insert({
        profile_id,
        type,
        pdf_url: pdfUrl,
        sent_at: new Date().toISOString()
      })

    if (dbError) {
      throw new Error(`Database record insert failed: ${dbError.message}`)
    }

    // 5. Send PDF link to participant's email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "National Hackathon Team <onboarding@resend.dev>",
        to: profile.email,
        subject: `Your National Hackathon e-Certificate is Ready! [${type.toUpperCase()}]`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px;">National Innovation Hackathon</h2>
            <p>Dear <strong>${profile.full_name}</strong>,</p>
            <p>Congratulations on successfully participating in the <strong>Central Government Hybrid Innovation Hackathon</strong>!</p>
            <p>Your official e-Certificate of <strong>${type.toUpperCase()}</strong> has been generated and validated by the Ministry Council.</p>
            
            <p style="margin: 25px 0;">
              <a href="${pdfUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download e-Certificate (PDF)</a>
            </p>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-t: 1px solid #f1f5f9; padding-top: 10px;">
              Ministry of Electronics and Information Technology (MeitY), Government of India.
            </p>
          </div>
        `,
      }),
    })

    const resData = await res.json()

    return new Response(
      JSON.stringify({ success: true, pdfUrl, emailStatus: resData }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    )

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    )
  }
})
