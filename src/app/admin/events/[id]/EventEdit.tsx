
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEvent } from '@/hooks/useEvents';
import { eventAPI, ticketTypeAPI } from '@/lib/database';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import type { TicketType } from '@/types/database';
import {
  MdArrowBack,
  MdDelete,
  MdClose,
  MdCalendarToday,
  MdLocationOn
} from 'react-icons/md';

interface EventEditProps {
  eventId: string;
}

interface LocalTicketType extends Partial<TicketType> {
  tempId?: string;
  isNew?: boolean;
}

export default function EventEdit({ eventId }: EventEditProps) {
  const { event: dbEvent, loading, error, refetch } = useEvent(eventId);

  const [title, setTitle] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState('/img/event.jpg');
  const [ticketTypes, setTicketTypes] = useState<LocalTicketType[]>([]);

  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (dbEvent) {
      setTitle(dbEvent.title);
      setDateStart(dbEvent.date_start?.split('T')[0] || '');
      setDateEnd(dbEvent.date_end?.split('T')[0] || '');
      setLocation(dbEvent.location || '');
      setDescription(dbEvent.description || '');
      setIsPublished(dbEvent.is_published);
      setImageUrl(dbEvent.image_url || '/img/event.jpg');
      setTicketTypes(dbEvent.ticket_types || []);
    }
  }, [dbEvent]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      // イベント基本情報を更新
      await eventAPI.updateEvent(eventId, {
        title,
        date_start: dateStart,
        date_end: dateEnd,
        location,
        description,
        is_published: isPublished,
        image_url: imageUrl,
      });

      // チケット種類の更新
      for (const ticket of ticketTypes) {
        if (ticket.isNew && ticket.tempId) {
          // 新規チケット作成
          await ticketTypeAPI.createTicketType({
            event_id: eventId,
            name: ticket.name || '',
            price: ticket.price || 0,
            quantity_total: ticket.quantity_total || 0,
            quantity_sold: 0,
            sale_start: ticket.sale_start || new Date().toISOString(),
            sale_end: ticket.sale_end || new Date().toISOString(),
            description: ticket.description || '',
            is_active: true,
          });
        } else if (ticket.id && ticket.name && ticket.price !== undefined && ticket.quantity_total !== undefined && ticket.sale_start && ticket.sale_end) {
          // 既存チケット更新
          await ticketTypeAPI.updateTicketType(ticket.id, {
            name: ticket.name,
            price: ticket.price,
            quantity_total: ticket.quantity_total,
            sale_start: ticket.sale_start,
            sale_end: ticket.sale_end,
            description: ticket.description || '',
          });
        }
      }

      // データを再取得
      await refetch();
      alert('イベント情報を保存しました');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTicketType = () => {
    const tempId = `temp-${Date.now()}`;
    const newTicketType: LocalTicketType = {
      tempId,
      isNew: true,
      name: '新しいチケット',
      price: 1000,
      quantity_total: 50,
      quantity_sold: 0,
      sale_start: new Date().toISOString(),
      sale_end: new Date().toISOString(),
      description: '',
      is_active: true,
    };
    setTicketTypes([...ticketTypes, newTicketType]);
  };

  const handleRemoveTicketType = async (ticket: LocalTicketType) => {
    if (ticket.isNew) {
      // 新規追加の場合はローカルから削除
      setTicketTypes(ticketTypes.filter(t => t.tempId !== ticket.tempId));
    } else if (ticket.id) {
      // 既存の場合はDBから削除
      try {
        await ticketTypeAPI.deleteTicketType(ticket.id);
        await refetch();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'チケット削除に失敗しました');
      }
    }
  };

  const updateTicketType = (ticketId: string | undefined, tempId: string | undefined, field: string, value: string | number | boolean) => {
    setTicketTypes(
      ticketTypes.map(ticket => {
        if (ticket.id === ticketId || ticket.tempId === tempId) {
          return { ...ticket, [field]: value };
        }
        return ticket;
      })
    );
  };

  const getTicketStatusColor = (isActive: boolean | undefined) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTicketStatusText = (isActive: boolean | undefined) => {
    return isActive ? '販売中' : '停止';
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!dbEvent) return <ErrorScreen message="イベントが見つかりません" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/events"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdArrowBack className="text-gray-600 text-xl w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">イベント編集</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                プレビュー
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {saveError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{saveError}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* タブナビゲーション */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                基本情報
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'tickets'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                チケット設定
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      イベント名
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開催地
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開始日
                    </label>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      終了日
                    </label>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    イベント説明
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={!isPublished}
                        onChange={() => setIsPublished(false)}
                        className="mr-2"
                      />
                      下書き
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={isPublished}
                        onChange={() => setIsPublished(true)}
                        className="mr-2"
                      />
                      公開
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">チケット種類</h3>
                  <button
                    onClick={handleAddTicketType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    チケット追加
                  </button>
                </div>

                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id || ticket.tempId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.is_active)}`}>
                            {getTicketStatusText(ticket.is_active)}
                          </span>
                        </div>
                        {ticketTypes.length > 1 && (
                          <button
                            onClick={() => handleRemoveTicketType(ticket)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <MdDelete className="text-lg w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            チケット名
                          </label>
                          <input
                            type="text"
                            value={ticket.name || ''}
                            onChange={(e) => updateTicketType(ticket.id, ticket.tempId, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            価格 (円)
                          </label>
                          <input
                            type="number"
                            value={ticket.price || 0}
                            onChange={(e) => updateTicketType(ticket.id, ticket.tempId, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            販売数量
                          </label>
                          <input
                            type="number"
                            value={ticket.quantity_total || 0}
                            onChange={(e) => updateTicketType(ticket.id, ticket.tempId, 'quantity_total', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          説明
                        </label>
                        <textarea
                          value={ticket.description || ''}
                          onChange={(e) => updateTicketType(ticket.id, ticket.tempId, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          maxLength={500}
                        />
                      </div>

                      {/* チケットステータス管理ボタン */}
                      <div className="flex space-x-2 mt-4">
                        {!ticket.is_active && (
                          <button
                            onClick={() => updateTicketType(ticket.id, ticket.tempId, 'is_active', true)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                          >
                            販売開始
                          </button>
                        )}
                        {ticket.is_active && (
                          <button
                            onClick={() => updateTicketType(ticket.id, ticket.tempId, 'is_active', false)}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
                          >
                            販売停止
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">イベントプレビュー</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MdClose className="text-gray-600 text-xl w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <Image
                  src={imageUrl}
                  alt={title}
                  width={768}
                  height={256}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  unoptimized={true}
                />

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MdCalendarToday className="text-lg mr-3 w-5 h-5" />
                      <span>{dateStart} 〜 {dateEnd}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdLocationOn className="text-lg mr-3 w-5 h-5" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">イベント詳細</h2>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">チケット</h2>
                  <div className="grid gap-4">
                    {ticketTypes.filter(ticket => ticket.is_active).map((ticket) => (
                      <div key={ticket.id || ticket.tempId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.is_active)}`}>
                                {getTicketStatusText(ticket.is_active)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">¥{(ticket.price || 0).toLocaleString()}</div>
                            <div className="text-sm text-gray-500">残り{(ticket.quantity_total || 0) - (ticket.quantity_sold || 0)}枚</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
