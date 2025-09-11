'use client'

import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { ForgotPasswordForm } from '@/components/auth'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="max-w-md mx-auto px-6">
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
