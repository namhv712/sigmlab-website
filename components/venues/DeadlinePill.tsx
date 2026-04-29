import { urgencyTier } from '@/lib/venues/utils'

type Props = { daysUntil: number | undefined; rolling?: boolean }

const TIER_STYLES = {
  past: 'bg-slate-100 text-slate-600 border-slate-200',
  critical: 'bg-red-100 text-red-900 border-red-300',
  soon: 'bg-amber-100 text-amber-900 border-amber-300',
  upcoming: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  far: 'bg-blue-50 text-blue-900 border-blue-200',
}

export function DeadlinePill({ daysUntil, rolling }: Props) {
  if (rolling) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold bg-sky-50 text-sky-900 border-sky-200">
        Rolling
      </span>
    )
  }
  if (daysUntil === undefined) {
    return <span className="text-gray-400 text-xs">no upcoming</span>
  }
  const tier = urgencyTier(daysUntil)
  let label: string
  if (daysUntil === 0) label = 'Today'
  else if (daysUntil > 0) label = `${daysUntil}d left`
  else label = `${-daysUntil}d ago`

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${TIER_STYLES[tier]}`}>
      {label}
    </span>
  )
}
