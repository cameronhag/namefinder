'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Search, ChevronDown, Check, X } from 'lucide-react'
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
  const [sheetVisible, setSheetVisible] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<HTMLLIElement>(null)
  const touchStartY = useRef<number | null>(null)
  const touchDeltaY = useRef(0)
  const sheetPanelRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    if (open) {
      const idx = options.indexOf(value)
      setActiveIndex(Math.max(0, idx))
      if (!isStacked) inputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [open, options, value, isStacked])

  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [query])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || isStacked) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const MENU_MAX = 280
    setPlacement(
      spaceBelow < MENU_MAX && spaceAbove > spaceBelow ? 'top' : 'bottom'
    )
  }, [open, isStacked])

  useEffect(() => {
    if (!open || isStacked) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, isStacked])

  useEffect(() => {
    if (!isStacked) return
    if (open) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => setSheetVisible(true))
      return () => {
        document.body.style.overflow = prevOverflow
      }
    } else {
      setSheetVisible(false)
    }
  }, [open, isStacked])

  useEffect(() => {
    if (!open || !isStacked) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, isStacked])

  function selectOption(opt: string) {
    posthog.capture('category_changed', { from: value, to: opt })
    onChange(opt)
    setOpen(false)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    touchDeltaY.current = 0
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) {
      touchDeltaY.current = dy
      if (sheetPanelRef.current) {
        sheetPanelRef.current.style.transform = `translateY(${dy}px)`
      }
    }
  }

  function handleTouchEnd() {
    if (sheetPanelRef.current) {
      sheetPanelRef.current.style.transform = ''
    }
    if (touchDeltaY.current > 80) setOpen(false)
    touchStartY.current = null
    touchDeltaY.current = 0
  }

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
      if (filtered[activeIndex]) selectOption(filtered[activeIndex])
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

      {open && !isStacked && (
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
                    onClick={() => selectOption(opt)}
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

      {open && isStacked && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select a category"
          className="fixed inset-0 z-[60] flex flex-col justify-end"
        >
          <div
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              sheetVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            ref={sheetPanelRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative z-[61] max-h-[85vh] rounded-t-2xl bg-white pb-[max(env(safe-area-inset-bottom),16px)] shadow-2xl transition-transform duration-200 ease-out ${
              sheetVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h2 className="text-base font-semibold text-gray-900">Select category</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul role="listbox" className="max-h-[60vh] overflow-auto px-2 pb-2">
              {options.map(opt => {
                const selected = opt === value
                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectOption(opt)}
                    className={`flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-base transition-colors active:bg-gray-100 ${
                      selected ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-left">{opt}</span>
                    {selected && <Check className="h-5 w-5 shrink-0 text-[#297134]" />}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
