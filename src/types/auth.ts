import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/supabase/types'

export interface AuthUser extends User {
  profile?: Profile
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  birthDate?: string
  gender?: string
  interests?: string[]
  agreeTerms: boolean
  agreeMarketing: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export interface GuestFormData {
  name: string
  email: string
  phone?: string
}

export interface AuthError {
  message: string
  status?: number
}

export interface AuthResponse<T = unknown> {
  data?: T
  error?: AuthError
}

export type AuthAction = 
  | 'SIGN_IN'
  | 'SIGN_UP'
  | 'SIGN_OUT'
  | 'RESET_PASSWORD'
  | 'UPDATE_PASSWORD'
  | 'UPDATE_PROFILE'

export interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  error: AuthError | null
}