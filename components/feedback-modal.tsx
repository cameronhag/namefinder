'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import posthog from 'posthog-js'

export function FeedbackModal({ onClose }: { onClose: () => void }) {
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
