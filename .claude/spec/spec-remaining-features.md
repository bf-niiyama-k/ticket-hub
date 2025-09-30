# 残りの実装機能仕様書

## 概要

フロントエンド・データベース連携を完了した後、残りの主要機能の実装が必要です。

## 優先度別実装リスト

### 🔴 最優先（決済フロー）

#### 1. チェックアウトページのDB連携
**ファイル**: `src/app/checkout/page.tsx`

**現状の問題**:
- ハードコーディングされたイベント・チケット情報（43-67行）
- DBからの動的データ取得が未実装

**必要な実装**:
```typescript
// useEventフックを使用してDB取得
const { event, loading, error } = useEvent(eventId);

// チケット在庫の再確認
const validateTicketAvailability = async (
  ticketTypeId: string,
  quantity: number
): Promise<boolean> => {
  const ticketType = event?.ticket_types?.find(tt => tt.id === ticketTypeId);
  if (!ticketType) return false;

  const availableStock = ticketType.quantity_total - ticketType.quantity_sold;
  return availableStock >= quantity;
};
```

**実装内容**:
- [ ] `useEvent(eventId)` でDB取得に変更
- [ ] ハードコーディングされた`events`/`tickets`オブジェクトを削除（43-67行）
- [ ] URLパラメータ解析関数実装
- [ ] チケット在庫再確認機能実装
- [ ] ローディング・エラー状態実装
- [ ] 在庫不足エラーハンドリング

#### 2. 決済処理の完全実装
**ファイル**: `src/hooks/usePayment.ts`, `src/api/payments/**`

**現状**:
- usePaymentフックは存在するが、実際の決済フローが未完成
- Stripe連携の詳細実装が必要

**必要な実装**:
- [ ] Stripe Payment Intent作成API完成（`/api/payments/create-payment-intent`）
- [ ] 決済確認API完成（`/api/payments/confirm-payment`）
- [ ] 注文作成処理（orderAPI.createOrder）
- [ ] チケット発行処理（ticketsテーブルへの挿入）
- [ ] QRコード生成（uuid + チケットID）
- [ ] トランザクション処理（注文・チケット・在庫更新の一括処理）
- [ ] 決済エラーハンドリング

**決済フロー**:
```
1. ユーザーがチケット選択 → チェックアウトページ
2. ユーザー情報・決済方法入力
3. Payment Intent作成（Stripe）
4. 決済確認（Stripe）
5. 注文作成（ordersテーブル）
6. 注文明細作成（order_itemsテーブル）
7. チケット発行（ticketsテーブル）
8. チケット在庫更新（ticket_types.quantity_sold）
9. 購入完了ページへリダイレクト
```

#### 3. マイチケットページの実装
**ファイル**: `src/app/my-tickets/page.tsx`

**現状の問題**:
- ハードコーディングされたチケットデータ
- 認証チェックが未実装

**必要な実装**:
```typescript
// useAuthとticketAPIを使用
const { user, loading: authLoading } = useAuth();
const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (authLoading) return;

  if (!user) {
    router.push('/login?redirect_to=/my-tickets');
    return;
  }

  const fetchTickets = async () => {
    try {
      const data = await ticketAPI.getUserTickets(user.id);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchTickets();
}, [user, authLoading]);
```

**実装内容**:
- [ ] ハードコーディングされた`tickets`オブジェクトを削除
- [ ] `ticketAPI.getUserTickets()` を使用
- [ ] `useAuth` で認証チェック実装
- [ ] 未認証の場合はログインページへリダイレクト
- [ ] ステータス別フィルタリング実装（valid/used/cancelled）
- [ ] QRコード表示統合確認
- [ ] ローディング・エラー状態実装
- [ ] チケット詳細モーダル実装

---

### 🟡 高優先（管理画面の完成）

#### 4. 管理画面イベント編集ページのDB連携
**ファイル**: `src/app/admin/events/[id]/EventEdit.tsx`

**現状**:
- イベント編集ページが存在するが、DB連携が不完全

**必要な実装**:
- [ ] `useEvent(eventId)` でDB取得に変更
- [ ] ハードコーディングされたデータを削除
- [ ] フォーム初期化ロジック実装
- [ ] 保存時の `updateEvent()` 呼び出し実装
- [ ] チケット種類の編集機能統合（ticketTypeAPI使用）
- [ ] 画像アップロード機能（オプション）
- [ ] ローディング・エラー状態実装

#### 5. 管理画面注文管理ページの実装
**ファイル**: `src/app/admin/orders/page.tsx`

**現状**:
- useOrdersフックは実装済み
- UIが未完成の可能性

