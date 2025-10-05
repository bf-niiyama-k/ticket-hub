import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Ticket } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typedSupabase = supabase as any;

interface TicketWithDetails extends Ticket {
  event?: {
    id: string;
    title: string;
    date_start: string;
    time_start: string | null;
    venue: string | null;
    image_url: string | null;
  };
  ticket_type?: {
    id: string;
    name: string;
    price: number;
  };
}

export function useTickets(orderId: string | null) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);

        // 注文IDに紐づく注文アイテムIDを取得
        const { data: orderItems, error: orderItemsError } = await typedSupabase
          .from('order_items')
          .select('id')
          .eq('order_id', orderId);

        if (orderItemsError) throw orderItemsError;

        if (!orderItems || orderItems.length === 0) {
          setTickets([]);
          return;
        }

        const orderItemIds = orderItems.map((item: { id: string }) => item.id);

        // チケットとイベント情報を取得
        const { data, error: fetchError } = await typedSupabase
          .from('tickets')
          .select(`
            *,
            event:events(id, title, date_start, time_start, venue, image_url),
            ticket_type:ticket_types(id, name, price)
          `)
          .in('order_item_id', orderItemIds);

        if (fetchError) throw fetchError;
        setTickets(data as TicketWithDetails[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケット情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [orderId]);

  return { tickets, loading, error };
}

export function useUserTickets(userId: string | null | undefined) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setTickets([]);
      return;
    }

    const fetchUserTickets = async () => {
      try {
        setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('tickets')
          .select(`
            *,
            event:events(id, title, date_start, time_start, venue, image_url),
            ticket_type:ticket_types(id, name, price)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setTickets(data as TicketWithDetails[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケット情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [userId]);

  return { tickets, loading, error };
}
