'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { LoginForm } from '@/components/auth'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/'
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="max-w-md mx-auto px-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                {error === 'auth_callback_failed' && '認証処理に失敗しました。再度お試しください。'}
                {error === 'unexpected_error' && '予期しないエラーが発生しました。'}
                {error === 'access_denied' && 'アクセスが拒否されました。ログインしてください。'}
              </p>
            </div>
          )}
          <LoginForm redirectTo={redirectTo} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