**必要な実装**:
- [ ] `useOrders()` でDB取得確認
- [ ] 注文一覧表示（テーブル形式）
- [ ] 注文詳細モーダル実装
- [ ] 返金処理機能実装（orderAPI.updateOrder + Stripe Refund API）
- [ ] ステータス別フィルタリング（pending/paid/cancelled/refunded）
- [ ] 検索機能実装（注文ID、ユーザー名、メール）
- [ ] ローディング・エラー状態実装

#### 6. QRコードスキャナーの完全実装
**ファイル**: `src/app/admin/scanner/page.tsx`

**必要な実装**:
- [ ] QRコードスキャン機能（カメラ使用）
- [ ] `ticketAPI.getTicketByQR()` で照合
- [ ] チケット情報表示（イベント名、チケット種類、ステータス）
- [ ] チケット使用処理（`ticketAPI.useTicket()`）
- [ ] 使用済みチケットのエラー表示
- [ ] 無効なQRコードのエラー表示
- [ ] 手動入力モード（QRコード文字列）

---

### 🟢 中優先（ユーザー体験の向上）

#### 7. プロフィール編集ページの実装
**ファイル**: `src/app/profile/page.tsx`

**必要な実装**:
- [ ] `useProfile()` でプロフィール取得
- [ ] プロフィール編集フォーム実装
- [ ] `updateUserProfile()` で更新
- [ ] パスワード変更機能（`updatePassword()`）
- [ ] アバター画像アップロード（オプション）
- [ ] ローディング・エラー状態実装

#### 8. 購入完了ページの実装
**ファイル**: `src/app/purchase-complete/page.tsx`

**必要な実装**:
- [ ] 注文情報の表示（注文ID、購入内容、合計金額）
- [ ] QRコード付きチケットへのリンク
- [ ] マイチケットページへのナビゲーション
- [ ] 注文確認メール送信（バックエンド）

#### 9. 売上分析ページの実装
**ファイル**: `src/app/admin/analytics/page.tsx`

**現状**:
- useAnalyticsフックは実装済み
- UIの詳細実装が必要

**必要な実装**:
- [ ] `useAnalytics()` で統計データ取得
- [ ] 売上グラフ表示（Chart.js または Recharts）
- [ ] 期間別レポート（日次、週次、月次）
- [ ] イベント別売上ランキング
- [ ] CSV/PDFエクスポート機能（オプション）
- [ ] プレミアムユーザー限定機能の実装

---

### 🔵 低優先（追加機能）

#### 10. メール通知機能
**新規ファイル**: `src/lib/email.ts`, `src/api/email/**`

**必要な実装**:
- [ ] Resend または SendGrid 連携
- [ ] 注文確認メール（チケットPDF添付）
- [ ] パスワードリセットメール
- [ ] イベントリマインダーメール
- [ ] チケット使用確認メール

#### 11. 管理画面ダッシュボードの統計データDB連携
**ファイル**: `src/app/admin/page.tsx`

**現状**:
- ハードコーディングされた統計データ（9-14行）

**必要な実装**:
- [ ] `useAnalytics()` で統計データ取得
- [ ] リアルタイム統計表示
- [ ] 最近の活動ログ（DB連携）

---

## 実装の推奨順序

1. **チェックアウトページのDB連携** → 決済フローの基盤
2. **決済処理の完全実装** → コア機能
3. **マイチケットページの実装** → ユーザー体験の完成
4. **管理画面注文管理** → 運用に必要
5. **管理画面イベント編集のDB連携** → 管理機能の完成
6. **QRコードスキャナー** → 現地運用に必要
7. **プロフィール編集** → ユーザー体験の向上
8. **購入完了ページ** → ユーザー体験の向上
9. **売上分析ページ** → プレミアム機能
10. **メール通知機能** → 追加機能

---

## 技術的な注意点

### トランザクション処理
決済処理では以下の操作が原子的に実行される必要があります：
```typescript
// 擬似コード
await supabase.rpc('complete_order', {
  order_data: {...},
  order_items: [...],
  tickets: [...],
  ticket_updates: [...] // quantity_soldの更新
});
```

### エラーハンドリング
- 決済失敗時のロールバック
- 在庫不足エラー
- ネットワークエラー
- タイムアウト処理

### セキュリティ
- 決済処理はサーバーサイドで実行（API Routes）
- チケットQRコードの暗号化
- 管理者権限の厳格なチェック
- CSRF対策（Next.js組み込み）

---

## 次のタスク

上記の優先度に従って、以下のタスクファイルを作成することを推奨します：

1. `task-checkout-payment-integration.md` - チェックアウト・決済統合
2. `task-my-tickets-implementation.md` - マイチケットページ実装
3. `task-admin-order-management.md` - 管理画面注文管理
4. `task-admin-event-edit-integration.md` - 管理画面イベント編集DB連携
5. `task-qr-scanner-implementation.md` - QRコードスキャナー実装