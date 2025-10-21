# Task: 売上分析ページのDB連携

**優先度**: 🟡 中（データ精度向上）

## 実装計画

売上分析ページのハードコーディングされたグラフデータをDBから取得するように実装する。

## 調査・追跡対象ファイル
- `.claude/docs/directory-structure.md`
- `.claude/tasks/TASK.md`
- `src/app/admin/analytics/page.tsx`
- `src/hooks/useAnalytics.ts`
- `src/lib/database.ts`

---

### Phase 1: 調査・設計

#### 1-1. 現在の実装状況確認
- [x] ハードコーディング箇所の特定
  - `src/app/admin/analytics/page.tsx:18-26` - 売上推移データ（7日分）
  - `src/app/admin/analytics/page.tsx:28-33` - チケット種類別売上
  - `src/app/admin/analytics/page.tsx:35-42` - 月別データ（6ヶ月分）

#### 1-2. useAnalyticsフックの確認
- [ ] `src/hooks/useAnalytics.ts` の現在の実装を確認
- [ ] 提供されているデータを確認
- [ ] 不足しているデータを特定

**現在のuseAnalytics**:
```typescript
export const useAnalytics = () => {
  // statsとeventSalesを提供
  // 売上推移、チケット種類別、月別データは未提供
}
```

#### 1-3. 必要なデータの特定
- [ ] 売上推移データ
  - 日別の売上（total_amount）
  - 日別のチケット販売数
  - 期間指定（7日、30日、90日）

- [ ] チケット種類別売上
  - チケット種類ごとの販売数と売上
  - パーセンテージ計算

- [ ] 月別データ
  - 月別の売上
  - 月別の顧客数（購入ユーザー数）

#### 1-4. 設計方針決定
- [ ] useAnalyticsフックを拡張する
- [ ] または新しいフック `useAnalyticsCharts` を作成する
- [ ] グラフライブラリの選定（Recharts推奨）

---

### Phase 2: 実装

#### 2-1. useAnalyticsフックの拡張

**ファイル**: `src/hooks/useAnalytics.ts`

- [ ] 売上推移データ取得関数を追加
- [ ] チケット種類別売上取得関数を追加
- [ ] 月別データ取得関数を追加

