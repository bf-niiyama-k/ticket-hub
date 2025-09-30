import { supabase } from './supabase/client';
import type { Database } from './supabase/types';
import type { 
  Event, 
  EventWithTicketTypes, 
  TicketType, 
  Order, 
  OrderWithItems, 
  Ticket, 
  TicketWithDetails, 
  Profile 
} from './supabase/types';

type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];
type TicketTypeInsert = Database['public']['Tables']['ticket_types']['Insert'];
type TicketTypeUpdate = Database['public']['Tables']['ticket_types']['Update'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export class DatabaseError extends Error {
  constructor(message: string, public override cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// イベント関連API
export const eventAPI = {
  // 公開イベント一覧取得
  async getPublishedEvents(): Promise<EventWithTicketTypes[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('is_published', true)
        .order('date_start', { ascending: true });

      if (error) throw new DatabaseError('公開イベント取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('公開イベント取得に失敗しました', error as Error);
    }
  },

  // 全イベント取得（管理者用）
  async getAllEvents(): Promise<EventWithTicketTypes[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError('イベント取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('イベント取得に失敗しました', error as Error);
    }
  },

  // 単一イベント取得
  async getEventById(id: string): Promise<EventWithTicketTypes | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError('イベント取得に失敗しました', error);
      }
      return data;
    } catch (error) {
      throw new DatabaseError('イベント取得に失敗しました', error as Error);
    }
  },

  // イベント作成
  async createEvent(event: EventInsert): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();

      if (error) throw new DatabaseError('イベント作成に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('イベント作成に失敗しました', error as Error);
    }
  },

  // イベント更新
  async updateEvent(id: string, updates: EventUpdate): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError('イベント更新に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('イベント更新に失敗しました', error as Error);
    }
  },

  // イベント削除
  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('イベント削除に失敗しました', error);
    } catch (error) {
      throw new DatabaseError('イベント削除に失敗しました', error as Error);
    }
  },

  // イベント公開状態切り替え
  async toggleEventStatus(id: string): Promise<Event> {
    try {
      // 現在の状態を取得
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('is_published')
        .eq('id', id)
        .single();

      if (fetchError) throw new DatabaseError('イベント状態取得に失敗しました', fetchError);

      // 状態を反転
      const { data, error } = await supabase
        .from('events')
        .update({ is_published: !currentEvent.is_published })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError('イベント状態更新に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('イベント状態更新に失敗しました', error as Error);
    }
  }
};

// チケット種類関連API
export const ticketTypeAPI = {
  // イベントのチケット種類取得
  async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw new DatabaseError('チケット種類取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('チケット種類取得に失敗しました', error as Error);
    }
  },

  // チケット種類作成
  async createTicketType(ticketType: TicketTypeInsert): Promise<TicketType> {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .insert(ticketType)
        .select()
        .single();

      if (error) throw new DatabaseError('チケット種類作成に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('チケット種類作成に失敗しました', error as Error);
    }
  },

  // チケット種類更新
  async updateTicketType(id: string, updates: TicketTypeUpdate): Promise<TicketType> {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError('チケット種類更新に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('チケット種類更新に失敗しました', error as Error);
    }
  },

  // チケット種類削除
  async deleteTicketType(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('チケット種類削除に失敗しました', error);
    } catch (error) {
      throw new DatabaseError('チケット種類削除に失敗しました', error as Error);
    }
  }
};

// 注文関連API
export const orderAPI = {
  // ユーザーの注文一覧取得
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            ticket_type:ticket_types (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError('注文履歴取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('注文履歴取得に失敗しました', error as Error);
    }
  },

  // 全注文取得（管理者用）
  async getAllOrders(): Promise<OrderWithItems[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            ticket_type:ticket_types (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError('注文一覧取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('注文一覧取得に失敗しました', error as Error);
    }
  },

  // 単一注文取得
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            ticket_type:ticket_types (*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError('注文取得に失敗しました', error);
      }
      return data;
    } catch (error) {
      throw new DatabaseError('注文取得に失敗しました', error as Error);
    }
  },

  // 注文作成
  async createOrder(order: OrderInsert): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (error) throw new DatabaseError('注文作成に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('注文作成に失敗しました', error as Error);
    }
  },

  // 注文更新
  async updateOrder(id: string, updates: OrderUpdate): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError('注文更新に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('注文更新に失敗しました', error as Error);
    }
  }
};

