import { Suspense } from 'react'
import venuesData from '@/data/venues.json'
import { VenuesDatasetSchema } from '@/lib/venues/schema'
import { enrichVenue } from '@/lib/venues/utils'
import VenuesClient from './VenuesClient'

export const metadata = {
  title: 'Venues — SigM Lab',
  description: 'Computer vision journals, conferences, and workshops with rankings and submission deadlines.',
}

export default function VenuesPage() {
  // Validate at build time. Fails the build with a useful error if data is malformed.
  const dataset = VenuesDatasetSchema.parse(venuesData)
  const enriched = dataset.venues.map(enrichVenue)
  return (
    <Suspense fallback={<div className="page-container"><h1 className="page-title">Computer Vision Venues</h1></div>}>
      <VenuesClient venues={enriched} generatedAt={dataset.generatedAt} />
    </Suspense>
  )
}
