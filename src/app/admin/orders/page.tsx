
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders, useCustomers, useEvents } from '@/hooks';
import type { OrderWithItems } from '@/types/database';
import {
  MdArrowBack,
  MdShoppingCart,
  MdCheck,
  MdSchedule,
  MdCurrencyYen,
  MdSearch,
  MdClose
} from 'react-icons/md';

export default function OrderManagement() {
  const { orders, loading, error, updateOrder } = useOrders();
  const { customers } = useCustomers();
  const { events } = useEvents(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 顧客名を取得するヘルパー関数
  const getCustomerName = (userId: string | null, guestInfo?: { name?: string; email?: string } | null) => {
    if (!userId) {
      // ゲスト購入の場合
      return guestInfo?.name || 'ゲスト';
    }
    const customer = customers.find(c => c.id === userId);
    return customer?.full_name || customer?.email || 'ゲスト';
  };

  // 顧客メールを取得するヘルパー関数
  const getCustomerEmail = (userId: string | null, guestInfo?: { name?: string; email?: string } | null) => {
    if (!userId) {
      // ゲスト購入の場合
      return guestInfo?.email || '';
    }
    const customer = customers.find(c => c.id === userId);
    return customer?.email || '';
  };

  // イベント名を取得するヘルパー関数
  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || '不明なイベント';
  };

  // フィルタリング処理
  const filteredOrders = orders.filter(order => {
    // ステータスフィルター
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    // 検索フィルター
    if (!searchTerm) return matchesStatus;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(searchLower) ||
      getCustomerName(order.user_id, order.guest_info).toLowerCase().includes(searchLower) ||
      getCustomerEmail(order.user_id, order.guest_info).toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const showOrderDetail = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm('この注文を返金してもよろしいですか？\nチケットはキャンセルされ、在庫が復元されます。')) {
      return;
    }

    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '返金処理に失敗しました');
      }

      // 成功時
      alert('返金処理が完了しました');
      setShowDetailModal(false);

      // 注文リストを再取得するため、ページをリロード
      window.location.reload();
    } catch (error) {
      console.error('返金エラー:', error);
      alert(error instanceof Error ? error.message : '返金処理に失敗しました');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'paid' | 'cancelled' | 'refunded') => {
    try {
      await updateOrder(orderId, { status: newStatus });
      setShowDetailModal(false);
    } catch {
      alert('ステータス更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">エラーが発生しました: {error}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return '完了';
      case 'pending':
        return '処理中';
      case 'cancelled':
        return 'キャンセル';
      case 'refunded':
        return '返金済み';
      default:
        return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdArrowBack className="text-gray-600 text-xl w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">注文管理</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdShoppingCart className="text-blue-600 text-xl w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総注文数</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdCheck className="text-green-600 text-xl w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完了注文</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'paid').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MdSchedule className="text-yellow-600 text-xl w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">処理中注文</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MdCurrencyYen className="text-purple-600 text-xl w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総売上</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ¥{orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">注文一覧</h2>

              {/* 検索とフィルター */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="注文ID、顧客名、メールで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-64"
                  />
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                >
                  <option value="all">すべて</option>
                  <option value="paid">完了</option>
                  <option value="pending">処理中</option>
                  <option value="cancelled">キャンセル</option>
                  <option value="refunded">返金済み</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注文ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    イベント
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    チケット
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注文日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getCustomerName(order.user_id, order.guest_info)}</div>
                          <div className="text-sm text-gray-500">{getCustomerEmail(order.user_id, order.guest_info)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getEventTitle(order.event_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.order_items?.length || 0}種類 × {totalItems}枚
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ¥{order.total_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => showOrderDetail(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 注文詳細モーダル */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">注文詳細</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MdClose className="text-gray-600 text-xl w-5 h-5" />
              </button>
            </div>
            
            {/* 注文情報 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">注文ID</p>
                  <p className="font-medium text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">注文日</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ステータス</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">決済方法</p>
                  <p className="font-medium text-gray-900">{selectedOrder.payment_method || '未設定'}</p>
                </div>
              </div>
            </div>
            
            {/* 顧客情報 */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">顧客情報</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">氏名</p>
                    <p className="font-medium text-gray-900">{getCustomerName(selectedOrder.user_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="font-medium text-gray-900">{getCustomerEmail(selectedOrder.user_id)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 注文アイテム */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">注文アイテム</h4>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{getEventTitle(selectedOrder.event_id)}</h5>
                        <p className="text-sm text-gray-600">
                          {item.ticket_type?.name || 'チケット種類不明'}
                        </p>
                        <p className="text-sm text-gray-600">
                          単価: ¥{item.unit_price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                        <p className="font-semibold text-gray-900">¥{item.total_price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">合計金額</span>
                    <span className="text-lg font-bold text-blue-600">
                      ¥{selectedOrder.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* アクション */}
            <div className="flex justify-end space-x-3">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  完了にする
                </button>
              )}
              
              {selectedOrder.status === 'paid' && (
                <button
                  onClick={() => handleRefund(selectedOrder.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  返金処理
                </button>
              )}
              
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
