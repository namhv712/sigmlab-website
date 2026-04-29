type BadgeKind = 'quartile' | 'core' | 'ccf' | 'type'
type Props = { kind: BadgeKind; value: string | undefined }

const STYLES: Record<string, string> = {
  // quartiles
  Q1: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Q2: 'bg-teal-100 text-teal-900 border-teal-300',
  Q3: 'bg-amber-100 text-amber-900 border-amber-300',
  Q4: 'bg-rose-100 text-rose-900 border-rose-300',
  // CORE
  'A*': 'bg-indigo-100 text-indigo-900 border-indigo-300',
  A: 'bg-blue-100 text-blue-900 border-blue-300',
  B: 'bg-slate-100 text-slate-800 border-slate-300',
  C: 'bg-gray-100 text-gray-700 border-gray-300',
  // CCF — share with CORE A/B/C
  // type
  conference: 'bg-violet-100 text-violet-900 border-violet-300',
  journal: 'bg-sky-100 text-sky-900 border-sky-300',
  workshop: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
  unranked: 'bg-gray-100 text-gray-500 border-gray-200',
}

const LABELS: Record<BadgeKind, string> = {
  quartile: '',
  core: 'CORE ',
  ccf: 'CCF ',
  type: '',
}

export function RankBadge({ kind, value }: Props) {
  if (!value) return <span className="text-gray-400">—</span>
  const style = STYLES[value] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${style}`}>
      {LABELS[kind]}{value}
    </span>
  )
}