// チケット関連API
export const ticketAPI = {
  // ユーザーのチケット取得
  async getUserTickets(userId: string): Promise<TicketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events (*),
          ticket_type:ticket_types (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError('チケット取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('チケット取得に失敗しました', error as Error);
    }
  },

  // QRコードでチケット検索
  async getTicketByQR(qrCode: string): Promise<TicketWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events (*),
          ticket_type:ticket_types (*)
        `)
        .eq('qr_code', qrCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError('チケット検索に失敗しました', error);
      }
      return data;
    } catch (error) {
      throw new DatabaseError('チケット検索に失敗しました', error as Error);
    }
  },

  // チケット使用
  async useTicket(id: string): Promise<Ticket> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ 
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError('チケット使用処理に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('チケット使用処理に失敗しました', error as Error);
    }
  }
};

// プロフィール関連API
export const profileAPI = {
  // プロフィール取得
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError('プロフィール取得に失敗しました', error);
      }
      return data;
    } catch (error) {
      throw new DatabaseError('プロフィール取得に失敗しました', error as Error);
    }
  },

  // 全プロフィール取得（管理者用）
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError('プロフィール一覧取得に失敗しました', error);
      return data || [];
    } catch (error) {
      throw new DatabaseError('プロフィール一覧取得に失敗しました', error as Error);
    }
  },

  // プロフィール更新
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw new DatabaseError('プロフィール更新に失敗しました', error);
      return data;
    } catch (error) {
      throw new DatabaseError('プロフィール更新に失敗しました', error as Error);
    }
  }
};

// 統計・分析API
export const analyticsAPI = {
  // 売上統計取得
  async getSalesStats(): Promise<{
    totalRevenue: number;
    totalTickets: number;
    totalCustomers: number;
    avgOrderValue: number;
  }> {
    try {
      const [revenueResult, ticketsResult, customersResult] = await Promise.all([
        supabase.from('orders').select('total_amount').eq('status', 'paid'),
        supabase.from('tickets').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' })
      ]);

      if (revenueResult.error) throw new DatabaseError('売上統計取得に失敗しました', revenueResult.error);
      if (ticketsResult.error) throw new DatabaseError('チケット統計取得に失敗しました', ticketsResult.error);
      if (customersResult.error) throw new DatabaseError('顧客統計取得に失敗しました', customersResult.error);

      const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalTickets = ticketsResult.count || 0;
      const totalCustomers = customersResult.count || 0;
      const avgOrderValue = revenueResult.data && revenueResult.data.length > 0 
        ? totalRevenue / revenueResult.data.length 
        : 0;

      return {
        totalRevenue,
        totalTickets,
        totalCustomers,
        avgOrderValue
      };
    } catch (error) {
      throw new DatabaseError('統計情報取得に失敗しました', error as Error);
    }
  },

  // イベント別売上
  async getEventSales(): Promise<Array<{ eventId: string; eventTitle: string; revenue: number; tickets: number }>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          event_id,
          total_amount,
          order_items (quantity),
          events!inner (title)
        `)
        .eq('status', 'paid');

      if (error) throw new DatabaseError('イベント別売上取得に失敗しました', error);

      const eventSales = new Map<string, { title: string; revenue: number; tickets: number }>();
      
      data?.forEach(order => {
        const eventId = order.event_id;
        const title = (order.events as unknown as Event)?.title || '';
        const revenue = order.total_amount;
        const tickets = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        if (eventSales.has(eventId)) {
          const existing = eventSales.get(eventId)!;
          existing.revenue += revenue;
          existing.tickets += tickets;
        } else {
          eventSales.set(eventId, { title, revenue, tickets });
        }
      });

      return Array.from(eventSales.entries()).map(([eventId, stats]) => ({
        eventId,
        eventTitle: stats.title,
        revenue: stats.revenue,
        tickets: stats.tickets
      }));
    } catch (error) {
      throw new DatabaseError('イベント別売上取得に失敗しました', error as Error);
    }
  }
};