**実装例**:
```typescript
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface SalesData {
  date: string;
  sales: number;
  tickets: number;
}

export interface TicketTypeData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  customers: number;
}

export interface UseAnalyticsReturn {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  } | null;
  eventSales: Array<{
    event_id: string;
    event_title: string;
    total_sales: number;
    tickets_sold: number;
  }>;
  salesData: SalesData[];          // 追加
  ticketTypeData: TicketTypeData[]; // 追加
  monthlyData: MonthlyData[];       // 追加
  loading: boolean;
  error: string | null;
  refetch: (dateRange?: string) => Promise<void>;
}

export const useAnalytics = (initialDateRange: string = '7days'): UseAnalyticsReturn => {
  const [stats, setStats] = useState(null);
  const [eventSales, setEventSales] = useState([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [ticketTypeData, setTicketTypeData] = useState<TicketTypeData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(initialDateRange);

  const fetchAnalyticsData = async (range: string = dateRange) => {
    try {
      setLoading(true);
      setError(null);
      setDateRange(range);

      // 日数を計算
      const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // 売上推移データ
      const salesByDate: { [key: string]: { sales: number; tickets: number } } = {};

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          created_at,
          total_amount,
          order_items (
            quantity
          )
        `)
        .eq('status', 'paid')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // 日別に集計
      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('ja-JP');
        if (!salesByDate[date]) {
          salesByDate[date] = { sales: 0, tickets: 0 };
        }
        salesByDate[date].sales += order.total_amount;
        salesByDate[date].tickets += order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      });

      // 配列に変換
      const salesDataArray: SalesData[] = Object.entries(salesByDate).map(([date, data]) => ({
        date,
        sales: data.sales,
        tickets: data.tickets,
      }));

      setSalesData(salesDataArray);

      // チケット種類別売上
      const { data: ticketTypes, error: ticketTypesError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          ticket_type:ticket_types (
            name
          ),
          order:orders!inner (
            status
          )
        `)
        .eq('order.status', 'paid');

      if (ticketTypesError) throw ticketTypesError;

      // チケット種類ごとに集計
      const ticketTypeMap: { [key: string]: number } = {};
      let totalTickets = 0;

      ticketTypes?.forEach(item => {
        const typeName = item.ticket_type?.name || '不明';
        const quantity = item.quantity;
        ticketTypeMap[typeName] = (ticketTypeMap[typeName] || 0) + quantity;
        totalTickets += quantity;
      });

      // パーセンテージ計算と色割り当て
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const ticketTypeDataArray: TicketTypeData[] = Object.entries(ticketTypeMap).map(([name, value], index) => ({
        name,
        value: totalTickets > 0 ? Math.round((value / totalTickets) * 100) : 0,
        color: colors[index % colors.length],
      }));

      setTicketTypeData(ticketTypeDataArray);

      // 月別データ（過去6ヶ月）
      const monthlyMap: { [key: string]: { revenue: number; customers: Set<string> } } = {};

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[monthKey] = { revenue: 0, customers: new Set() };
      }

      const { data: monthlyOrders, error: monthlyOrdersError } = await supabase
        .from('orders')
        .select('created_at, total_amount, user_id')
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      if (monthlyOrdersError) throw monthlyOrdersError;

      monthlyOrders?.forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].revenue += order.total_amount;
          if (order.user_id) {
            monthlyMap[monthKey].customers.add(order.user_id);
          }
        }
      });

      const monthlyDataArray: MonthlyData[] = Object.entries(monthlyMap).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        customers: data.customers.size,
      }));

      setMonthlyData(monthlyDataArray);

      // 既存の統計データ取得（変更なし）
      // ... stats, eventSales の取得コード ...

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return {
    stats,
    eventSales,
    salesData,
    ticketTypeData,
    monthlyData,
    loading,
    error,
    refetch: fetchAnalyticsData,
  };
};
```

#### 2-2. グラフライブラリのインストール

- [ ] Rechartsをインストール
  ```bash
  npm install recharts
  ```

#### 2-3. 売上分析ページの更新

**ファイル**: `src/app/admin/analytics/page.tsx`

- [ ] ハードコーディングされたデータを削除（18-42行目）
- [ ] `useAnalytics(dateRange)` フックを使用
- [ ] グラフコンポーネントを実装
- [ ] 期間選択ドロップダウンを実装

**実装例**:
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7days');
  const { stats, eventSales, salesData, ticketTypeData, monthlyData, loading, error, refetch } = useAnalytics(dateRange);

  const isPremiumUser = user?.role === 'admin';

  // 期間選択ドロップダウン
  const DateRangeSelector = (
    <select
      value={dateRange}
      onChange={(e) => {
        setDateRange(e.target.value);
        refetch(e.target.value);
      }}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="7days">過去7日</option>
      <option value="30days">過去30日</option>
      <option value="90days">過去90日</option>
    </select>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!stats) return <ErrorScreen message="データがありません" />;

  return (
    <AdminLayout
      title="売上分析"
      backHref="/admin"
      actions={DateRangeSelector}
      isPremiumUser={isPremiumUser}
    >
      {/* プレミアムユーザーでない場合の制限メッセージ */}
      {!isPremiumUser && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="ri-information-line text-orange-600 text-xl mr-3"></i>
            <p className="text-orange-800">
              プレビュー版です。フル機能を利用するにはプレミアムプランへのアップグレードが必要です。
            </p>
          </div>
        </div>
      )}

      {/* 売上推移グラフ */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">売上推移</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              name="売上（円）"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="tickets"
              stroke="#10B981"
              name="チケット数"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* チケット種類別売上 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">チケット種類別売上</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ticketTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {ticketTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 月別データ */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">月別売上</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#8B5CF6" name="売上（円）" />
            <Bar yAxisId="right" dataKey="customers" fill="#F59E0B" name="顧客数" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* イベント別売上 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">イベント別売上</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  イベント名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  売上
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  販売数
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventSales.map((event) => (
                <tr key={event.event_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.event_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{event.total_sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.tickets_sold}枚
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
```

---

### Phase 3: 検証

#### 3-1. グラフ表示の動作確認
- [ ] 売上推移グラフが正しく表示される
- [ ] チケット種類別グラフが正しく表示される
- [ ] 月別グラフが正しく表示される
- [ ] イベント別売上テーブルが正しく表示される

#### 3-2. 期間選択の動作確認
- [ ] 7日間選択時にデータが更新される
- [ ] 30日間選択時にデータが更新される
- [ ] 90日間選択時にデータが更新される

#### 3-3. レスポンシブデザイン確認
- [ ] モバイルでグラフが正しく表示される
- [ ] タブレットでグラフが正しく表示される

#### 3-4. テスト実行
- [ ] TypeScriptエラー確認
  ```bash
  npx tsc --noEmit
  ```

- [ ] ESLint警告確認
  ```bash
  npm run lint
  ```

- [ ] ビルド実行
  ```bash
  npm run build
  ```

- [ ] ビルドエラー解消

---

### Phase Last: タスク・ドキュメント更新

- [ ] `.claude/docs/directory-structure.md` の更新
  - Rechartsライブラリの追加を記載

- [ ] `.claude/tasks/TASK.md` の更新
  - 完了タスクとして記載

- [ ] 進捗メモの更新
  - 実装内容、完了日、改善点を記載

---

## 仕様

### useAnalyticsフック拡張仕様

```typescript
interface SalesData {
  date: string;      // 日付（YYYY/MM/DD）
  sales: number;     // 売上
  tickets: number;   // チケット販売数
}

interface TicketTypeData {
  name: string;      // チケット種類名
  value: number;     // パーセンテージ
  color: string;     // グラフの色
}

interface MonthlyData {
  month: string;     // 月（YYYY/MM）
  revenue: number;   // 売上
  customers: number; // 顧客数
}
```

### 追跡対象ファイル

- `src/hooks/useAnalytics.ts` - 分析フック（拡張）
- `src/lib/database.ts` - データベースAPI

### 実装対象ファイル

1. `src/hooks/useAnalytics.ts` - フック拡張
2. `src/app/admin/analytics/page.tsx` - ページ更新
3. `package.json` - Rechartsの追加

---

## 進捗メモ
<!-- 作業進捗を随時更新 -->
