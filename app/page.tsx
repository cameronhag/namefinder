'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import {
  Search, CheckCircle2, XCircle, Loader2, Globe, AtSign, Shield,
  Zap, Clock, DollarSign, ChevronRight, Sparkles, ArrowLeft,
  AlertTriangle, ExternalLink, Share2, ChevronDown, Check,
  MessageSquare, Mail, X
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DomainEntry { domain: string; available: boolean }

interface DomainApiResult {
  results: DomainEntry[]
  extra: DomainEntry[]
}

interface TrademarkApiResult {
  conflict: boolean
  totalConflicts: number
}

interface SocialEntry { platform: string; available: boolean; exact: boolean }

interface SocialApiResult {
  results: SocialEntry[]
}

interface Results {
  domain: DomainApiResult
  trademark: TrademarkApiResult
  social: SocialApiResult
}

// ─── Constants ────────────────────────────────────────────────────────────────

const categories = [
  'Technology & Software',
  'E-Commerce & Retail',
  'Food & Beverage — Product',
  'Food & Beverage — Restaurant & Hospitality',
  'Health & Wellness',
  'Fashion & Apparel',
  'Finance & Fintech',
  'Other',
]

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(value: string): string {
  if (!value || value.trim() === '') return 'Please enter a business name.'
  if (value.trim().length === 1) return 'Name is too short to return meaningful results.'
  if (value.length > 50) return 'Name must be 50 characters or fewer.'
  if (/^[0-9\s]+$/.test(value.trim())) return 'Numbers only is not a valid business name.'
  if (/[.@#%&/]/.test(value)) return 'Name cannot contain . @ # % & or / characters.'
  return ''
}

// ─── Score helper ─────────────────────────────────────────────────────────────

function computeScore(results: Results): 'good' | 'not-ideal' | 'bad' {
  const comAvailable = results.domain.results.find(d => d.domain.endsWith('.com'))?.available ?? false
  const noTrademark = !results.trademark.conflict
  const socialAvailCount = results.social.results.filter(s => s.available).length

  if (noTrademark && comAvailable && socialAvailCount >= 1) return 'good'
  if (!noTrademark && !comAvailable) return 'bad'
  return 'not-ideal'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

function StatusDot({ available }: { available: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {available && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-red-500'}`} />
    </span>
  )
}

function AvailBadge({ available }: { available: boolean }) {
  return available ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Available
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
      <XCircle className="mr-1 h-3.5 w-3.5" /> Taken
    </span>
  )
}

// ─── Overall Score Card ───────────────────────────────────────────────────────

const scoreConfig = {
  good: {
    icon: CheckCircle2,
    title: 'Great Choice!',
    description: 'This name has strong availability across platforms.',
    bg: 'bg-emerald-50', border: 'border-emerald-200',
    icon_: 'text-emerald-600', title_: 'text-emerald-900', desc_: 'text-emerald-700',
  },
  'not-ideal': {
    icon: AlertTriangle,
    title: 'Proceed with Caution',
    description: 'Some conflicts exist. Review the details below.',
    bg: 'bg-amber-50', border: 'border-amber-200',
    icon_: 'text-amber-600', title_: 'text-amber-900', desc_: 'text-amber-700',
  },
  bad: {
    icon: XCircle,
    title: 'Not Recommended',
    description: 'Significant conflicts found. Consider alternative names.',
    bg: 'bg-red-50', border: 'border-red-200',
    icon_: 'text-red-600', title_: 'text-red-900', desc_: 'text-red-700',
  },
}

function OverallScoreCard({ name, results }: { name: string; results: Results }) {
  const score = computeScore(results)
  const cfg = scoreConfig[score]
  const Icon = cfg.icon
  const noSpaces = name.toLowerCase().replace(/\s+/g, '')

  const items = [
    { label: 'Trademark', available: !results.trademark.conflict },
    { label: '.com domain', available: results.domain.results.find(d => d.domain.endsWith('.com'))?.available ?? false },
    { label: 'Instagram', available: results.social.results.find(s => s.platform === 'Instagram')?.available ?? false },
    { label: 'TikTok', available: results.social.results.find(s => s.platform === 'TikTok')?.available ?? false },
  ]
  const availCount = items.filter(i => i.available).length

  return (
    <div className={`${cfg.bg} ${cfg.border} border-2 rounded-xl p-6`}>
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <div className={`mb-4 rounded-full p-3 sm:mb-0 sm:mr-5 ${cfg.bg}`}>
          <Icon className={`h-10 w-10 ${cfg.icon_}`} />
        </div>
        <div className="flex-1">
          <h2 className={`mb-1 text-2xl font-bold ${cfg.title_}`}>{cfg.title}</h2>
          <p className={`mb-4 text-base ${cfg.desc_}`}>{cfg.description}</p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {items.map(item => (
              <span key={item.label} className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${item.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {item.available ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                {item.label}
              </span>
            ))}
          </div>
          <p className={`mt-4 text-sm font-medium ${cfg.desc_}`}>
            {availCount} of {items.length} available for &ldquo;{name}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Domain Card ─────────────────────────────────────────────────────────────

function DomainCard({ results, showMore, onToggle }: { results: DomainApiResult; showMore: boolean; onToggle: () => void }) {
  const primary = results.results[0]
  const rest = results.results.slice(1)
  const primaryAvail = primary?.available ?? false
  const noSpaces = primary?.domain.replace(/\.[^.]+$/, '') ?? ''
  const godaddyBase = 'https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck='

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">Domain</span>
        </div>
        <AvailBadge available={primaryAvail} />
      </div>

      {/* Primary .com */}
      {primary && (
        <div className={`flex items-center justify-between rounded-lg p-3 mb-3 ${primaryAvail ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2">
            {primaryAvail ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span className={`font-mono text-sm font-medium ${primaryAvail ? 'text-emerald-900' : 'text-red-900'}`}>{primary.domain}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${primaryAvail ? 'text-emerald-700' : 'text-red-700'}`}>
              {primaryAvail ? 'Available' : 'Taken'}
            </span>
            {primaryAvail && (
              <a href={godaddyBase + primary.domain} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">
                Register →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Other TLDs */}
      {rest.length > 0 && (
        <div className="space-y-2 mb-3">
          {rest.map(d => (
            <div key={d.domain} className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600">{d.domain}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium text-xs ${d.available ? 'text-emerald-600' : 'text-red-600'}`}>
                  {d.available ? '✅ Available' : '❌ Taken'}
                </span>
                {d.available && (
                  <a href={godaddyBase + d.domain} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">
                    Register →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extra domains */}
      {results.extra && results.extra.length > 0 && showMore && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-2 mb-2">
          <p className="text-xs text-gray-400 mb-1">More available options</p>
          {results.extra.map(d => (
            <div key={d.domain} className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600">{d.domain}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs text-emerald-600">✅ Available</span>
                <a href={godaddyBase + d.domain} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">
                  Register →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.extra && results.extra.length > 0 && (
        <button onClick={onToggle} className="text-xs text-gray-400 mt-1 underline">
          {showMore ? 'Show fewer domains ↑' : `Show ${results.extra.length} more available domains ↓`}
        </button>
      )}
    </div>
  )
}

// ─── Trademark Card ───────────────────────────────────────────────────────────

function TrademarkCard({ results }: { results: TrademarkApiResult }) {
  const available = !results.conflict
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">Trademark</span>
        </div>
        <AvailBadge available={available} />
      </div>

      {available ? (
        <div>
          <p className="mb-4 text-sm text-gray-500">No conflicting trademarks found in the USPTO database. You can proceed with registration.</p>
          <a
            href="https://www.uspto.gov/trademarks/apply"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            File a trademark <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900 mb-1">Existing trademark conflicts found</p>
          <p className="text-sm text-red-700">
            {results.totalConflicts === 250 ? '250+' : results.totalConflicts} conflict{results.totalConflicts !== 1 ? 's' : ''} in USPTO database
          </p>
          <a
            href="https://tmsearch.uspto.gov/"
            target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            View full details <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Social Card ──────────────────────────────────────────────────────────────

function SocialCard({ results, name }: { results: SocialApiResult; name: string }) {
  const noSpaces = name.toLowerCase().replace(/\s+/g, '')

  const platformLinks: Record<string, string> = {
    Instagram: `https://www.instagram.com/${noSpaces}/`,
    TikTok: `https://www.tiktok.com/@${noSpaces}`,
  }

  const platformIcons: Record<string, React.ReactNode> = {
    Instagram: (
      <div className="rounded-lg p-1.5 text-white bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]">
        <InstagramIcon className="h-4 w-4" />
      </div>
    ),
    TikTok: (
      <div className="rounded-lg p-1.5 text-white bg-black">
        <TikTokIcon className="h-4 w-4" />
      </div>
    ),
  }

  const availCount = results.results.filter(s => s.available).length

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">Social Media Handles</span>
        </div>
        <span className="text-sm text-gray-500">{availCount} of {results.results.length} available</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.results.map(s => {
          const link = platformLinks[s.platform]
          return (
            <div key={s.platform} className={`rounded-lg border p-4 ${s.available ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {platformIcons[s.platform] ?? <AtSign className="h-4 w-4" />}
                  <span className="font-medium text-gray-900">{s.platform}</span>
                </div>
                <StatusDot available={s.available} />
              </div>

              <div className="mb-3">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${s.available ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {s.available
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    : <XCircle className="h-3.5 w-3.5 text-red-600" />
                  }
                  <span className={`font-mono text-sm font-medium ${s.available ? 'text-emerald-800' : 'text-red-800'}`}>
                    @{noSpaces}
                  </span>
                </div>
              </div>

              {s.exact ? (
                s.available ? (
                  <a
                    href={link}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    Claim Handle <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <a
                    href={link}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    View Profile <ExternalLink className="h-3 w-3" />
                  </a>
                )
              ) : (
                <a
                  href={link}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Check manually <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Instagram and TikTok availability must be verified manually via the platform.
      </p>
    </div>
  )
}

// ─── Results View ─────────────────────────────────────────────────────────────

function ResultsView({
  name, results, onNewSearch, showMore, onToggleMore
}: {
  name: string
  results: Results
  onNewSearch: () => void
  showMore: boolean
  onToggleMore: () => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={onNewSearch}
        className="mb-6 -ml-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> New Search
      </button>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Results for &ldquo;{name}&rdquo;
      </h1>

      <div className="space-y-6">
        <OverallScoreCard name={name} results={results} />

        <div className="grid gap-6 md:grid-cols-2">
          <TrademarkCard results={results.trademark} />
          <DomainCard results={results.domain} showMore={showMore} onToggle={onToggleMore} />
        </div>

        <SocialCard results={results.social} name={name} />
      </div>
    </div>
  )
}

  function CategoryDropdown({
  value,
  onChange,
  options,
  isStacked,
}: {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  isStacked: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<HTMLLIElement>(null)

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  // When opening, highlight the current selection and focus the search input.
  // When closing, clear the query so next open starts fresh.
  useEffect(() => {
    if (open) {
      const idx = options.indexOf(value)
      setActiveIndex(Math.max(0, idx))
      inputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [open, options, value])

  // Reset highlight to the top whenever the filter changes
  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [query])

  // Keep the highlighted row scrolled into view as user arrows through
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Smart-flip: decide above or below based on viewport space
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const MENU_MAX = 280
    setPlacement(
      spaceBelow < MENU_MAX && spaceAbove > spaceBelow ? 'top' : 'bottom'
    )
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[activeIndex]) {
        onChange(filtered[activeIndex])
        setOpen(false)
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative shrink-0 ${isStacked ? 'w-full' : 'w-max'}`}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="flex h-14 w-full items-center justify-between rounded-lg bg-gray-100 pl-4 pr-3 text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="whitespace-nowrap">{value}</span>
        <ChevronDown
          className={`ml-2 h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 min-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="w-full rounded-md bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <ul role="listbox" className="max-h-[230px] overflow-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-gray-400">No matches</li>
            ) : (
              filtered.map((opt, idx) => {
                const selected = opt === value
                const active = idx === activeIndex
                return (
                  <li
                    key={opt}
                    ref={active ? activeRef : undefined}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      onChange(opt)
                      setOpen(false)
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${selected ? 'font-medium' : ''}`}
                  >
                    <span className="whitespace-nowrap text-left">{opt}</span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-gray-900" />}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Technology & Software')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState('')
  const [showMoreDomains, setShowMoreDomains] = useState(false)
  const [searchedName, setSearchedName] = useState('')

  // ── auto-sizing select ────────────────────────────────────────────────
  const [isStacked, setIsStacked] = useState(false)

  const [supportOpen, setSupportOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const supportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!supportOpen) return
    const handler = (e: MouseEvent) => {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [supportOpen]) 

  useEffect(() => {
    const check = () => setIsStacked(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleSearch() {
    const validationError = validate(name)
    if (validationError) { setError(validationError); return }

    setError('')
    setLoading(true)
    setResults(null)
    setShowMoreDomains(false)
    setSearchedName(name)

    const [domain, trademark, social] = await Promise.all([
      fetch(`/api/domain?domain=${name}`).then(r => r.json()),
      fetch(`/api/trademark?name=${name}`).then(r => r.json()),
      fetch(`/api/social?name=${name}`).then(r => r.json()),
    ])

    setResults({ domain, trademark, social })
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">NameClaim</span>
            </div>
          </div>
        </header>
        <ResultsView
          name={searchedName}
          results={results}
          onNewSearch={() => { setResults(null); setName(''); setSearchedName('') }}
          showMore={showMoreDomains}
          onToggleMore={() => setShowMoreDomains(v => !v)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">NameClaim</span>
          </div>
          <nav className="hidden items-center justify-center gap-6 md:flex">
            <a href="#how-it-works" onClick={e => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#compare" onClick={e => { e.preventDefault(); document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Compare</a>
          </nav>
          <div ref={supportRef} className="relative">
            <button
              onClick={() => setSupportOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={supportOpen}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Support
            </button>
            {supportOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setSupportOpen(false)
                    setFeedbackOpen(true)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  Give Feedback
                </button>
                <a
                  role="menuitem"
                  href="mailto:support@nameclaim.io"
                  onClick={() => setSupportOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-card px-6 min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0" style={{background: 'radial-gradient(circle at 30% 20%, rgba(100, 220, 210, 0.13) 0%, rgba(120, 200, 230, 0.13) 30%, transparent 55%)'}} />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
            Trusted by 10,000+ entrepreneurs
          </span>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Find the perfect name for your business
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-gray-500">
            Check if your business name is available across trademark, domain, and social media in one search.
          </p>

          {/* Search Form */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your business name..."
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  onKeyDown={handleKeyDown}
                  className="h-14 w-[400px] rounded-lg border-0 bg-gray-100 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <CategoryDropdown
                value={category}
                onChange={setCategory}
                options={categories}
                isStacked={isStacked}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>Get Started <span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'middle' }}>arrow_forward</span></>
                )}
              </button>
            </div>

            {error && <p className="mt-2 text-left text-sm text-red-600">{error}</p>}

            {loading && (
              <div className="mt-4 flex flex-col gap-1 text-sm text-gray-400">
                <p>🔍 Searching trademark database...</p>
                <p>🌐 Checking domain availability...</p>
                <p>📱 Looking up social handles...</p>
              </div>
            )}

            {!loading && (
              <p className="mt-3 text-sm text-gray-400">
                Try: &quot;Acme Solutions&quot;, &quot;TechFlow&quot;, &quot;GreenLeaf&quot;
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600">
              Simple Process
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">How NameClaim Works</h2>
            <p className="mx-auto max-w-2xl text-gray-500">Get comprehensive availability results in seconds, not hours.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Enter Your Name', desc: 'Type in your desired business name and select the relevant category for your industry.', textColor: 'text-blue-600', bgColor: 'bg-blue-100' },
              { step: '02', title: 'Instant Search', desc: 'We simultaneously check USPTO trademark databases, domain registrars, and major social platforms.', textColor: 'text-blue-600', bgColor: 'bg-blue-100' },
              { step: '03', title: 'Get Results', desc: "View a complete availability report showing what's available and what's taken across all platforms.", textColor: 'text-blue-600', bgColor: 'bg-blue-100' },    
            ].map(item => (
              <div key={item.step} className="relative text-center">
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${item.bgColor} ${item.textColor}`}>
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
              Why NameClaim
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Everything You Need to Secure Your Brand</h2>
            <p className="mx-auto max-w-2xl text-gray-500">Protecting your business name is crucial. We make it simple to check everything at once.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Get results in seconds instead of spending hours manually checking each platform one by one.' },
              { icon: Shield, title: 'Trademark Protection', desc: 'Avoid costly legal issues by checking trademark databases before you invest in your brand.' },
              { icon: Globe, title: 'Domain Coverage', desc: 'Check availability across all major TLDs including .com, .io, .co, .app, and more.' },
              { icon: AtSign, title: 'Social Media Handles', desc: 'Ensure consistent branding by checking handle availability on Instagram and TikTok.' },
              { icon: Clock, title: 'Save Time', desc: 'What used to take hours of research now takes seconds. Focus on building your business instead.' },
              { icon: DollarSign, title: 'Save Money', desc: "Avoid rebranding costs by getting it right the first time. Know what's available before you commit." },
            ].map(f => (
              <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <f.icon className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600">
              Comparison
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">NameClaim vs Manual Search</h2>
            <p className="mx-auto max-w-2xl text-gray-500">See how much time and effort you save with NameClaim.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">NameClaim</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">Manual Search</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Time to check all platforms', nc: '~10 seconds', m: '2–3 hours' },
                  { feature: 'Trademark database search', nc: true, m: 'Requires expertise' },
                  { feature: 'Multiple domain TLDs', nc: true, m: 'Check each separately' },
                  { feature: 'Social media handles', nc: true, m: 'Visit each platform' },
                  { feature: 'Unified results view', nc: true, m: false },
                  { feature: 'Instant availability score', nc: true, m: false },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.nc === 'boolean'
                        ? row.nc ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" /> : <XCircle className="mx-auto h-5 w-5 text-red-500" />
                        : <span className="font-medium text-gray-900">{row.nc}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.m === 'boolean'
                        ? row.m ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" /> : <XCircle className="mx-auto h-5 w-5 text-red-500" />
                        : <span className="text-sm text-gray-500">{row.m}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Ready to claim your business name?</h2>
          <p className="mb-8 text-lg text-gray-400">Don&apos;t let someone else take your perfect name. Check availability now for free.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-black hover:bg-gray-100 transition-colors"
          >
            Start Searching <span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'middle' }}>arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">NameClaim</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
            <p className="text-sm text-gray-400">© NameClaim</p>
          </div>
        </div>
      </footer>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  )
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState('general')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, email, message }),
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Give feedback</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-900 font-medium">Thanks for your feedback!</p>
            <p className="text-sm text-gray-500 mt-1">We read every message.</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="general">General feedback</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Leave blank to submit anonymously.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="What's on your mind?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}