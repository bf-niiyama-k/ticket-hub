// Jest setup file
import '@testing-library/jest-dom'

// 環境変数のセットアップ
process.env.NODE_ENV = 'test'

// Next.jsの環境変数をテスト用に設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.STRIPE_PUBLIC_KEY = 'pk_test_123'
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.PAYPAY_CLIENT_ID = 'test-paypay-id'
process.env.PAYPAY_CLIENT_SECRET = 'test-paypay-secret'

// window.matchMediaのモック（CSS media queries用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// IntersectionObserverのモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// ResizeObserverのモック
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {
    return null
  }
  unobserve() {
    return null
  }
  disconnect() {
    return null
  }
}

// fetch APIのモック
global.fetch = jest.fn()

// console.errorの抑制（React Testing Libraryの警告を減らすため）
const originalError = console.error
console.error = jest.fn((...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  return originalError.call(console, ...args)
})