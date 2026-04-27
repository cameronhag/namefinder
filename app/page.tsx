'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import {
  Search, CheckCircle2, XCircle, Loader2, Globe, AtSign, Shield,
  Zap, Clock, DollarSign, ChevronRight, Sparkles,
  AlertTriangle, ExternalLink, Share2, ChevronDown, Check,
  MessageSquare, Mail, X, Lock
} from 'lucide-react'
import posthog from 'posthog-js'
import { namecheapUrl } from '@/lib/affiliates'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DomainEntry { domain: string; available: boolean }

interface DomainApiResult {
  results: DomainEntry[]
  extra: DomainEntry[]
}

interface TrademarkConflict {
  name: string
  status: string
  owner: string
  serialNumber: string
}

interface TrademarkApiResult {
  name: string
  conflict: boolean
  totalConflicts: number
  similarCount: number
  conflicts: TrademarkConflict[]
}

interface InstagramProfile {
  username: string
  fullName: string
  biography: string
  profilePicUrl: string
  isPrivate: boolean
  followerCount: number
  postCount: number
}

interface SocialEntry {
  platform: string
  available: boolean
  exact: boolean
  profile?: InstagramProfile
}

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

const SIGNUP_URLS: Record<string, string> = {
  Instagram: 'https://www.instagram.com/accounts/emailsignup/',
  LinkedIn: 'https://www.linkedin.com/company/setup/new/',
  TikTok: 'https://www.tiktok.com/signup',
}

function getSocialActionUrl(platform: string, profileUrl: string, available: boolean): string {
  if (available) return SIGNUP_URLS[platform] ?? profileUrl
  return profileUrl
}

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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toString()
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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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

// ─── Verdict ──────────────────────────────────────────────────────────────────

type Verdict = 'green' | 'caution' | 'stop'

function computeVerdict(
  trademark: { conflict: boolean } | null,
  domainComAvailable: boolean | null
): { verdict: Verdict; headline: string; reason: string } {
  if (trademark?.conflict) {
    return {
      verdict: 'stop',
      headline: 'Not recommended',
      reason: "There's a live trademark conflict. Using this name risks a cease-and-desist.",
    }
  }
  if (domainComAvailable === false) {
    return {
      verdict: 'caution',
      headline: 'Proceed with caution',
      reason: "Trademark looks clear, but the .com is taken — your customers will get lost.",
    }
  }
  if (trademark && !trademark.conflict && domainComAvailable) {
    return {
      verdict: 'green',
      headline: 'Green light',
      reason: 'No trademark conflicts and the .com is available. This name is yours to take.',
    }
  }
  return {
    verdict: 'caution',
    headline: 'Still checking',
    reason: 'Waiting on results…',
  }
}

