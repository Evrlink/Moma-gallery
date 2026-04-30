import { Metadata } from 'next'
import Gallery from './gallery'

export const metadata: Metadata = {
  other: {
    'base:app_id': '69f2a19c6daaf9236cfba3d9',
  },
}

export default function Home() {
  return <Gallery />
}
