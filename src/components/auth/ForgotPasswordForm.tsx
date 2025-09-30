'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { resetPassword, updatePassword } from '@/lib/auth'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: resetError } = await resetPassword(email)
      
      if (resetError) {
        setError(resetError.message || 'メール送信に失敗しました')
        return
      }

      setSuccess('パスワードリセットリンクをメールに送信しました')
      setStep(2)
    } catch {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    try {
      const { error: updateError } = await updatePassword(newPassword)
      
      if (updateError) {
        setError(updateError.message || 'パスワード更新に失敗しました')
        return
      }

      alert('パスワードを更新しました')
      router.push('/login')
    } catch {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-lock-line text-2xl text-red-600"></i>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          パスワードを忘れた方
        </h1>
        <p className="text-gray-600 text-center">
          {step === 1 && 'メールアドレスを入力してください'}
          {step === 2 && 'メールをご確認ください'}
          {step === 3 && '新しいパスワードを設定してください'}
        </p>
      </CardHeader>

      <CardContent>
        {/* プログレスバー */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* ステップ1: メールアドレス入力 */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="登録時のメールアドレスを入力"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                登録されているメールアドレスにリセットリンクをお送りします
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  送信中...
                </>
              ) : (
                'リセットリンクを送信'
              )}
            </Button>
          </form>
        )}

        {/* ステップ2: メール確認 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                メールを送信しました
              </h3>
              <p className="text-gray-600 mb-4">
                {email} にパスワードリセットリンクをお送りしました。
                メール内のリンクをクリックしてパスワードをリセットしてください。
              </p>
              <p className="text-sm text-gray-500">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => handleSendCode({ preventDefault: () => {} } as React.FormEvent)}
                variant="outline"
                className="w-full"
              >
                メールを再送信
              </Button>
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="ghost"
                className="w-full"
              >
                戻る
              </Button>
            </div>
          </div>
        )}

        {/* ステップ3: 新しいパスワード設定 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8文字以上で入力"
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="新しいパスワードを再入力"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-sm text-red-600">パスワードが一致しません</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">パスワードの要件</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <i
                    className={`mr-2 ${
                      newPassword.length >= 8
                        ? 'ri-check-line text-green-500'
                        : 'ri-close-line text-red-500'
                    }`}
                  ></i>
                  8文字以上
                </li>
                <li className="flex items-center">
                  <i
                    className={`mr-2 ${
                      /[A-Za-z]/.test(newPassword)
                        ? 'ri-check-line text-green-500'
                        : 'ri-close-line text-red-500'
                    }`}
                  ></i>
                  英字を含む
                </li>
                <li className="flex items-center">
                  <i
                    className={`mr-2 ${
                      /[0-9]/.test(newPassword)
                        ? 'ri-check-line text-green-500'
                        : 'ri-close-line text-red-500'
                    }`}
                  ></i>
                  数字を含む
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  更新中...
                </>
              ) : (
                'パスワードを更新'
              )}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-700">
            ログイン画面に戻る
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}