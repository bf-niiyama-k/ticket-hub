'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLハッシュフラグメントから認証情報を取得
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('認証エラー:', error.message)
          router.push('/login?error=auth_callback_failed')
          return
        }

        if (data.session) {
          // 認証成功時のリダイレクト先を決定
          const redirectTo = searchParams.get('redirect_to') || '/'
          
          // セッション確立の確認を待つ
          await new Promise(resolve => setTimeout(resolve, 500))
          
          router.push(redirectTo)
        } else {
          // セッションが無い場合、URLからトークンをチェック
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !sessionData.session) {
            console.log('セッションが確立されていません')
            router.push('/login')
          } else {
            const redirectTo = searchParams.get('redirect_to') || '/'
            router.push(redirectTo)
          }
        }
      } catch (error) {
        console.error('認証処理エラー:', error)
        router.push('/login?error=unexpected_error')
      } finally {
        setIsProcessing(false)
      }
    }

    // 少し待ってから処理を開始（URLの変更が完了するのを待つ）
    const timer = setTimeout(handleAuthCallback, 100)
    
    return () => clearTimeout(timer)
  }, [router, searchParams])

  if (!isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            <i className="ri-error-warning-line"></i>
          </div>
          <h2 className="text-xl font-semibold">認証処理が完了しませんでした</h2>
          <p className="mt-2 text-gray-600 mb-4">再度ログインをお試しください</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    )
  }

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