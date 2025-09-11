
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCustomers, useOrders } from '@/hooks';
import type { Profile } from '@/types/database';

export default function CustomerManagement() {
  const { customers, loading, error } = useCustomers();
  const { orders } = useOrders(); // 全注文データを取得

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 顧客ごとの購入統計を計算
  const getCustomerStats = (customerId: string) => {
    const customerOrders = orders.filter(order => order.user_id === customerId && order.status === 'paid');
    const totalPurchases = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    return { totalPurchases, totalSpent };
  };

  const showCustomerDetail = (customer: Profile) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
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
              <h1 className="text-xl font-semibold text-gray-900">顧客管理</h1>
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
                <i className="ri-user-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総顧客数</p>
                <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="ri-user-star-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">メンバー顧客</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {customers.filter(c => !c.is_guest).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <i className="ri-shopping-cart-line text-purple-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">平均購入回数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {customers.length > 0 
                    ? (customers.reduce((sum, c) => sum + getCustomerStats(c.id).totalPurchases, 0) / customers.length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <i className="ri-money-yen-circle-line text-orange-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">平均購入額</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ¥{customers.length > 0 
                    ? Math.round(customers.reduce((sum, c) => sum + getCustomerStats(c.id).totalSpent, 0) / customers.length).toLocaleString()
                    : '0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">顧客一覧</h2>
              
              {/* 検索バー */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="名前またはメールで検索"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    購入回数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    累計購入額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終ログイン
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
                {filteredCustomers.map((customer) => {
                  const stats = getCustomerStats(customer.id);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.full_name || '名前未設定'}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stats.totalPurchases}回</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">¥{stats.totalSpent.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(customer.updated_at).toLocaleDateString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !customer.is_guest 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {!customer.is_guest ? 'メンバー' : 'ゲスト'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => showCustomerDetail(customer)}
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

      {/* 顧客詳細モーダル */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">顧客詳細</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <i className="ri-close-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
              </button>
            </div>
            
            {/* 基本情報 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">氏名</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.full_name || '名前未設定'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">メールアドレス</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">登録日</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedCustomer.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">最終更新</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedCustomer.updated_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">権限</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">アカウント種別</p>
                  <p className="font-medium text-gray-900">
                    {selectedCustomer.is_guest ? 'ゲスト' : 'メンバー'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 購入統計 */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">購入統計</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">購入回数</p>
                    <p className="font-medium text-gray-900">{getCustomerStats(selectedCustomer.id).totalPurchases}回</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">累計購入額</p>
                    <p className="font-medium text-gray-900">¥{getCustomerStats(selectedCustomer.id).totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 購入履歴 */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">購入履歴</h4>
              <div className="space-y-3">
                {orders
                  .filter(order => order.user_id === selectedCustomer.id && order.status === 'paid')
                  .slice(0, 5) // 最新5件
                  .map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">注文 #{order.id.slice(-8)}</h5>
                          <p className="text-sm text-gray-600">
                            購入日: {new Date(order.created_at).toLocaleDateString('ja-JP')}
                          </p>
                          <p className="text-sm text-gray-600">
                            アイテム数: {order.order_items?.length || 0}件
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">¥{order.total_amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{order.payment_method}</p>
                        </div>
                      </div>
                    </div>
                  ))
                }
                {orders.filter(order => order.user_id === selectedCustomer.id && order.status === 'paid').length === 0 && (
                  <p className="text-gray-500 text-center py-4">購入履歴がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
