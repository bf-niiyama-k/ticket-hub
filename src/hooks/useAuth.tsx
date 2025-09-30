'use client'

import { useState, useEffect, useContext, createContext } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/supabase/types'
import { getCurrentUser, onAuthStateChange, getUserProfile, signOut as authSignOut } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const { profile: userProfile } = await getUserProfile(currentUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
    }
  }

  useEffect(() => {
    let isMounted = true

    // 初期認証状態を取得
    getCurrentUser().then(({ user: currentUser }) => {
      if (!isMounted) return

      setUser(currentUser)
      setLoading(false)

      if (currentUser) {
        getUserProfile(currentUser.id).then(({ profile: userProfile }) => {
          if (isMounted) setProfile(userProfile)
        })
      }
    })

    // 認証状態の変更を監視
    const unsubscribe = onAuthStateChange((user) => {
      if (!isMounted) return

      setUser(user)

      if (user) {
        getUserProfile(user.id).then(({ profile: userProfile }) => {
          if (isMounted) setProfile(userProfile)
        })
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 個別のフック
export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

export function useProfile() {
  const { profile, loading } = useAuth()
  return { profile, loading }
}

export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user, loading }
}

export function useIsAdmin() {
  const { profile, loading } = useAuth()
  return { 
    isAdmin: profile?.role === 'admin', 
    isStaff: profile?.role === 'staff' || profile?.role === 'admin',
    loading 
  }
}