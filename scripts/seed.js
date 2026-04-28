const { Redis } = require('@upstash/redis')
const fs = require('fs')
const https = require('https')

const env = fs.readFileSync('.env.local','utf-8')
env.split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&v.length)process.env[k.trim()]=v.join('=').trim().replace(/"/g,'')})

const redis = new Redis({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN})

function download(url){
  return new Promise((resolve,reject)=>{
    https.get(url,{headers:{'User-Agent':'Mozilla/5.0'}},(res)=>{
      if(res.statusCode===301||res.statusCode===302) return download(res.headers.location).then(resolve).catch(reject)
      let data=''
      res.on('data',chunk=>data+=chunk)
      res.on('end',()=>resolve(data))
      res.on('error',reject)
    }).on('error',reject)
  })
}

async function seed(){
  console.log('Downloading MoMA data...')
  const raw = await download('https://raw.githubusercontent.com/CodeDotJS/MoMA/master/artworks.json')
  const artworks = JSON.parse(raw)
  const withImages = artworks.filter(a=>a.Thumbnail&&a.Thumbnail.includes('moma.org')&&a.Title&&a.Artist)
  console.log('With images:', withImages.length)
  const selected = withImages.sort(()=>Math.random()-0.5).slice(0,500)
  console.log('Clearing old data...')
  const oldIds = await redis.smembers('artwork:ids')
  if(oldIds.length){
    const p = redis.pipeline()
    oldIds.forEach(id=>p.del('artwork:'+id))
    p.del('artwork:ids')
    await p.exec()
  }
  console.log('Loading 500 artworks...')
  const pipeline = redis.pipeline()
  selected.forEach(a=>{
    pipeline.set('artwork:'+a.ObjectID, JSON.stringify({id:a.ObjectID,title:a.Title,artist:a.Artist,year:a.Year||'',medium:a.Details&&a.Details.Medium||'',department:a.Details&&a.Details.Department||'',imageUrl:a.Thumbnail}))
    pipeline.sadd('artwork:ids', String(a.ObjectID))
  })
  await pipeline.exec()
  console.log('Done! 500 random artworks loaded.')
}

seed().catch(console.error)
