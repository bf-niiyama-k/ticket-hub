
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7days');
  const [isPremiumUser] = useState(false); // 実際にはSupabaseから取得

  // サンプルデータ
  const salesData = [
    { date: '3/9', sales: 45000, tickets: 15 },
    { date: '3/10', sales: 68000, tickets: 22 },
    { date: '3/11', sales: 52000, tickets: 18 },
    { date: '3/12', sales: 89000, tickets: 31 },
    { date: '3/13', sales: 76000, tickets: 28 },
    { date: '3/14', sales: 94000, tickets: 35 },
    { date: '3/15', sales: 112000, tickets: 42 }
  ];

  const eventData = [
    { name: '春のコンサート2024', sales: 450000, tickets: 150 },
    { name: '夏祭り2024', sales: 960000, tickets: 320 },
    { name: 'ビジネスセミナー', sales: 250000, tickets: 50 },
    { name: '秋の音楽祭', sales: 180000, tickets: 60 }
  ];

  const ticketTypeData = [
    { name: 'VIPチケット', value: 35, color: '#8B5CF6' },
    { name: '一般チケット', value: 50, color: '#3B82F6' },
    { name: '学生チケット', value: 15, color: '#10B981' }
  ];

  const monthlyData = [
    { month: '1月', revenue: 850000, customers: 120 },
    { month: '2月', revenue: 920000, customers: 135 },
    { month: '3月', revenue: 1850000, customers: 245 }
  ];

  const stats = {
    totalRevenue: 3847200,
    totalTickets: 1248,
    totalCustomers: 456,
    avgOrderValue: 8500,
    revenueGrowth: 15.8,
    ticketGrowth: 12.3,
    customerGrowth: 18.5
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
                  <i className="ri-vip-crown-line text-2xl text-blue-600"></i>
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
                  <i className="ri-money-yen-circle-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <i className="ri-arrow-up-line text-green-500 text-sm w-4 h-4 flex items-center justify-center mr-1"></i>
                <span className="text-sm text-green-600">+{stats.revenueGrowth}%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-2xl"></i>
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
                  <i className="ri-ticket-2-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <i className="ri-arrow-up-line text-green-500 text-sm w-4 h-4 flex items-center justify-center mr-1"></i>
                <span className="text-sm text-green-600">+{stats.ticketGrowth}%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-2xl"></i>
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
                  <i className="ri-user-line text-purple-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <i className="ri-arrow-up-line text-green-500 text-sm w-4 h-4 flex items-center justify-center mr-1"></i>
                <span className="text-sm text-green-600">+{stats.customerGrowth}%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-2xl"></i>
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
                  <i className="ri-shopping-cart-line text-orange-600 text-xl w-6 h-6 flex items-center justify-center"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <i className="ri-arrow-up-line text-green-500 text-sm w-4 h-4 flex items-center justify-center mr-1"></i>
                <span className="text-sm text-green-600">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">前月比</span>
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-2xl"></i>
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
                    <i className="ri-lock-line text-gray-400 text-3xl mb-2"></i>
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
                    <i className="ri-lock-line text-gray-400 text-3xl mb-2"></i>
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
                {eventData.map((event, index) => {
                  const maxSales = Math.max(...eventData.map(e => e.sales));
                  const widthPercentage = (event.sales / maxSales) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{event.name}</span>
                        <span className="text-sm font-semibold text-gray-900">¥{event.sales.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full">
                        <div 
                          className="h-3 bg-green-500 rounded-full transition-all duration-300" 
                          style={{width: `${widthPercentage}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{event.tickets}枚販売</div>
                    </div>
                  );
                })}
              </div>
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="ri-lock-line text-gray-400 text-3xl mb-2"></i>
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
                    <i className="ri-lock-line text-gray-400 text-3xl mb-2"></i>
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
                  {eventData.map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.tickets}枚</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">¥{event.sales.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">¥{Math.round(event.sales / event.tickets).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {((event.sales / eventData.reduce((sum, e) => sum + e.sales, 0)) * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isPremiumUser && (
              <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-lock-line text-gray-400 text-4xl mb-3"></i>
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
