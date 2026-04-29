import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || ''
  const artist = searchParams.get('artist') || ''
  const year = searchParams.get('year') || ''

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Write 3 complete sentences about this artwork for a gallery visitor. No markdown, no hashtags, no bold, do not repeat the title.\n\nTitle: ${title}\nArtist: ${artist}\nYear: ${year}`
        }]
      })
    })
    const data = await response.json()
    let text = data.content?.[0]?.text || 'No description available.'
    text = text.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim()
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []
    const description = sentences.slice(0, 3).join(' ').trim()
    return NextResponse.json({ description })
  } catch {
    return NextResponse.json({ description: 'No description available.' })
  }
}