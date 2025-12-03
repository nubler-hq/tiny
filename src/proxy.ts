import { NextRequest, NextResponse } from 'next/server'
import { isMarkdownPreferred } from 'fumadocs-core/negotiation'

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle markdown rewrites if preferred
  if (isMarkdownPreferred(request)) {
    const match = pathname.match(/^\/(docs|blog|help|updates)\/(.+)\.mdx$/)
    if (match) {
      const [, type, path] = match
      const result = `/api/content/${type}/llms.mdx/${path}`
      const response = NextResponse.rewrite(new URL(result, request.nextUrl))
      // Add x-pathname header for authentication redirect handling
      response.headers.set('x-pathname', pathname)
      return response
    }
  }

  // Add x-pathname header to all requests for authentication redirect handling
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: [
    '/docs/:path*', 
    '/blog/:path*', 
    '/help/:path*', 
    '/updates/:path*',
    '/app/:path*',
    '/auth/:path*',
  ],
}