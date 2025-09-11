import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../lib/database';
import type { SalesStats, EventSalesData } from '../types/database';

export function useAnalytics() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [eventSales, setEventSales] = useState<EventSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, eventSalesData] = await Promise.all([
        analyticsAPI.getSalesStats(),
        analyticsAPI.getEventSales()
      ]);

      setStats(statsData);
      
      // イベント売上データにパーセンテージを追加
      const totalRevenue = eventSalesData.reduce((sum, event) => sum + event.revenue, 0);
      const eventSalesWithPercentage = eventSalesData.map(event => ({
        ...event,
        percentage: totalRevenue > 0 ? (event.revenue / totalRevenue) * 100 : 0
      }));
      
      setEventSales(eventSalesWithPercentage);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    eventSales,
    loading,
    error,
    refetch: fetchAnalytics
  };
}