import { useState, useEffect, useCallback } from 'react';
import { eventAPI } from '../lib/database';
import type { EventWithTicketTypes } from '../types/database';

export function useEvents(publishedOnly = false) {
  const [events, setEvents] = useState<EventWithTicketTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = publishedOnly 
        ? await eventAPI.getPublishedEvents()
        : await eventAPI.getAllEvents();
      
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'イベントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [publishedOnly]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (eventData: Parameters<typeof eventAPI.createEvent>[0]) => {
    try {
      setError(null);
      const newEvent = await eventAPI.createEvent(eventData);
      await fetchEvents(); // リフレッシュ
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'イベントの作成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchEvents]);

  const updateEvent = useCallback(async (id: string, updates: Parameters<typeof eventAPI.updateEvent>[1]) => {
    try {
      setError(null);
      const updatedEvent = await eventAPI.updateEvent(id, updates);
      await fetchEvents(); // リフレッシュ
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'イベントの更新に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      setError(null);
      await eventAPI.deleteEvent(id);
      await fetchEvents(); // リフレッシュ
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'イベントの削除に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchEvents]);

  const toggleEventStatus = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedEvent = await eventAPI.toggleEventStatus(id);
      await fetchEvents(); // リフレッシュ
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'イベント状態の変更に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus
  };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<EventWithTicketTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await eventAPI.getEventById(id);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'イベントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  };
}