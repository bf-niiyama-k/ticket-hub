'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('認証エラー:', error.message)
          router.push('/login?error=auth_callback_failed')
          return
        }

        if (data.session) {
          // 認証成功時、ホームページまたは元のページにリダイレクト
          const redirectTo = new URLSearchParams(window.location.search).get('redirect_to') || '/'
          router.push(redirectTo)
        } else {
          // セッションが無い場合はログインページへ
          router.push('/login')
        }
      } catch (error) {
        console.error('認証処理エラー:', error)
        router.push('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold">認証処理中...</h2>
        <p className="mt-2 text-gray-600">しばらくお待ちください</p>
      </div>
    </div>
  )
}