import { cn, formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toBe('base-class additional-class')
    })

    it('handles conditional classes', () => {
      const result = cn('base-class', false && 'conditional-class', 'final-class')
      expect(result).toBe('base-class final-class')
    })

    it('handles Tailwind conflicts properly', () => {
      const result = cn('p-2', 'p-4')
      expect(result).toBe('p-4')
    })

    it('returns empty string for no classes', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('formatCurrency function', () => {
    it('formats Japanese Yen correctly', () => {
      expect(formatCurrency(1000)).toBe('￥1,000')
      expect(formatCurrency(0)).toBe('￥0')
      expect(formatCurrency(123456)).toBe('￥123,456')
    })

    it('handles decimal values', () => {
      expect(formatCurrency(1000.5)).toBe('￥1,001')
      expect(formatCurrency(999.99)).toBe('￥1,000')
    })

    it('handles negative values', () => {
      expect(formatCurrency(-1000)).toBe('-￥1,000')
    })
  })

  describe('formatDate function', () => {
    it('formats date to Japanese format', () => {
      const date = new Date('2025-12-31T00:00:00.000Z')
      const result = formatDate(date)
      expect(result).toContain('年12月31日')
    })

    it('handles string date input', () => {
      const result = formatDate('2025-01-01T00:00:00.000Z')
      expect(result).toContain('2025年1月1日')
    })

    it('handles invalid date', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatDateTime function', () => {
    it('formats datetime to Japanese format with time', () => {
      const date = new Date('2025-12-31T00:00:00.000Z')
      const result = formatDateTime(date)
      // タイムゾーンによって結果が変わる可能性があるため、コロンを含むかのみチェック
      expect(result).toContain(':')
      expect(result).toContain('年')
      expect(result).toContain('月')
      expect(result).toContain('日')
    })

    it('handles string datetime input', () => {
      const result = formatDateTime('2025-01-01T00:00:00.000Z')
      expect(result).toContain('2025年1月1日')
      expect(result).toContain(':')
    })

    it('handles invalid datetime', () => {
      const result = formatDateTime('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })
})