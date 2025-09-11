'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { signUp } from '@/lib/auth'
import { RegisterFormData } from '@/types/auth'

export default function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    interests: [],
    agreeTerms: false,
    agreeMarketing: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const interestOptions = [
    { id: 'exhibition', name: '展示会・見本市', icon: 'ri-building-line' },
    { id: 'conference', name: 'カンファレンス・セミナー', icon: 'ri-presentation-line' },
    { id: 'dining', name: 'ディナーイベント', icon: 'ri-restaurant-line' },
    { id: 'entertainment', name: 'エンターテインメント', icon: 'ri-music-line' },
    { id: 'sports', name: 'スポーツイベント', icon: 'ri-football-line' },
    { id: 'art', name: 'アート・文化', icon: 'ri-palette-line' }
  ]

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = formData.interests || []
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId]
    handleInputChange('interests', newInterests)
  }

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phone
  }

  const validateStep2 = () => {
    return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { user, error: signUpError } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: `${formData.lastName} ${formData.firstName}`
      })

      if (signUpError) {
        setError(signUpError.message || 'アカウント作成に失敗しました')
        return
      }

      if (user) {
        // メール確認が必要な場合
        alert('登録確認メールを送信しました。メールをご確認ください。')
        router.push('/login')
      }
    } catch {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-user-add-line text-2xl text-blue-600"></i>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          新規登録
        </h1>
        <p className="text-gray-600 text-center">
          アカウントを作成してサービスを利用開始
        </p>
      </CardHeader>

      <CardContent>
        {/* プログレスバー */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= stepNumber
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-16 h-1 mx-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleRegister}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ステップ1: 基本情報 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">基本情報</h2>
                <p className="text-gray-600">お名前とご連絡先を入力してください</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastName">お名前（姓）*</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="田中"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">お名前（名）*</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="太郎"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">メールアドレス*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">電話番号*</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="090-1234-5678"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">生年月日</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">性別</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                    <option value="prefer-not-to-say">回答しない</option>
                  </select>
                </div>
              </div>

              <Button type="button" onClick={handleNext} disabled={!validateStep1()} className="w-full">
                次へ進む
              </Button>
            </div>
          )}

          {/* ステップ2: パスワード設定 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">パスワード設定</h2>
                <p className="text-gray-600">安全なパスワードを設定してください</p>
              </div>

              <div>
                <Label htmlFor="password">パスワード*</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                <div className="mt-2 text-sm text-gray-600">
                  <p>• 8文字以上で入力してください</p>
                  <p>• 英数字と記号を含むことを推奨します</p>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">パスワード確認*</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="パスワードを再入力"
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">パスワードが一致しません</p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  戻る
                </Button>
                <Button type="button" onClick={handleNext} disabled={!validateStep2()} className="flex-1">
                  次へ進む
                </Button>
              </div>
            </div>
          )}

          {/* ステップ3: 興味・同意事項 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">興味のあるイベント</h2>
                <p className="text-gray-600">おすすめイベントの配信に使用します（任意）</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interestOptions.map((interest) => (
                  <div
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors text-center ${
                      (formData.interests || []).includes(interest.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        (formData.interests || []).includes(interest.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <i className={interest.icon}></i>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{interest.name}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    required
                  />
                  <Label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                      利用規約
                    </Link>
                    および
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                      プライバシーポリシー
                    </Link>
                    に同意します（必須）
                  </Label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={formData.agreeMarketing}
                    onChange={(e) => handleInputChange('agreeMarketing', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <Label htmlFor="marketing" className="ml-3 text-sm text-gray-700">
                    イベント情報やお得な情報の配信を希望します（任意）
                  </Label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  戻る
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.agreeTerms || isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      アカウント作成中...
                    </>
                  ) : (
                    'アカウントを作成'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            既にアカウントをお持ちの方は
            <Link href="/login" className="text-blue-600 hover:text-blue-700 ml-1">
              ログイン
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}