import Link from 'next/link'
import { BinocularsLogo } from '@/components/binoculars-logo'

export function SiteFooter() {
  return (
    <footer className="bg-[#121212] px-6 pt-14 pb-8 text-gray-400 md:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4 md:gap-12">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <BinocularsLogo className="h-6 w-auto text-white" />
              <span
                className="text-xl font-bold tracking-tight text-white"
                style={{ fontFamily: 'var(--font-wordmark)' }}
              >
                nameclaim
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Brand availability,
              <br />
              checked in one search.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="transition-colors hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/guides" className="transition-colors hover:text-white">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="transition-colors hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@nameclaim.xyz"
                  className="transition-colors hover:text-white"
                >
                  support@nameclaim.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-gray-500 md:mt-16 md:flex-row md:items-center md:justify-between">
          <p>© 2026 NameClaim. All rights reserved.</p>
          <p>
            Some outbound links are affiliate links — we may earn a commission at no
            extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  )
}
