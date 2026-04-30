import { Metadata } from 'next'
import Gallery from './gallery'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  other: {
    'base:app_id': '69f2a19c6daaf9236cfba3d9',
  },
}

export default function Home() {
  return <Gallery />
}
