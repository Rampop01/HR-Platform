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
  spouse: string | null
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const url = `${PROXY_BASE}${endpoint}`

  const headers: HeadersInit = {
    'Accept': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Only set Content-Type for requests with a body
  if (body) {
    headers['Content-Type'] = 'application/json'
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

// Map raw API employee to our Employee interface
function mapEmployee(raw: any): Employee {
  return {
    ...raw,
    name: raw.full_name || raw.name || '',
    email: raw.email || '',
    job_title: raw.job_title || '',
    department: raw.department || '',
    location: raw.location || '',
    employment_type: raw.employment_type || raw.emp_type || '',
    status: raw.status || '',
    start_date: raw.start_date || '',
    avatar: raw.image_url || raw.avatar || '',
  }
}

// Map raw API employee detail to our EmployeeDetail interface
function mapEmployeeDetail(raw: any): EmployeeDetail {
  return {
    ...mapEmployee(raw),
    phone: raw.phone || raw.phone_number || '',
    date_of_birth: raw.dob || raw.date_of_birth || '',
    address: raw.address || '',
    salary: raw.current_salary ?? raw.salary ?? 0,
    manager: raw.manager || '',
    manager_id: raw.manager_id || 0,
    next_of_kin_name: raw.next_of_kin || raw.next_of_kin_name || '',
    next_of_kin_relationship: raw.next_of_kin_relationship || raw.relationship || '',
    next_of_kin_phone: raw.phone_no_nok || raw.next_of_kin_phone || '',
    tenure_years: raw.tenure_years ?? 0,
    tenure_months: raw.tenure_months ?? 0,
    spouse: raw.spouse || null,
  }
}

function normalizeEmployeesResponse(
  response: any,
  page: number
): EmployeesResponse {
  // API returns: { success: true, data: { current_page, data: [...], ... } }
  const paginated = response.data || response

  if (paginated.data && Array.isArray(paginated.data)) {
    return {
      data: paginated.data.map(mapEmployee),
      current_page: paginated.current_page ?? page,
      per_page: paginated.per_page ?? 15,
      total: paginated.total ?? paginated.data.length,
      next_page_url: paginated.next_page_url ?? null,
      prev_page_url: paginated.prev_page_url ?? null,
    }
  }

  if (Array.isArray(paginated)) {
    return {
      data: paginated.map(mapEmployee),
      current_page: page,
      per_page: 15,
      total: paginated.length,
      next_page_url: null,
      prev_page_url: null,
    }
  }

  return {
    data: [],
    current_page: page,
    per_page: 15,
    total: 0,
    next_page_url: null,
    prev_page_url: null,
  }
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
    const response = await apiCall<any>('/api/v1/dashboard', 'GET', undefined, token)
    // API may return { success: true, data: { ... } }
    const data = response.data || response
    return {
      total_employees: data.total_employees ?? 0,
      new_hire_count: data.new_hire_count ?? 0,
      upcoming_event: data.upcoming_event ?? 0,
      open_positions: data.open_positions ?? 0,
    }
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
    // API returns { success: true, data: { ... } }
    const raw = response.data || response
    return mapEmployeeDetail(raw)
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
