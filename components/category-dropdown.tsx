'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import posthog from 'posthog-js'

export function CategoryDropdown({
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

  useEffect(() => {
    if (open) {
      const idx = options.indexOf(value)
      setActiveIndex(Math.max(0, idx))
      inputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [open, options, value])

  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [query])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

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
        className={`flex w-full items-center justify-between gap-2 rounded-full pl-4 pr-3 font-semibold text-gray-900 transition-colors hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${compact ? 'h-12 text-sm' : 'h-14'}`}
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
