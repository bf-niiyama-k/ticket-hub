
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import {
  MdArrowBack,
  MdCurrencyYen,
  MdConfirmationNumber,
  MdPerson,
  MdShoppingCart,
  MdArrowUpward,
  MdLock,
  MdWorkspacePremium
} from 'react-icons/md';

export default function Analytics() {
  const { user } = useAuth();
  const { stats, eventSales, loading, error } = useAnalytics();
  const [dateRange, setDateRange] = useState('7days');
  
  // プレミアムユーザー判定（ここでは仮実装）
  const isPremiumUser = user?.role === 'admin';

  // ダミーデータ（実際の実装では、useAnalyticsから取得）
  const salesData = [
    { date: '2024/01/01', sales: 150000, tickets: 50 },
    { date: '2024/01/02', sales: 180000, tickets: 60 },
    { date: '2024/01/03', sales: 120000, tickets: 40 },
    { date: '2024/01/04', sales: 200000, tickets: 65 },
    { date: '2024/01/05', sales: 160000, tickets: 55 },
    { date: '2024/01/06', sales: 220000, tickets: 75 },
    { date: '2024/01/07', sales: 190000, tickets: 62 }
  ];

  const ticketTypeData = [
    { name: '一般チケット', value: 45, color: '#3B82F6' },
    { name: 'VIPチケット', value: 25, color: '#10B981' },
    { name: '学生チケット', value: 20, color: '#F59E0B' },
    { name: 'グループチケット', value: 10, color: '#EF4444' }
  ];

  const monthlyData = [
    { month: '2024/01', revenue: 500000, customers: 120 },
    { month: '2024/02', revenue: 650000, customers: 140 },
    { month: '2024/03', revenue: 800000, customers: 180 },
    { month: '2024/04', revenue: 750000, customers: 165 },
    { month: '2024/05', revenue: 900000, customers: 200 },
    { month: '2024/06', revenue: 850000, customers: 190 }
  ];

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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">データがありません</p>
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
                <MdArrowBack className="text-gray-600 text-xl w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">売上分析</h1>
              {!isPremiumUser && (
                <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  プレビュー
                </div>
              )}
              {isPremiumUser && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  プレミアム
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm pr-8 ${!isPremiumUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isPremiumUser}
              >
                <option value="7days">過去7日間</option>
                <option value="30days">過去30日間</option>
                <option value="3months">過去3ヶ月</option>
                <option value="1year">過去1年</option>
              </select>
              
              <button 
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ${!isPremiumUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isPremiumUser}
              >
                レポート出力
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 非課金ユーザー向けアップグレード案内 */}
        {!isPremiumUser && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdWorkspacePremium className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">プレミアムプランで全機能を利用</h3>
                  <p className="text-gray-600">詳細な分析データとフル機能をご利用いただけます</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                アップグレード
              </button>
            </div>
          </div>
        )}

        {/* モザイク効果用のオーバーレイコンポーネント */}
        <div className="relative">
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総売上</p>
                  <p className="text-2xl font-semibold text-gray-900">¥{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <MdCurrencyYen className="text-green-600 text-xl w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <MdArrowUpward className="text-green-500 text-sm w-4 h-4 mr-1" />
                <span className="text-sm text-green-600">+{stats.revenueGrowth || 0}%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <MdLock className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">販売チケット数</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTickets.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MdConfirmationNumber className="text-blue-600 text-xl w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <MdArrowUpward className="text-green-500 text-sm w-4 h-4 mr-1" />
                <span className="text-sm text-green-600">+{stats.ticketGrowth || 0}%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <MdLock className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">顧客数</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MdPerson className="text-purple-600 text-xl w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <MdArrowUpward className="text-green-500 text-sm w-4 h-4 mr-1" />
                <span className="text-sm text-green-600">+{stats.customerGrowth || 0}%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <MdLock className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均注文額</p>
                  <p className="text-2xl font-semibold text-gray-900">¥{stats.avgOrderValue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MdShoppingCart className="text-orange-600 text-xl w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <MdArrowUpward className="text-green-500 text-sm w-4 h-4 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <MdLock className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 売上推移 */}
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">売上推移（7日間）</h3>
              <div className="space-y-3">
                {salesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{item.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">¥{item.sales.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{item.tickets}枚</div>
                    </div>
                  </div>
                ))}
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MdLock className="text-gray-400 text-3xl mb-2 mx-auto" />
                    <p className="text-gray-600 font-medium">プレミアムプランで詳細表示</p>
                  </div>
                </div>
              )}
            </div>

            {/* チケット種類別売上 */}
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">チケット種類別売上</h3>
              <div className="space-y-4">
                {ticketTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 rounded-full" 
                          style={{backgroundColor: item.color, width: `${item.value}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MdLock className="text-gray-400 text-3xl mb-2 mx-auto" />
                    <p className="text-gray-600 font-medium">プレミアムプランで詳細表示</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* イベント別売上 */}
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">イベント別売上</h3>
              <div className="space-y-4">
                {eventSales.slice(0, 5).map((event, index) => {
                  const maxSales = Math.max(...eventSales.map(e => e.revenue));
                  const widthPercentage = maxSales > 0 ? (event.revenue / maxSales) * 100 : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{event.eventTitle}</span>
                        <span className="text-sm font-semibold text-gray-900">¥{event.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full">
                        <div 
                          className="h-3 bg-green-500 rounded-full transition-all duration-300" 
                          style={{width: `${widthPercentage}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{event.tickets}枚販売 ({event.percentage.toFixed(1)}%)</div>
                    </div>
                  );
                })}
                {eventSales.length === 0 && (
                  <p className="text-gray-500 text-center py-4">売上データがありません</p>
                )}
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MdLock className="text-gray-400 text-3xl mb-2 mx-auto" />
                    <p className="text-gray-600 font-medium">プレミアムプランで詳細表示</p>
                  </div>
                </div>
              )}
            </div>

            {/* 月別収益 */}
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別収益</h3>
              <div className="space-y-6">
                {monthlyData.map((month, index) => {
                  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));
                  const widthPercentage = (month.revenue / maxRevenue) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                        <span className="text-sm font-semibold text-gray-900">¥{month.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full">
                        <div 
                          className="h-4 bg-purple-500 rounded-full transition-all duration-300" 
                          style={{width: `${widthPercentage}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{month.customers}人の顧客</div>
                    </div>
                  );
                })}
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MdLock className="text-gray-400 text-3xl mb-2 mx-auto" />
                    <p className="text-gray-600 font-medium">プレミアムプランで詳細表示</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 詳細テーブル */}
          <div className="bg-white rounded-lg shadow-sm mt-8 relative">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">イベント詳細レポート</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      イベント名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      販売チケット数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      売上
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均単価
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      売上シェア
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventSales.map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.eventTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.tickets}枚</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">¥{event.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ¥{event.tickets > 0 ? Math.round(event.revenue / event.tickets).toLocaleString() : '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.percentage.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                  {eventSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!isPremiumUser && (
              <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MdLock className="text-gray-400 text-4xl mb-3 mx-auto" />
                  <p className="text-gray-600 font-medium text-lg mb-2">詳細データはプレミアムプランで</p>
                  <p className="text-gray-500 text-sm mb-4">エクスポート機能やより詳細な分析をご利用いただけます</p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    アップグレード
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
