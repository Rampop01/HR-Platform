import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'https://apitest.hcmatrix.co'

async function proxyRequest(req: NextRequest) {
  // Extract the path after /api/proxy/
  const url = new URL(req.url)
  const pathSegments = url.pathname.replace('/api/proxy/', '')
  const targetUrl = `${API_BASE_URL}/${pathSegments}${url.search}`

  const headers: HeadersInit = {
    'Accept': 'application/json',
  }

  // Forward the Authorization header if present
  const authHeader = req.headers.get('Authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  }

  // Forward the body and Content-Type for POST/PUT/PATCH requests only
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    headers['Content-Type'] = 'application/json'
    try {
      const body = await req.json()
      fetchOptions.body = JSON.stringify(body)
    } catch {
      // No body or invalid JSON — that's fine
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions)

    const contentType = response.headers.get('content-type')
    let data: any

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { message: text }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Failed to connect to API server' },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req)
}

export async function POST(req: NextRequest) {
  return proxyRequest(req)
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req)
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req)
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req)
}
