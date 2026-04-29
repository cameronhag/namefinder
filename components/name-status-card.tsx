import { Check, X, Globe } from 'lucide-react'

type Status = 'available' | 'taken' | 'review'

const results: { label: string; status: Status }[] = [
  { label: 'Trademark', status: 'review' },
  { label: 'Domain (.com)', status: 'available' },
  { label: 'LinkedIn', status: 'available' },
  { label: 'Instagram', status: 'taken' },
  { label: 'TikTok', status: 'available' },
]

const statusStyles: Record<Status, string> = {
  available: 'text-green-600 bg-green-50',
  taken: 'text-red-600 bg-red-50',
  review: 'text-yellow-600 bg-yellow-50',
}

const statusText: Record<Status, string> = {
  available: 'Available',
  taken: 'Taken',
  review: '2+ Conflicts Found',
}

export function NameStatusCard() {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-7 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#297134]/10">
            <Globe className="h-5 w-5 text-[#297134]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Name Status</h2>
            <p className="text-sm text-gray-500">yourbrand</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          Live Check
        </div>
      </div>

      <div className="space-y-3">
        {results.map(item => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5"
          >
            <span className="text-sm text-gray-700">{item.label}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[item.status]}`}
            >
              {item.status === 'available' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              {item.status === 'taken' && <X className="h-3.5 w-3.5" strokeWidth={3} />}
              {statusText[item.status]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">3 / 5 available to claim</span>
        <button className="rounded-lg bg-[#297134] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1f5527]">
          Claim Name
        </button>
      </div>
    </div>
  )
}
