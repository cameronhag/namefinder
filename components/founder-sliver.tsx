import Link from 'next/link'

export function FounderSliver() {
  return (
    <section className="border-t border-gray-200 bg-white px-6 py-12">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/founders/4.jpg"
          alt="Cameron, founder of NameClaim"
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100"
        />
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">Cameron, founder of NameClaim</p>
          <p className="text-sm leading-relaxed text-gray-500">
            I built NameClaim after watching too many founder friends lose a brand to a trademark conflict they could have caught in 30 seconds.
          </p>
          <Link
            href="https://x.com/cameronhagighat"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center text-sm font-semibold text-[#297134] hover:text-[#1f5527]"
          >
            Follow on X →
          </Link>
        </div>
      </div>
    </section>
  )
}
