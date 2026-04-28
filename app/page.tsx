'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, CheckCircle2, XCircle, Loader2, Globe, AtSign, Shield,
  Zap, Clock, DollarSign, ChevronRight, Sparkles,
  AlertTriangle, ChevronDown, Check,
  MessageSquare, Mail,
} from 'lucide-react'
import posthog from 'posthog-js'
import { nameToSlug } from '@/lib/slug'
import { BinocularsLogo } from '@/components/binoculars-logo'
import { CategoryDropdown } from '@/components/category-dropdown'
import { FeedbackModal } from '@/components/feedback-modal'

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Technology & Software')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [isStacked, setIsStacked] = useState(false)
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('')
  const [scrolled, setScrolled] = useState(false)

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Type out + cycle placeholder text
  useEffect(() => {
    const phrases = ['Enter your business name', 'Acme Solutions', 'TechFlow', 'GreenLeaf']
    let phraseIdx = 0
    let charIdx = 0
    let isDeleting = false
    let timeout: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = phrases[phraseIdx]
      if (!isDeleting) {
        if (charIdx < current.length) {
          setAnimatedPlaceholder(current.slice(0, charIdx + 1))
          charIdx++
          timeout = setTimeout(tick, 75)
        } else {
          isDeleting = true
          timeout = setTimeout(tick, 1800)
        }
      } else {
        if (charIdx > 0) {
          setAnimatedPlaceholder(current.slice(0, charIdx - 1))
          charIdx--
          timeout = setTimeout(tick, 35)
        } else {
          isDeleting = false
          phraseIdx = (phraseIdx + 1) % phrases.length
          timeout = setTimeout(tick, 400)
        }
      }
    }

    tick()
    return () => clearTimeout(timeout)
  }, [])

  function handleSearch() {
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
    sessionStorage.setItem('nameclaim:search_origin', 'form')
    router.push(`/check/${nameToSlug(trimmedName)}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-colors duration-200 ${
          scrolled
            ? 'border-b border-gray-200 bg-white/95 backdrop-blur-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BinocularsLogo className="h-6 w-auto text-black" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">nameclaim</span>
          </div>
          <nav className="hidden items-center justify-center gap-6 md:flex">
            <a href="#how-it-works" onClick={e => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#compare" onClick={e => { e.preventDefault(); document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Compare</a>
            <a href="#use-cases" onClick={e => { e.preventDefault(); document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Use Cases</a>
            <a href="#faq" onClick={e => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            <div ref={supportRef} className="relative">
              <button
                onClick={() => setSupportOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={supportOpen}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
          </nav>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full bg-[#236470] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a4d57] transition-colors"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-24 sm:pb-32"
        style={{
          background:
            'linear-gradient(180deg, #ffffff 0%, #B1D9ED 25%, #236470 100%)',
        }}
      >
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full bg-[#f2f2f2]/40 px-4 py-1.5 text-sm font-medium text-gray-800">
            Availability Checker
          </span>
          <h1 className="mb-6 text-balance text-2xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            Claim a name no one can take from you
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-pretty text-lg text-black">
            Check if your business name is available across trademark, domain, and social media in one search.
          </p>

          {/* Search Form */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-1 shadow-xl sm:flex-row sm:items-center sm:rounded-full sm:gap-1 sm:p-2 sm:pl-3 sm:pr-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={animatedPlaceholder || 'Enter your business name'}
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  onKeyDown={handleKeyDown}
                  className="h-14 w-full rounded-full border-0 bg-transparent pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none sm:w-[320px]"
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
                className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#236470] px-7 font-semibold text-white hover:bg-[#1a4d57] disabled:opacity-60 transition-colors"
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

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {!loading && (
              <p className="mt-3 text-base text-black">
                Try: &quot;Acme Solutions&quot;, &quot;TechFlow&quot;, &quot;GreenLeaf&quot;
              </p>
            )}
          </div>

        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-gray-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Built on trusted data sources
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            <span className="inline-flex h-10 items-center justify-center rounded bg-[#1a3a6c] px-4 text-base font-bold uppercase tracking-wide text-white">
              uspto
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.icons8.com/color/96/namecheap.png"
              alt="Namecheap"
              width={48}
              height={48}
              className="h-10 w-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.icons8.com/color/96/instagram-new.png"
              alt="Instagram"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.icons8.com/color/96/tiktok.png"
              alt="TikTok"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.icons8.com/color/96/linkedin.png"
              alt="LinkedIn"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </div>
        </div>
      </section>

      {/* Cost of Error */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
              The cost of getting this wrong
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">A wrong name can cost you everything you build</h2>
            <p className="mx-auto max-w-2xl text-gray-500">Founders skip availability checks all the time — and it&apos;s usually a much bigger problem than they realize.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: AlertTriangle,
                title: 'Cease & desist',
                desc: 'A trademark conflict can force you to rebrand mid-launch — pulling listings, replacing assets, and notifying every customer.',
              },
              {
                icon: DollarSign,
                title: 'Rebrand costs add up fast',
                desc: 'New domain purchases, redesigns, marketing reprints, and SEO recovery routinely run into five figures for early-stage startups.',
              },
              {
                icon: Globe,
                title: 'Customers can’t find you',
                desc: 'If someone else owns the .com, your customers will land on their site — and your competitor will collect the traffic you paid for.',
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <item.icon className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
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
              { step: '01', title: 'Enter Your Name', desc: 'Type in your desired business name and select the relevant category for your industry.', textColor: 'text-[#236470]', bgColor: 'bg-[#236470]/10' },
              { step: '02', title: 'Instant Search', desc: 'We simultaneously check USPTO trademark databases, domain registrars, and major social platforms.', textColor: 'text-[#236470]', bgColor: 'bg-[#236470]/10' },
              { step: '03', title: 'Get Results', desc: "View a complete availability report showing what's available and what's taken across all platforms.", textColor: 'text-[#236470]', bgColor: 'bg-[#236470]/10' },
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
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#236470]/10">
                  <f.icon className="h-6 w-6 text-[#236470]" />
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

      {/* Use Cases */}
      <section id="use-cases" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
              Who it&apos;s for
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Built for every kind of founder</h2>
            <p className="mx-auto max-w-2xl text-gray-500">Whether you&apos;re launching your first idea or pitching your hundredth client.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'First-time founders',
                desc: 'Validate your idea before spending a dollar on incorporation, branding, or hosting. Skip the legal surprises.',
              },
              {
                icon: Shield,
                title: 'Agencies & studios',
                desc: 'Run availability checks on client name candidates in seconds. Hand back a polished short-list with confidence.',
              },
              {
                icon: Zap,
                title: 'Indie hackers',
                desc: 'Find a clean name and grab the domain in the same session. Stop losing momentum to research.',
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#236470]/10">
                  <item.icon className="h-5 w-5 text-[#236470]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600">
              Pricing
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Free, while we&apos;re early</h2>
            <p className="mx-auto max-w-xl text-gray-500">No credit card. No signup. Every check NameClaim runs is free during launch.</p>
          </div>
          <div className="rounded-2xl border-2 border-[#236470] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/ forever for early users</span>
            </div>
            <ul className="mb-6 space-y-3">
              {[
                'Unlimited business name searches',
                'USPTO trademark conflict checks',
                'Domain availability across 13 TLDs',
                'Instagram, TikTok, and LinkedIn handle checks',
                'Profile previews for taken handles',
                'No account required',
              ].map(line => (
                <li key={line} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#236470]" />
                  {line}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#236470] px-6 py-3 font-semibold text-white hover:bg-[#1a4d57] transition-colors"
            >
              Start searching <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
              FAQ
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Where does the trademark data come from?',
                a: 'NameClaim queries the USPTO trademark register for every search, returning live and similar marks that could conflict with the name you entered.',
              },
              {
                q: 'How current is the data?',
                a: 'Trademark and domain results are pulled in real time at search. Social handle checks reflect the platform state at the moment you searched.',
              },
              {
                q: 'Do I need to create an account?',
                a: 'No. NameClaim runs every search anonymously — no email, no signup, no password.',
              },
              {
                q: 'Which domains and platforms do you check?',
                a: 'We check 13 TLDs including .com, .io, .co, and .app, plus Instagram, TikTok, and LinkedIn for handle availability.',
              },
              {
                q: 'Can NameClaim guarantee a name is safe to use?',
                a: 'No tool can. We surface the most common conflicts so you can avoid obvious risks, but a clean NameClaim report is not legal advice — for active commercial use, talk to a trademark attorney.',
              },
              {
                q: 'Is my search history stored?',
                a: 'We log searches anonymously for product analytics. We do not link them to identifiable users and we do not sell data to third parties. See our Privacy Policy for details.',
              },
            ].map(item => (
              <details key={item.q} className="group rounded-xl border border-gray-200 bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-900">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-gray-600">{item.a}</p>
              </details>
            ))}
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
              <BinocularsLogo className="h-5 w-auto text-black" />
              <span className="text-lg font-bold tracking-tight text-gray-900">nameclaim</span>
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
