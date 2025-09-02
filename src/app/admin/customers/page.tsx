
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  totalPurchases: number;
  totalSpent: number;
  lastLogin: string;
  status: 'active' | 'inactive';
  purchases?: Array<{
    id: number;
    event: string;
    date: string;
    amount: number;
    tickets: number;
  }>;
}

export default function CustomerManagement() {
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
      registeredAt: '2024-01-15',
      totalPurchases: 5,
      totalSpent: 45000,
      lastLogin: '2024-03-15',
      status: 'active' as const
    },
    {
      id: 2,
      name: '佐藤花子',
      email: 'sato@example.com',
      registeredAt: '2024-02-20',
      totalPurchases: 2,
      totalSpent: 12000,
      lastLogin: '2024-03-10',
      status: 'active' as const
    },
    {
      id: 3,
      name: '山田次郎',
      email: 'yamada@example.com',
      registeredAt: '2024-01-10',
      totalPurchases: 8,
      totalSpent: 78000,
      lastLogin: '2024-03-12',
      status: 'active' as const
    },
    {
      id: 4,
      name: '鈴木三郎',
      email: 'suzuki@example.com',
      registeredAt: '2024-03-01',
      totalPurchases: 1,
      totalSpent: 3000,
      lastLogin: '2024-03-01',
      status: 'inactive' as const
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCustomerDetail = (customer: Customer) => {
    setSelectedCustomer({
      ...customer,
      purchases: [
        { id: 1, event: '春のコンサート2024', date: '2024-03-01', amount: 8000, tickets: 1 },
        { id: 2, event: '夏祭り2024', date: '2024-02-15', amount: 6000, tickets: 2 },
        { id: 3, event: 'ビジネスセミナー', date: '2024-01-20', amount: 5000, tickets: 1 }
      ]
    });
    setShowDetailModal(true);
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
                <p className="text-sm text-gray-600">アクティブ顧客</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
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
                  {(customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length).toFixed(1)}
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
                  ¥{Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toLocaleString()}
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.registeredAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.totalPurchases}回</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">¥{customer.totalSpent.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.lastLogin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status === 'active' ? 'アクティブ' : '非アクティブ'}
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
                ))}
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
                  <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">メールアドレス</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">登録日</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.registeredAt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">最終ログイン</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.lastLogin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">購入回数</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.totalPurchases}回</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">累計購入額</p>
                  <p className="font-medium text-gray-900">¥{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* 購入履歴 */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">購入履歴</h4>
              <div className="space-y-3">
                {selectedCustomer.purchases?.map((purchase) => (
                  <div key={purchase.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{purchase.event}</h5>
                        <p className="text-sm text-gray-600">購入日: {purchase.date}</p>
                        <p className="text-sm text-gray-600">チケット数: {purchase.tickets}枚</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">¥{purchase.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
