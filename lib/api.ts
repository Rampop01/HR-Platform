// All API calls go through our Next.js proxy to avoid CORS issues
const PROXY_BASE = '/api/proxy'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
    [key: string]: any
  }
  token: string
}

export interface DashboardData {
  total_employees: number
  new_hire_count: number
  upcoming_event: number
  open_positions: number
}

export interface Employee {
  id: number
  name: string
  email: string
  job_title: string
  department: string
  location: string
  employment_type: string
  status: string
  start_date: string
  avatar?: string
  [key: string]: any
}

export interface EmployeesResponse {
  data: Employee[]
  current_page: number
  per_page: number
  total: number
  next_page_url: string | null
  prev_page_url: string | null
}

export interface EmployeeDetail extends Employee {
  phone: string
  date_of_birth: string
  address: string
  salary: number
  manager: string
  manager_id: number
  next_of_kin_name: string
  next_of_kin_relationship: string
  next_of_kin_phone: string
  tenure_years: number
  tenure_months: number
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>,
  token?: string
): Promise<T> {
  // Route through the proxy: /api/proxy/api/auth/login → proxied to https://apitest.hcmatrix.co/api/auth/login
  const url = `${PROXY_BASE}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type')
  let responseData: any

  if (contentType?.includes('application/json')) {
    responseData = await response.json()
  } else {
    const text = await response.text()
    throw new Error(`API returned non-JSON response: ${response.status}`)
  }

  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      `API error: ${response.status}`
    throw new Error(errorMessage)
  }

  return responseData as T
}

function normalizeEmployeesResponse(
  response: any,
  page: number
): EmployeesResponse {
  // The API might return: { data: [...] } or just an array
  if (response.data && Array.isArray(response.data)) {
    return {
      data: response.data,
      current_page: response.current_page ?? page,
      per_page: response.per_page ?? 15,
      total: response.total ?? response.data.length,
      next_page_url: response.next_page_url ?? null,
      prev_page_url: response.prev_page_url ?? null,
    }
  }

  if (Array.isArray(response)) {
    return {
      data: response,
      current_page: page,
      per_page: 15,
      total: response.length,
      next_page_url: null,
      prev_page_url: null,
    }
  }

  // Fallback: treat the whole response as-is
  return response as EmployeesResponse
}

export const api = {
  // 1. Login
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/api/auth/login', 'POST', {
      email,
      password,
    })
  },

  // 2. Logout
  async logout(token: string): Promise<void> {
    await apiCall('/api/v1/logout', 'POST', {}, token)
  },

  // 3. Dashboard
  async getDashboard(token: string): Promise<DashboardData> {
    return apiCall<DashboardData>('/api/v1/dashboard', 'GET', undefined, token)
  },

  // 4. Fetch Employees (Paginated)
  async getEmployees(
    token: string,
    page: number = 1,
    params?: Record<string, string>
  ): Promise<EmployeesResponse> {
    const queryString = new URLSearchParams({
      page: page.toString(),
      ...params,
    }).toString()
    const response = await apiCall<any>(
      `/api/v1/employee?${queryString}`,
      'GET',
      undefined,
      token
    )
    return normalizeEmployeesResponse(response, page)
  },

  // 5. Fetch Single Employee
  async getEmployee(token: string, id: number): Promise<EmployeeDetail> {
    const response = await apiCall<any>(
      `/api/v1/employee/${id}`,
      'GET',
      undefined,
      token
    )
    // API might return { data: employee } or just employee
    return response.data || response
  },

  // 6. Search Employees
  async searchEmployees(
    token: string,
    query: Record<string, string>,
    page: number = 1
  ): Promise<EmployeesResponse> {
    const params = { ...query, page: page.toString() }
    const queryString = new URLSearchParams(params).toString()
    const response = await apiCall<any>(
      `/api/v1/employee?${queryString}`,
      'GET',
      undefined,
      token
    )
    return normalizeEmployeesResponse(response, page)
  },
}
