
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminLayout, StatsCard } from '@/components';

export default function AdminDashboard() {
  const [stats] = useState({
    totalEvents: 12,
    totalTicketsSold: 1248,
    totalRevenue: 3847200,
    todaysSales: 24,
  });

  // 課金ユーザーのステータス（実際にはSupabaseから取得）
  const [isPremiumUser] = useState(false);

  return (
    <AdminLayout 
      title="管理画面" 
      isPremiumUser={isPremiumUser}
      username="管理者: 田中太郎"
    >
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="総イベント数"
            value={stats.totalEvents}
            icon="ri-calendar-event-line"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          
          <StatsCard
            title="チケット販売数"
            value={stats.totalTicketsSold}
            icon="ri-ticket-2-line"
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          
          <StatsCard
            title="総売上"
            value={`¥${stats.totalRevenue.toLocaleString()}`}
            icon="ri-money-yen-circle-line"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            change={{
              value: 15.8,
              label: "前月比",
              trend: "up"
            }}
          />
          
          <StatsCard
            title="今日の販売数"
            value={stats.todaysSales}
            icon="ri-today-line"
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* 管理メニュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/events"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="ri-calendar-event-line text-blue-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">イベント管理</h3>
            </div>
            <p className="text-gray-600">イベントの作成、編集、削除、チケット設定</p>
          </Link>

          <Link
            href="/admin/customers"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="ri-user-line text-purple-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">顧客管理</h3>
            </div>
            <p className="text-gray-600">登録ユーザーの管理、詳細情報確認</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <i className="ri-shopping-cart-line text-orange-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">注文管理</h3>
            </div>
            <p className="text-gray-600">購入履歴、注文詳細、返金処理</p>
          </Link>

          <Link
            href="/admin/scanner"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <i className="ri-qr-scan-2-line text-indigo-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">QRコード照合</h3>
            </div>
            <p className="text-gray-600">現地でのチケット使用確認</p>
          </Link>

          {/* 売上分析 - 課金ユーザー限定 */}
          {isPremiumUser ? (
            <Link
              href="/admin/analytics"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <i className="ri-bar-chart-line text-red-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">売上分析</h3>
              </div>
              <p className="text-gray-600">売上グラフ、期間別レポート</p>
            </Link>
          ) : (
            <Link
              href="/admin/analytics"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer relative"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <i className="ri-bar-chart-line text-red-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">売上分析</h3>
                <div className="ml-auto px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  プレビュー
                </div>
              </div>
              <p className="text-gray-600">売上グラフ、期間別レポート（プレビュー版）</p>
            </Link>
          )}

          {/* プレミアムプラン案内 */}
          {!isPremiumUser && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border-2 border-dashed border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <i className="ri-vip-crown-line text-blue-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">プレミアムプラン</h3>
              </div>
              <p className="text-gray-600 mb-4">売上分析機能をご利用いただけます</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                プランをアップグレード
              </button>
            </div>
          )}
        </div>

        {/* 最近の活動 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近の活動</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <i className="ri-ticket-2-line text-green-600 text-sm w-4 h-4 flex items-center justify-center"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-900">新しいチケット購入がありました</p>
                  <p className="text-xs text-gray-500">2分前 - 春のコンサート VIPチケット ×2</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <i className="ri-calendar-event-line text-blue-600 text-sm w-4 h-4 flex items-center justify-center"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-900">新しいイベントが公開されました</p>
                  <p className="text-xs text-gray-500">1時間前 - 夏祭り2024</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <i className="ri-user-line text-purple-600 text-sm w-4 h-4 flex items-center justify-center"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-900">新規ユーザーが登録しました</p>
                  <p className="text-xs text-gray-500">3時間前 - 佐藤花子</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
