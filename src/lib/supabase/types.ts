export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>
      }
      ticket_types: {
        Row: TicketType
        Insert: Omit<TicketType, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TicketType, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
      tickets: {
        Row: Ticket
        Insert: Omit<Ticket, 'id' | 'created_at'>
        Update: Partial<Omit<Ticket, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'customer' | 'admin' | 'staff'
  is_guest: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string
  date_start: string
  date_end: string
  image_url: string | null
  is_published: boolean
  max_capacity: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  quantity_total: number
  quantity_sold: number
  sale_start: string
  sale_end: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  event_id: string
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payment_method: 'credit_card' | 'paypal' | 'convenience_store' | null
  payment_id: string | null
  guest_info: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  ticket_type_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Ticket {
  id: string
  order_item_id: string
  ticket_type_id: string
  event_id: string
  user_id: string
  qr_code: string
  status: 'valid' | 'used' | 'cancelled'
  used_at: string | null
  created_at: string
}

// 関連データを含む型
export interface EventWithTicketTypes extends Event {
  ticket_types: TicketType[]
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    ticket_type: TicketType
  })[]
}

export interface TicketWithDetails extends Ticket {
  event: Event
  ticket_type: TicketType
}