function VerdictHero({
  trademark,
  domainComAvailable,
}: {
  trademark: { conflict: boolean } | null
  domainComAvailable: boolean | null
}) {
  const { verdict, headline, reason } = computeVerdict(trademark, domainComAvailable)
  const styles = {
    green: 'bg-green-50 border-green-200 text-green-900',
    caution: 'bg-amber-50 border-amber-200 text-amber-900',
    stop: 'bg-red-50 border-red-200 text-red-900',
  }[verdict]
  const dot = {
    green: 'bg-green-500',
    caution: 'bg-amber-500',
    stop: 'bg-red-500',
  }[verdict]
  return (
    <div className={`rounded-2xl border p-6 mb-6 ${styles}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} />
        <h2 className="text-2xl font-semibold">{headline}</h2>
      </div>
      <p className="text-sm opacity-80">{reason}</p>
    </div>
  )
}

// ─── Domain Card ─────────────────────────────────────────────────────────────

function DomainCard({ results, showMore, onToggle, hasTrademarkConflict }: { results: DomainApiResult; showMore: boolean; onToggle: () => void; hasTrademarkConflict?: boolean }) {
  const primary = results.results[0]
  const rest = results.results.slice(1)
  const primaryAvail = primary?.available ?? false

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
              <a
                href={namecheapUrl(primary.domain)}
                target="_blank"
                rel="noopener sponsored"
                className="text-xs text-[#297134] underline"
                onClick={() => posthog.capture('domain_register_clicked', {
                  name: primary.domain,
                  tld: primary.domain.match(/\.[a-z]+$/i)?.[0] ?? 'unknown',
                  affiliate_network: 'impact',
                  sub_id: primary.domain,
                })}
              >
                Register →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Other TLDs — hidden on trademark conflict since same-root variants inherit the problem */}
      {!hasTrademarkConflict && rest.length > 0 && (
        <div className="space-y-2 mb-3">
          {rest.map(d => (
            <div key={d.domain} className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600">{d.domain}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium text-xs ${d.available ? 'text-emerald-600' : 'text-red-600'}`}>
                  {d.available ? '✅ Available' : '❌ Taken'}
                </span>
                {d.available && (
                  <a
                    href={namecheapUrl(d.domain)}
                    target="_blank"
                    rel="noopener sponsored"
                    className="text-xs text-[#297134] underline"
                    onClick={() => posthog.capture('domain_register_clicked', {
                      name: d.domain,
                      tld: d.domain.match(/\.[a-z]+$/i)?.[0] ?? 'unknown',
                      affiliate_network: 'impact',
                      sub_id: d.domain,
                    })}
                  >
                    Register →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extra TLDs */}
      {!hasTrademarkConflict && results.extra && results.extra.length > 0 && showMore && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-2 mb-2">
          <p className="text-xs text-gray-400 mb-1">More available options</p>
          {results.extra.map(d => (
            <div key={d.domain} className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600">{d.domain}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs text-emerald-600">✅ Available</span>
                <a
                  href={namecheapUrl(d.domain)}
                  target="_blank"
                  rel="noopener sponsored"
                  className="text-xs text-[#297134] underline"
                  onClick={() => posthog.capture('domain_register_clicked', {
                    name: d.domain,
                    tld: d.domain.match(/\.[a-z]+$/i)?.[0] ?? 'unknown',
                    affiliate_network: 'impact',
                    sub_id: d.domain,
                  })}
                >
                  Register →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasTrademarkConflict && results.extra && results.extra.length > 0 && (
        <button onClick={onToggle} className="text-xs text-gray-400 mt-1 underline">
          {showMore ? 'Show fewer domains ↑' : `Show ${results.extra.length} more available domains ↓`}
        </button>
      )}
    </div>
  )
}

// ─── Trademark Card ───────────────────────────────────────────────────────────

function TrademarkCard({ data }: { data: TrademarkApiResult }) {
  if (!data.conflict) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <span className="text-lg font-semibold text-gray-900">Trademark</span>
          </div>
          <AvailBadge available={true} />
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="font-[550] text-green-900">No conflicts found</p>
          </div>
          <a
            href="https://www.uspto.gov/trademarks/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 underline"
          >
            File a trademark <ExternalLink className="h-3 w-3" />
          </a>
          {data.similarCount > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              {data.similarCount}+ similar marks found (not exact matches)
            </p>
          )}
        </div>
      </div>
    )
  }

  const primaryConflict = data.conflicts[0]
  const otherCount = Math.max(0, data.totalConflicts - 1) + data.similarCount

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">Trademark</span>
        </div>
        <AvailBadge available={false} />
      </div>

      <div className="space-y-3">
        {primaryConflict && (
          <a
            href={`https://tmsearch.uspto.gov/search/search-results/${primaryConflict.serialNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:shadow-sm transition"
            onClick={() => posthog.capture('trademark_conflict_opened', { name: data.name, conflicting_mark: primaryConflict.name })}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-[550] text-gray-900 truncate">{primaryConflict.name}</p>
                <p className="text-sm text-gray-600 truncate">Owned by {primaryConflict.owner}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  primaryConflict.status.toLowerCase().includes('live')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {primaryConflict.status}
              </span>
            </div>
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Social Card ──────────────────────────────────────────────────────────────

function SocialCard({ results, name }: { results: SocialApiResult; name: string }) {
  const noSpaces = name.toLowerCase().replace(/\s+/g, '')

  const platformLinks: Record<string, string> = {
    Instagram: `https://www.instagram.com/${noSpaces}/`,
    TikTok: `https://www.tiktok.com/@${noSpaces}`,
    LinkedIn: `https://www.linkedin.com/company/${noSpaces}`,
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
    LinkedIn: (
      <div className="rounded-lg p-1.5 text-white bg-[#0A66C2]">
        <LinkedInIcon className="h-4 w-4" />
      </div>
    ),
  }

  const availCount = results.results.filter(s => s.available).length

  // Lazy-load LinkedIn profile (API is slow; don't block initial results)
  const [linkedinProfile, setLinkedinProfile] = useState<InstagramProfile | null>(null)
  const [loadingLinkedinProfile, setLoadingLinkedinProfile] = useState(false)
  const linkedinTaken = results.results.some(s => s.platform === 'LinkedIn' && !s.available && s.exact)

  useEffect(() => {
    if (!linkedinTaken) {
      setLinkedinProfile(null)
      return
    }
    setLoadingLinkedinProfile(true)
    fetch(`/api/linkedin-profile?handle=${encodeURIComponent(noSpaces)}`)
      .then(r => r.json())
      .then(data => setLinkedinProfile(data.profile || null))
      .catch(() => setLinkedinProfile(null))
      .finally(() => setLoadingLinkedinProfile(false))
  }, [linkedinTaken, noSpaces])

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
          const profileUrl = platformLinks[s.platform]
          const signupUrl = SIGNUP_URLS[s.platform] ?? profileUrl
          const effectiveProfile = s.platform === 'LinkedIn' ? linkedinProfile : s.profile
          const isLoadingProfile = s.platform === 'LinkedIn' && loadingLinkedinProfile

          return (
            <div key={s.platform} className={`rounded-lg border p-4 ${s.available ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {platformIcons[s.platform] ?? <AtSign className="h-4 w-4" />}
                  <span className="font-medium text-gray-900">{s.platform}</span>
                </div>
                <AvailBadge available={s.available} />
              </div>

              {!s.available && isLoadingProfile && !effectiveProfile && (
                <div className="mb-3 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-gray-100" />
                  <div className="min-w-0 flex-1 space-y-2 py-1">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              )}

              {!s.available && effectiveProfile && (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {effectiveProfile.profilePicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/image-proxy?url=${encodeURIComponent(effectiveProfile.profilePicUrl)}`}
                      alt={effectiveProfile.fullName || effectiveProfile.username}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-full border border-gray-200 bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {effectiveProfile.fullName || effectiveProfile.username}
                      </span>
                      {effectiveProfile.isPrivate && <Lock className="h-3 w-3 shrink-0 text-gray-500" />}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCount(effectiveProfile.followerCount)} followers · {formatCount(effectiveProfile.postCount)} {s.platform === 'LinkedIn' ? 'employees' : 'posts'}
                    </div>
                    {effectiveProfile.biography && (
                      <div className={`text-xs text-gray-600 leading-snug ${s.platform === 'LinkedIn' ? 'whitespace-pre-line' : 'line-clamp-2'}`}>{effectiveProfile.biography}</div>
                    )}
                  </div>
                </a>
              )}

              {s.exact ? (
                s.available ? (
                  <a
                    href={signupUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                    onClick={() => posthog.capture('social_claim_clicked', { platform: s.platform.toLowerCase(), name: noSpaces })}
                  >
                    Claim Handle <ExternalLink className="h-3 w-3" />
                  </a>
                ) : !effectiveProfile && !isLoadingProfile ? (
                  <a
                    href={profileUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    View Profile <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null
              ) : (
                <a
                  href={profileUrl}
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
    </div>
  )
}

// ─── Results View ─────────────────────────────────────────────────────────────

function ResultsView({
  name, category, results, showMore, onToggleMore,
}: {
  name: string
  category: string
  results: Results
  showMore: boolean
  onToggleMore: () => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Results for &ldquo;{name}&rdquo;
      </h1>

      <div className="space-y-10">
        <VerdictHero
          trademark={results.trademark}
          domainComAvailable={results.domain?.results?.find(d => d.domain.endsWith('.com'))?.available ?? null}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <TrademarkCard
            data={results.trademark}
          />
          <DomainCard
            results={results.domain}
            showMore={showMore}
            onToggle={onToggleMore}
            hasTrademarkConflict={results.trademark.conflict}
          />
        </div>

        <SocialCard
          results={results.social}
          name={name}
        />
      </div>
    </div>
  )
}

function CategoryDropdown({
  value,
  onChange,
  options,
  isStacked,
  compact = false,
}: {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  isStacked: boolean
  compact?: boolean
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
        posthog.capture('category_changed', { from: value, to: filtered[activeIndex] })
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
        className={`flex w-full items-center justify-between gap-2 rounded-lg bg-gray-100 pl-4 pr-3 text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${compact ? 'h-12 text-sm' : 'h-14'}`}
        >
        <span className="whitespace-nowrap">{value}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
                      posthog.capture('category_changed', { from: value, to: opt })
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

    const trimmedName = name.trim()
    posthog.capture('search_performed', {
      name: trimmedName,
      name_length: trimmedName.length,
      has_spaces: trimmedName.includes(' '),
      category,
    })

    setError('')
    setLoading(true)
    setShowMoreDomains(false)

    try {
      const [domain, trademark, social] = await Promise.all([
        fetch(`/api/domain?domain=${name}`).then(r => r.json()),
        fetch(`/api/trademark?name=${name}`).then(r => r.json()),
        fetch(`/api/social?name=${name}`).then(r => r.json()),
      ])

      setResults({ domain, trademark, social })
      setSearchedName(name)

      const socials: SocialEntry[] = social.results || []
      const socialsAvailable = socials.filter(s => s.available)
      posthog.capture('search_completed', {
        name: trimmedName,
        domain_available: domain.results?.[0]?.available ?? false,
        trademark_status: trademark.conflict ? 'conflict' : 'clear',
        instagram_available: socials.find(s => s.platform === 'Instagram')?.available ?? null,
        tiktok_available: socials.find(s => s.platform === 'TikTok')?.available ?? null,
        linkedin_available: socials.find(s => s.platform === 'LinkedIn')?.available ?? null,
        num_socials_available: socialsAvailable.length,
        overall_clean: (domain.results?.[0]?.available ?? false) && !trademark.conflict && socialsAvailable.length === 3,
      })
    } catch (err) {
      posthog.capture('search_failed', {
        name: trimmedName,
        error_type: err instanceof Error ? err.message : 'unknown',
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => { setResults(null); setName(''); setSearchedName('') }}
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#297134]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">NameClaim</span>
            </button>
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
                      posthog.capture('feedback_opened', { from_page: 'results' })
                      setFeedbackOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Give Feedback
                  </button>
                  <a
                    role="menuitem"
                    href="mailto:support@nameclaim.xyz"
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
        <div className="mx-auto max-w-4xl px-4 pt-8">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search another name..."
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                className="h-12 w-full rounded-lg bg-gray-100 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <CategoryDropdown
              value={category}
              onChange={setCategory}
              options={categories}
              isStacked={false}
              compact
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#297134] px-6 font-semibold text-white hover:bg-[#1f5527] disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : 'Search'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <ResultsView
          name={searchedName}
          category={category}
          results={results}
          showMore={showMoreDomains}
          onToggleMore={() => setShowMoreDomains(v => !v)}
        />
        {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#297134]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">NameClaim</span>
          </div>
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
                    posthog.capture('feedback_opened', { from_page: 'landing' })
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
      <section className="relative bg-white px-6 min-h-[80vh] flex items-center justify-center">
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full bg-[#E1E8E2] px-4 py-1.5 text-sm font-medium text-gray-800">
            Trusted by entrepreneurs
          </span>
          <h1 className="mb-6 max-w-xl mx-auto text-center text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Make sure the name is yours to take
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
                className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#297134] px-6 font-semibold text-white hover:bg-[#1f5527] disabled:opacity-60 transition-colors"
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
              { step: '01', title: 'Enter Your Name', desc: 'Type in your desired business name and select the relevant category for your industry.', textColor: 'text-[#297134]', bgColor: 'bg-[#297134]/10' },
              { step: '02', title: 'Instant Search', desc: 'We simultaneously check USPTO trademark databases, domain registrars, and major social platforms.', textColor: 'text-[#297134]', bgColor: 'bg-[#297134]/10' },
              { step: '03', title: 'Get Results', desc: "View a complete availability report showing what's available and what's taken across all platforms.", textColor: 'text-[#297134]', bgColor: 'bg-[#297134]/10' },
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
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#297134]/10">
                  <f.icon className="h-6 w-6 text-[#297134]" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#297134]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">NameClaim</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
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
      posthog.capture('feedback_submitted', { feedback_length: message.length })
      setSubmitted(true)
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
                className="w-full rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 px-3 py-2 text-sm focus:border-black focus:outline-none"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
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
