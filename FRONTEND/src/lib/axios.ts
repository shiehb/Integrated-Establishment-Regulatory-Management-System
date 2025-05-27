import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useMemo } from 'react'
import type { User } from '@/types/user'
import type { UserLevel } from '@/types/user'

export type LoginRequest = {
  id_number: string
  password: string
}

export type AuthResponse = {
  access: string
  refresh: string
  user: User
}

export type ApiError = {
  errors?: Record<string, string[]>
  message?: string
  detail?: string
}

// LocalStorage helper functions
export const getLocalStorageItem = (key: string) => localStorage.getItem(key)
export const setLocalStorageItem = (key: string, value: string) => localStorage.setItem(key, value)
export const removeLocalStorageItems = (...keys: string[]) => keys.forEach(key => localStorage.removeItem(key))

export const createAxiosInstance = (baseURL: string = 'http://127.0.0.1:8000/'): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
  })

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getLocalStorageItem('access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = getLocalStorageItem('refresh_token')
        const response = await axios.post(`${baseURL}api/token/refresh/`, { refresh: refreshToken })
        
        setLocalStorageItem('access_token', response.data.access)
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`
        return instance(originalRequest)
      } catch (refreshError) {
        removeLocalStorageItems('access_token', 'refresh_token', 'user')
        window.location.href = '/dashboard'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

  return instance
}

export const useAxiosInstance = (baseURL?: string) => 
  useMemo(() => createAxiosInstance(baseURL), [baseURL])

// Simplified API service
export const authApi = {
  login: async (data: LoginRequest) => {
    const instance = createAxiosInstance()
    const response = await instance.post<AuthResponse>('api/login/', {
      id_number: data.id_number,
      password: data.password
    })
    
    if (response.data.access && response.data.refresh) {
      setLocalStorageItem('access_token', response.data.access)
      setLocalStorageItem('refresh_token', response.data.refresh)
      return response.data
    }
    
    throw new Error('Invalid response from server')
  },

  getUser: () => 
    createAxiosInstance().get<{ user: User }>('api/user/').then(r => r.data)
}

export const ACCESS_LEVELS: Record<UserLevel | 'any', UserLevel[]> = {
  admin: ['admin'],
  manager: ['admin', 'manager'],
  inspector: ['admin', 'manager', 'inspector'],
  any: []
} as const

export type { User }  // Re-export for backward compatibility