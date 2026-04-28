'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, CheckCircle2, XCircle, Loader2, Globe, AtSign, Shield,
  ExternalLink, Share2, Check, MessageSquare, Mail, Lock,
} from 'lucide-react'
import posthog from 'posthog-js'
import { namecheapUrl } from '@/lib/affiliates'
import { nameToSlug } from '@/lib/slug'
import { BinocularsLogo } from './binoculars-logo'
import { CategoryDropdown } from './category-dropdown'
import { FeedbackModal } from './feedback-modal'

// ─── Types (re-exported for the server route to import) ───────────────────────

export interface DomainEntry { domain: string; available: boolean }

export interface DomainApiResult {
  results: DomainEntry[]
  extra: DomainEntry[]
}

export interface TrademarkConflict {
  name: string
  status: string
  owner: string
  serialNumber: string
}

export interface TrademarkApiResult {
  name: string
  conflict: boolean
  totalConflicts: number
  similarCount: number
  conflicts: TrademarkConflict[]
}

export interface InstagramProfile {
  username: string
  fullName: string
  biography: string
  profilePicUrl: string
  isPrivate: boolean
  followerCount: number
  postCount: number
}

export interface SocialEntry {
  platform: string
  available: boolean
  exact: boolean
  profile?: InstagramProfile
}

export interface SocialApiResult {
  results: SocialEntry[]
}

export interface Results {
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

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(value: string): string {
  if (!value || value.trim() === '') return 'Please enter a business name.'
  if (value.trim().length === 1) return 'Name is too short to return meaningful results.'
  if (value.length > 50) return 'Name must be 50 characters or fewer.'
  if (/^[0-9\s]+$/.test(value.trim())) return 'Numbers only is not a valid business name.'
  if (/[.@#%&/]/.test(value)) return 'Name cannot contain . @ # % & or / characters.'
  return ''
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toString()
}

// ─── Platform icons ───────────────────────────────────────────────────────────

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
                className="text-xs text-[#236470] underline"
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
                    className="text-xs text-[#236470] underline"
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
                  className="text-xs text-[#236470] underline"
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
  name, results, showMore, onToggleMore,
}: {
  name: string
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
          <TrademarkCard data={results.trademark} />
          <DomainCard
            results={results.domain}
            showMore={showMore}
            onToggle={onToggleMore}
            hasTrademarkConflict={results.trademark.conflict}
          />
        </div>

        <SocialCard results={results.social} name={name} />
      </div>
    </div>
  )
}

// ─── Wrapper (the public default export) ──────────────────────────────────────

export default function ResultsPageWrapper({
  name,
  results,
  error: serverError,
}: {
  name: string
  results: Results | null
  error?: string
}) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('Technology & Software')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMoreDomains, setShowMoreDomains] = useState(false)
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

  // ── Analytics: distinguish form-initiated vs direct URL visits ──────────────
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? sessionStorage.getItem('nameclaim:search_origin') : null
    if (typeof window !== 'undefined') sessionStorage.removeItem('nameclaim:search_origin')
    const fromForm = origin === 'form'

    const failed =
      !!serverError ||
      !results ||
      !results.domain ||
      !results.trademark ||
      !results.social

    if (failed) {
      posthog.capture('search_failed', {
        name,
        from: fromForm ? 'form' : 'direct',
        error_type: serverError || 'incomplete_response',
      })
      return
    }

    const socials = results.social.results || []
    const socialsAvailable = socials.filter(s => s.available)

    posthog.capture('search_completed', {
      name,
      name_length: name.length,
      has_spaces: name.includes(' '),
      from: fromForm ? 'form' : 'direct',
      domain_available: results.domain.results?.[0]?.available ?? false,
      trademark_status: results.trademark.conflict ? 'conflict' : 'clear',
      instagram_available: socials.find(s => s.platform === 'Instagram')?.available ?? null,
      tiktok_available: socials.find(s => s.platform === 'TikTok')?.available ?? null,
      linkedin_available: socials.find(s => s.platform === 'LinkedIn')?.available ?? null,
      num_socials_available: socialsAvailable.length,
      overall_clean:
        (results.domain.results?.[0]?.available ?? false) &&
        !results.trademark.conflict &&
        socialsAvailable.length === 3,
    })

    if (!fromForm) {
      posthog.capture('search_viewed_direct', {
        name,
        slug: window.location.pathname.split('/').pop(),
        referrer: document.referrer || 'none',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  function handleSearch() {
    const validationError = validate(searchInput)
    if (validationError) { setError(validationError); return }

    const trimmedName = searchInput.trim()
    posthog.capture('search_performed', {
      name: trimmedName,
      name_length: trimmedName.length,
      has_spaces: trimmedName.includes(' '),
      category,
    })

    setError('')
    setLoading(true)
    sessionStorage.setItem('nameclaim:search_origin', 'form')
    router.push(`/check/${nameToSlug(trimmedName)}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <BinocularsLogo className="h-6 w-auto text-black" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">nameclaim</span>
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
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setError('') }}
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
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#236470] px-6 font-semibold text-white hover:bg-[#1a4d57] disabled:opacity-60 transition-colors"
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
      {serverError || !results ? (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            We couldn&apos;t check &ldquo;{name}&rdquo;
          </h1>
          <p className="mx-auto mb-6 max-w-md text-gray-500">
            Something went wrong reaching our trademark, domain, or social data sources. Try again
            in a moment.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#236470] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a4d57] transition-colors"
          >
            Back to search
          </a>
        </div>
      ) : (
        <ResultsView
          name={name}
          results={results}
          showMore={showMoreDomains}
          onToggleMore={() => setShowMoreDomains(v => !v)}
        />
      )}
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  )
}
