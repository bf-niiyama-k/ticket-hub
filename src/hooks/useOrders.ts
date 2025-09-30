import { useState, useEffect, useCallback } from 'react';
import { orderAPI } from '../lib/database';
import type { OrderWithItems } from '../types/database';

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = userId 
        ? await orderAPI.getUserOrders(userId)
        : await orderAPI.getAllOrders();
      
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注文の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = useCallback(async (orderData: Parameters<typeof orderAPI.createOrder>[0]) => {
    try {
      setError(null);
      const newOrder = await orderAPI.createOrder(orderData);
      await fetchOrders(); // リフレッシュ
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注文の作成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchOrders]);

  const updateOrder = useCallback(async (id: string, updates: Parameters<typeof orderAPI.updateOrder>[1]) => {
    try {
      setError(null);
      const updatedOrder = await orderAPI.updateOrder(id, updates);
      await fetchOrders(); // リフレッシュ
      return updatedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注文の更新に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrder
  };
}

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '注文情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { order, loading, error };
}