'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Google認証などのOAuth認証後は自動的にセッションが確立される
    // middlewareで認証状態をチェックし、適切にリダイレクトされる
    router.replace('/')
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