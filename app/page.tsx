import type { Metadata } from 'next'
import Gallery from './gallery'

export const metadata: Metadata = {
  other: {
    'base:app_id': '69f185d25db18b50b3cf003a',
  },
}

export default function Page() {
  return <Gallery />
}
