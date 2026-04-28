import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = parseInt(searchParams.get('count') || '20')
  const id = searchParams.get('id')

  if (id) {
    const artwork = await redis.get(`artwork:${id}`)
    return Response.json(artwork)
  }

  const allIds = await redis.smembers('artwork:ids')
  const shuffled = allIds.sort(() => Math.random() - 0.5).slice(0, count)
  const artworks = await Promise.all(
    shuffled.map(id => redis.get(`artwork:${id}`))
  )
  return Response.json(artworks.filter(Boolean))
}
