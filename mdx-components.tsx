import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold tracking-tight text-gray-900">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-4 text-base leading-7 text-gray-700">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-[#297134] underline underline-offset-2 hover:text-[#1f5527]"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-base leading-7 text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-[#297134] bg-gray-50 px-5 py-3 text-base italic text-gray-700">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-gray-200" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-gray-200 px-4 py-2 text-gray-700">{children}</td>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
}

export function useMDXComponents(): MDXComponents {
  return mdxComponents
}
