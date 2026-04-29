import type { Metadata } from 'next'
import Gallery from './gallery'

export const metadata: Metadata = {
  other: {
    'base:app_id': '69f1764f31e06432df038312',
  },
}

export default function Page() {
  return <Gallery />
}
