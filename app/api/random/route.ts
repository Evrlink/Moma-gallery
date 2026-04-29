import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
})

const EXCLUDED = ['Photography']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = parseInt(searchParams.get('count') || '20')
  const id = searchParams.get('id')

  if (id) {
    const artwork = await redis.get(`artwork:${id}`)
    return Response.json(artwork)
  }

  const allIds = await redis.smembers('artwork:ids')
  const shuffled = allIds.sort(() => Math.random() - 0.5)
  
  const artworks = []
  for (const artId of shuffled) {
    if (artworks.length >= count) break
    const artwork = await redis.get(`artwork:${artId}`) as any
    if (artwork && !EXCLUDED.includes(artwork.department)) {
      artworks.push(artwork)
    }
  }

  return Response.json(artworks)
}