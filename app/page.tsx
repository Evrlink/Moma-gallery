import { Metadata } from 'next'
import Gallery from './gallery'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  other: {
    'base:app_id': '69f185d25db18b50b3cf003a',
  },
}

export default function Home() {
  return <Gallery />
}
