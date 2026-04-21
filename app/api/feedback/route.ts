import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { type, email, message } = await req.json()

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const typeLabel: Record<string, string> = {
      general: 'General feedback',
      bug: 'Bug report',
      feature: 'Feature request',
    }

    const { error } = await resend.emails.send({
      from: 'NameClaim Feedback <onboarding@resend.dev>',
      to: 'haghighatcameron@gmail.com', // ← change this to wherever you want feedback to land
      replyTo: email || undefined,
      subject: `[NameClaim] ${typeLabel[type] || 'Feedback'}`,
      text: [
        `Type: ${typeLabel[type] || type}`,
        `From: ${email || 'anonymous'}`,
        '',
        message,
      ].join('\n'),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Feedback route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}