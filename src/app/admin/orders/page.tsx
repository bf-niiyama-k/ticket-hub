
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OrderManagement() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customerName: '田中太郎',
      customerEmail: 'tanaka@example.com',
      eventTitle: '春のコンサート2024',
      ticketType: 'VIPチケット',
      quantity: 2,
      totalAmount: 16000,
      orderDate: '2024-03-15',
      status: 'completed',
      paymentMethod: 'クレジットカード',
      qrCode: 'QR-123456'
    },
    {
      id: 'ORD-002',
      customerName: '佐藤花子',
      customerEmail: 'sato@example.com',
      eventTitle: '夏祭り2024',
      ticketType: '一般チケット',
      quantity: 1,
      totalAmount: 3000,
      orderDate: '2024-03-14',
      status: 'completed',
      paymentMethod: 'PayPay',
      qrCode: 'QR-123457'
    },
    {
      id: 'ORD-003',
      customerName: '山田次郎',
      customerEmail: 'yamada@example.com',
      eventTitle: 'ビジネスセミナー',
      ticketType: '一般チケット',
      quantity: 1,
      totalAmount: 5000,
      orderDate: '2024-03-13',
      status: 'pending',
      paymentMethod: 'コンビニ決済',
      qrCode: null
    },
    {
      id: 'ORD-004',
      customerName: '鈴木三郎',
      customerEmail: 'suzuki@example.com',
      eventTitle: '春のコンサート2024',
      ticketType: '学生チケット',
      quantity: 1,
      totalAmount: 2000,
      orderDate: '2024-03-12',
      status: 'refunded',
      paymentMethod: 'クレジットカード',
      qrCode: 'QR-123458'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const showOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleRefund = (orderId: string) => {
    if (confirm('この注文を返金してもよろしいですか？')) {
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'refunded' }
          : order
      ));
      setShowDetailModal(false);
      alert('返金処理が完了しました');
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
    setShowDetailModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'pending':
        return '処理中';
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
                <i className="ri-arrow-left-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
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
                <i className="ri-shopping-cart-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
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
                <i className="ri-check-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完了注文</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="ri-time-line text-yellow-600 text-xl w-6 h-6 flex items-center justify-center"></i>
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
                <i className="ri-money-yen-circle-line text-purple-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総売上</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ¥{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">注文一覧</h2>
              
              {/* フィルター */}
              <div className="flex space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                >
                  <option value="all">すべて</option>
                  <option value="completed">完了</option>
                  <option value="pending">処理中</option>
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.eventTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.ticketType} × {order.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{order.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.orderDate}</div>
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
                ))}
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
                <i className="ri-close-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
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
                  <p className="font-medium text-gray-900">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ステータス</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">決済方法</p>
                  <p className="font-medium text-gray-900">{selectedOrder.paymentMethod}</p>
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
                    <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerEmail}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* チケット情報 */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">チケット情報</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{selectedOrder.eventTitle}</h5>
                    <p className="text-sm text-gray-600">{selectedOrder.ticketType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">数量: {selectedOrder.quantity}</p>
                    <p className="font-semibold text-gray-900">¥{selectedOrder.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedOrder.qrCode && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">QRコード</p>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <div className="w-32 h-32 bg-white border-2 border-gray-300 mx-auto mb-2 flex items-center justify-center">
                        <i className="ri-qr-code-line text-4xl text-gray-400"></i>
                      </div>
                      <p className="text-xs text-gray-600">{selectedOrder.qrCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* アクション */}
            <div className="flex justify-end space-x-3">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  完了にする
                </button>
              )}
              
              {selectedOrder.status === 'completed' && (
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
