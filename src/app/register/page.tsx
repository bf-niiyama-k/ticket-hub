'use client'

import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { RegisterForm } from '@/components/auth'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="max-w-2xl mx-auto px-6">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
