const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apitest.hcmatrix.co'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
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
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
    const errorMessage = responseData?.message || responseData?.error || `API error: ${response.status}`
    throw new Error(errorMessage)
  }
  
  return responseData as T
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/api/auth/login', 'POST', {
      email,
      password,
    })
  },

  async logout(token: string): Promise<void> {
    await apiCall('/api/v1/logout', 'POST', {}, token)
  },

  async getDashboard(token: string): Promise<DashboardData> {
    return apiCall<DashboardData>('/api/v1/dashboard', 'GET', undefined, token)
  },

  async getEmployees(
    token: string,
    page: number = 1,
    params?: Record<string, string>
  ): Promise<EmployeesResponse> {
    const queryString = new URLSearchParams({ page: page.toString(), ...params }).toString()
    const response = await apiCall<any>(`/api/v1/employee?${queryString}`, 'GET', undefined, token)
    
    // Handle different response formats
    if (response.data && Array.isArray(response.data)) {
      return response as EmployeesResponse
    } else if (Array.isArray(response)) {
      // If API returns raw array, wrap it
      return {
        data: response,
        current_page: page,
        per_page: 10,
        total: response.length,
        next_page_url: null,
        prev_page_url: null,
      }
    }
    
    return response as EmployeesResponse
  },

  async getEmployee(token: string, id: number): Promise<EmployeeDetail> {
    return apiCall<EmployeeDetail>(`/api/v1/employee/${id}`, 'GET', undefined, token)
  },

  async searchEmployees(
    token: string,
    query: Record<string, string>,
    page: number = 1
  ): Promise<EmployeesResponse> {
    const params = { ...query, page: page.toString() }
    const queryString = new URLSearchParams(params).toString()
    const response = await apiCall<any>(`/api/v1/employee?${queryString}`, 'GET', undefined, token)
    
    // Handle different response formats
    if (response.data && Array.isArray(response.data)) {
      return response as EmployeesResponse
    } else if (Array.isArray(response)) {
      // If API returns raw array, wrap it
      return {
        data: response,
        current_page: page,
        per_page: 10,
        total: response.length,
        next_page_url: null,
        prev_page_url: null,
      }
    }
    
    return response as EmployeesResponse
  },
}
