'use client'

import { useState } from 'react'

export default function Home() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Technology & Software')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

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

  function validate(value: string): string {
    if (!value || value.trim() === '') return 'Please enter a business name.'
    if (value.trim().length === 1) return 'Name is too short to return meaningful results.'
    if (value.length > 50) return 'Name must be 50 characters or fewer.'
    if (/^[0-9\s]+$/.test(value.trim())) return 'Numbers only is not a valid business name.'
    if (/[.@#%&/]/.test(value)) return 'Name cannot contain . @ # % & or / characters.'
    return ''
  }

  async function handleSearch() {
    const validationError = validate(name)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)
    setResults(null)

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

  const noSpaces = name.toLowerCase().replace(/\s+/g, '')

  const platformLinks: Record<string, string> = {
    Instagram: `https://www.instagram.com/${noSpaces}/`,
    TikTok: `https://www.tiktok.com/@${noSpaces}`,
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-black mb-2">NameFinder</h1>
      <p className="text-black mb-8">Check if your business name is yours to own</p>

      <div className="w-full max-w-md flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter your business name"
          value={name}
          onChange={e => {
            setName(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          className="border border-gray-400 rounded-lg px-4 py-3 text-base text-black w-full placeholder-gray-400"
        />

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-gray-400 rounded-lg px-4 py-3 text-base text-black w-full"
        >
          {categories.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-black text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching...
            </>
          ) : (
            'Check your name'
          )}
        </button>
      </div>

      {results && (
        <div className="w-full max-w-md mt-8 flex flex-col gap-4">

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-black mb-2">Domain</p>
            {results.domain.results.map((d: any) => (
              <div key={d.domain} className="flex justify-between items-center mb-1">
                <span className="text-gray-600 text-sm">{d.domain}</span>
                <span className={`font-medium text-sm ${d.available ? 'text-green-600' : 'text-red-600'}`}>
                  {d.available ? '✅ Available' : '❌ Taken'}
                </span>
              </div>
            ))}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-black mb-1">Trademark</p>
            <p className={`font-medium ${results.trademark.conflict ? 'text-red-600' : 'text-green-600'}`}>
              {results.trademark.conflict
                ? `❌ ${results.trademark.totalConflicts === 250 ? '250+' : results.trademark.totalConflicts} conflicts found`
                : '✅ No conflicts found'}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-black mb-2">Social</p>
            {results.social.results.map((s: any) => {
              const link = platformLinks[s.platform]
              return (
                <div key={s.platform} className="flex justify-between items-center mb-2">
                  <span className="text-black">{s.platform}</span>
                  {s.exact ? (
                    <span className={`font-medium ${s.available ? 'text-green-600' : 'text-red-600'}`}>
                      {s.available ? '✅ Available' : '❌ Taken'}
                    </span>
                  ) : (
                    <a href={link} target={'_blank'} rel={'noopener noreferrer'} className="text-sm text-blue-500 underline">
                      Check
                    </a>
                  )}
                </div>
              )
            })}
            <p className="text-xs text-gray-400 mt-3">
              Instagram and TikTok must be verified manually.
            </p>
          </div>

        </div>
      )}
    </main>
  )
}