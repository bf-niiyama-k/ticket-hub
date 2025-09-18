import { render, screen } from '@testing-library/react'
import EventCard from '@/components/shared/EventCard'
import { EventCardData } from '@/components/shared/EventCard'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock event data
const mockEvent: EventCardData = {
  id: '1',
  title: 'テストイベント',
  date: '2025-12-31T18:00:00.000Z',
  venue: '東京ドーム',
  price: 5000,
  image: '/test-image.jpg',
  status: 'published',
  totalTickets: 100,
  ticketsSold: 0
}

describe('EventCard Component', () => {
  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />)
    
    // イベントタイトルが表示されている
    expect(screen.getByText('テストイベント')).toBeInTheDocument()
    
    // 開催場所が表示されている
    expect(screen.getByText('東京ドーム')).toBeInTheDocument()
    
    // 価格が表示されている
    expect(screen.getByText('¥5,000')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<EventCard event={mockEvent} />)
    
    const image = screen.getByAltText('テストイベント')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  it('shows sold out status when applicable', () => {
    const soldOutEvent = { ...mockEvent, status: 'sold-out' as const }
    render(<EventCard event={soldOutEvent} />)
    
    expect(screen.getByText('売り切れ')).toBeInTheDocument()
  })

  it('renders link to event detail page', () => {
    render(<EventCard event={mockEvent} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/events/1')
  })
})