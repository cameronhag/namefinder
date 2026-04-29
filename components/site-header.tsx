import Link from 'next/link'
import { BinocularsLogo } from '@/components/binoculars-logo'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <BinocularsLogo className="h-6 w-auto text-black" />
          <span
            className="text-2xl font-bold tracking-tight text-gray-900"
            style={{ fontFamily: 'var(--font-wordmark)' }}
          >
            nameclaim
          </span>
        </Link>
        <nav className="hidden items-center justify-center gap-6 md:flex">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Features
          </Link>
          <Link
            href="/guides"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Guides
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            FAQ
          </Link>
          <a
            href="mailto:support@nameclaim.io"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Support
          </a>
        </nav>
        <Link
          href="/"
          className="rounded-full bg-[#297134] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f5527]"
        >
          Check a Name
        </Link>
      </div>
    </header>
  )
}
