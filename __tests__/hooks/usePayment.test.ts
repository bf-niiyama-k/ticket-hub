import { renderHook, act } from '@testing-library/react'
import { usePayment } from '@/hooks/usePayment'
import type { PaymentMethod, OrderItem, PaymentFormData } from '@/types/payment'

// Stripeのモック
jest.mock('@/lib/stripe', () => ({
  getStripe: jest.fn(() => Promise.resolve({
    confirmPayment: jest.fn(),
    createPaymentMethod: jest.fn(),
  })),
}))

// fetch APIのモック
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('usePayment hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => usePayment())
    
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.paymentIntent).toBe(null)
  })

  it('creates payment intent successfully', async () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      status: 'requires_payment_method',
      amount: 5000,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ paymentIntent: mockPaymentIntent }),
    } as Response)

    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 5000,
      paymentMethod: 'credit' as PaymentMethod,
      orderItems: [] as OrderItem[],
      customerInfo: {} as Partial<PaymentFormData>,
      eventId: 'event_123',
    }

    await act(async () => {
      await result.current.createPaymentIntent(paymentData)
    })

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('handles payment intent creation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Payment failed', type: 'payment_failed' } }),
    } as Response)

    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 5000,
      paymentMethod: 'credit' as PaymentMethod,
      orderItems: [] as OrderItem[],
      customerInfo: {} as Partial<PaymentFormData>,
      eventId: 'event_123',
    }

    await act(async () => {
      await result.current.createPaymentIntent(paymentData)
    })

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).not.toBe(null)
    expect(result.current.paymentIntent).toBe(null)
  })

  it('clears error correctly', () => {
    const { result } = renderHook(() => usePayment())

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })
})