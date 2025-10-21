// Re-export all database types from Supabase types
export type {
  Database,
  Profile,
  Event,
  EventWithTicketTypes,
  TicketType,
  Order,
  OrderItem,
  OrderWithItems,
  Ticket,
  TicketWithDetails,
  GuestInfo,
} from "../lib/supabase/types";

import type { Profile, OrderWithItems } from "../lib/supabase/types";

// Additional application-specific types
export interface EventFormData {
  title: string;
  description: string;
  location: string;
  date_start: string;
  date_end: string;
  image_url?: string;
  max_capacity?: number;
  is_published: boolean;
}

export interface TicketTypeFormData {
  name: string;
  description?: string;
  price: number;
  quantity_total: number;
  sale_start: string;
  sale_end: string;
  is_active: boolean;
}

export interface OrderFormData {
  event_id: string;
  items: Array<{
    ticket_type_id: string;
    quantity: number;
    unit_price: number;
  }>;
  guest_info?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface ProfileFormData {
  full_name?: string;
  avatar_url?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

// Filter and sort types
export interface EventFilters {
  search?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  isPublished?: boolean;
}

export interface OrderFilters {
  status?: "pending" | "paid" | "cancelled" | "refunded";
  dateStart?: string;
  dateEnd?: string;
  eventId?: string;
}

export interface CustomerFilters {
  search?: string;
  status?: "active" | "inactive";
  registeredStart?: string;
  registeredEnd?: string;
}

// Chart data types for analytics
export interface SalesChartData {
  date: string;
  sales: number;
  tickets: number;
}

export interface EventSalesData {
  eventId: string;
  eventTitle: string;
  revenue: number;
  tickets: number;
  percentage: number;
}

export interface TicketTypeDistribution {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  customers: number;
  growth: number;
}

// Statistics types
export interface SalesStats {
  totalRevenue: number;
  totalTickets: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueGrowth?: number;
  ticketGrowth?: number;
  customerGrowth?: number;
}

// Error types
export interface DatabaseErrorInfo {
  code?: string;
  message: string;
  details?: string;
}

// Status types
export type EventStatus = "draft" | "published";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";
export type TicketStatus = "valid" | "used" | "cancelled";
export type PaymentMethod = "credit_card" | "paypay" | "convenience_store";
export type UserRole = "customer" | "admin" | "staff";

// UI Component data types (matching existing components)
export interface EventCardData {
  id: number;
  title: string;
  date: string;
  venue: string;
  price: number;
  image: string;
  status: string;
  category: string;
}

export interface CustomerTableData {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  totalPurchases: number;
  totalSpent: number;
  lastLogin: string;
  status: "active" | "inactive";
}

export interface OrderTableData {
  id: string;
  customerName: string;
  customerEmail: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
  paymentMethod: string;
  qrCode: string | null;
}

// Hook return types
export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Additional profile fields (extends supabase Profile)
export interface ProfileExtended extends Profile {
  phone: string | null;
}

export interface UseOrdersReturn {
  orders: OrderWithItems[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCustomersReturn {
  customers: Profile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseAnalyticsReturn {
  stats: SalesStats | null;
  eventSales: EventSalesData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Modal state types
export interface ModalState {
  isOpen: boolean;
  type: "create" | "edit" | "delete" | "view";
  data?: unknown;
}

// Search and pagination types
export interface SearchState {
  query: string;
  filters: Record<string, unknown>;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// Date range types
export interface DateRange {
  start: string;
  end: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}
