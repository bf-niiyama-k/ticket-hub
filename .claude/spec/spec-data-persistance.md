# データ永続化仕様書

## 概要

ticket-hubアプリケーションのデータ永続化方針と実装詳細を定義します。Supabase（PostgreSQL）を使用し、イベント・チケット・注文情報を管理します。

---

## 1. データベース構成

### 使用技術
- **データベース**: Supabase (PostgreSQL 15+)
- **ORM/クライアント**: @supabase/supabase-js
- **型定義**: TypeScript型定義 (`src/lib/supabase/types.ts`)
- **マイグレーション**: `supabase/migrations/` 配下のSQLファイル

### 接続設定
- **クライアント**: `src/lib/supabase/client.ts` - ブラウザ側での操作
- **サーバー**: `src/lib/supabase/server.ts` - サーバーサイド操作（認証付き）

---

## 2. イベント情報のデータ永続化

### 2.1 テーブル構造

#### events テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | イベントID（自動生成） |
| title | TEXT | NOT NULL | イベントタイトル |
| description | TEXT | NULLABLE | イベント説明文 |
| location | TEXT | NOT NULL | 開催場所 |
| date_start | TIMESTAMPTZ | NOT NULL | 開始日時 |
| date_end | TIMESTAMPTZ | NOT NULL | 終了日時 |
| image_url | TEXT | NULLABLE | イベント画像URL |
| is_published | BOOLEAN | DEFAULT false | 公開状態 |
| max_capacity | INTEGER | NULLABLE | 最大収容人数 |
| created_by | UUID | FK → auth.users(id) | 作成者ユーザーID |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

#### インデックス
```sql
CREATE INDEX idx_events_date_published ON events(date_start, is_published);
CREATE INDEX idx_events_created_by ON events(created_by);
```

### 2.2 RLS（Row Level Security）ポリシー

#### 公開イベントの閲覧
```sql
CREATE POLICY "Published events are viewable by everyone"
  ON events FOR SELECT
  USING (is_published = true);
```

#### 管理者・スタッフによる管理
```sql
CREATE POLICY "Staff can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
```

### 2.3 CRUD操作（API）

#### データベースAPI: `src/lib/database.ts`

**イベント作成**
```typescript
eventAPI.createEvent(eventData: EventInsert): Promise<Event>
```

**イベント取得**
```typescript
eventAPI.getPublishedEvents(): Promise<EventWithTicketTypes[]>
eventAPI.getAllEvents(): Promise<EventWithTicketTypes[]>
eventAPI.getEventById(id: string): Promise<EventWithTicketTypes | null>
```

**イベント更新**
```typescript
eventAPI.updateEvent(id: string, updates: EventUpdate): Promise<Event>
eventAPI.toggleEventStatus(id: string): Promise<Event>
```

**イベント削除**
```typescript
eventAPI.deleteEvent(id: string): Promise<void>
```

### 2.4 リレーション

**1対多（events → ticket_types）**
- イベント削除時、関連チケット種類も連鎖削除（CASCADE）
- イベント取得時、関連チケット種類も同時取得可能

---

## 3. チケット情報のデータ永続化

### 3.1 テーブル構造

#### ticket_types テーブル（チケット種類）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | チケット種類ID |
| event_id | UUID | FK → events(id) CASCADE | イベントID |
| name | TEXT | NOT NULL | チケット種類名 |
| description | TEXT | NULLABLE | 説明 |
| price | DECIMAL(10,2) | NOT NULL | 価格 |
| quantity_total | INTEGER | NOT NULL | 総発行枚数 |
| quantity_sold | INTEGER | DEFAULT 0 | 販売済み枚数 |
| sale_start | TIMESTAMPTZ | DEFAULT NOW() | 販売開始日時 |
| sale_end | TIMESTAMPTZ | NOT NULL | 販売終了日時 |
| is_active | BOOLEAN | DEFAULT true | 有効状態 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

#### tickets テーブル（発行済みチケット）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | チケットID |
| order_item_id | UUID | FK → order_items(id) CASCADE | 注文アイテムID |
| ticket_type_id | UUID | FK → ticket_types(id) CASCADE | チケット種類ID |
| event_id | UUID | FK → events(id) CASCADE | イベントID |
| user_id | UUID | FK → auth.users(id) CASCADE | ユーザーID |
| qr_code | TEXT | UNIQUE NOT NULL | QRコードデータ（署名付き） |
| status | TEXT | CHECK | チケット状態（'valid', 'used', 'cancelled'） |
| used_at | TIMESTAMPTZ | NULLABLE | 使用日時 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

#### インデックス
```sql
CREATE INDEX idx_ticket_types_event_active ON ticket_types(event_id, is_active);
CREATE INDEX idx_tickets_user_status ON tickets(user_id, status);
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
```

### 3.2 QRコード生成・検証

#### QRコード生成: `src/lib/qr-generator.ts`

**データ構造**
```typescript
interface QRData {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
  signature: string; // SHA256署名
}
```

**生成関数**
```typescript
generateQRCode(ticketId: string, eventId: string, userId: string): string
```

**検証関数**
```typescript
decodeQRData(qrCodeData: string): QRData | null
verifyQRSignature(qrData: QRData): boolean
isQRExpired(timestamp: number): boolean
```

#### QRコード検証API: `/api/tickets/verify`

**リクエスト**
```json
{
  "qrCodeData": "encrypted-qr-string",
  "markAsUsed": true
}
```

**レスポンス（成功）**
```json
{
  "success": true,
  "status": "valid" | "used",
  "message": "チケットの検証に成功しました",
  "scanTime": "2025-09-30T10:00:00Z",
  "ticket": { /* チケット詳細 */ }
}
```

**レスポンス（失敗）**
```json
{
  "success": false,
  "status": "invalid" | "expired" | "used",
  "message": "エラーメッセージ",
  "scanTime": "2025-09-30T10:00:00Z"
}
```

### 3.3 CRUD操作（API）

#### チケット種類API: `ticketTypeAPI`

```typescript
ticketTypeAPI.getTicketTypesByEvent(eventId: string): Promise<TicketType[]>
ticketTypeAPI.createTicketType(data: TicketTypeInsert): Promise<TicketType>
ticketTypeAPI.updateTicketType(id: string, updates: TicketTypeUpdate): Promise<TicketType>
```

#### チケットAPI: `ticketAPI`

```typescript
ticketAPI.getUserTickets(userId: string): Promise<TicketWithDetails[]>
ticketAPI.getTicketByQR(qrCode: string): Promise<TicketWithDetails | null>
ticketAPI.useTicket(id: string): Promise<Ticket>
```

### 3.4 PDF生成・出力

#### PDF生成: `src/lib/pdf-generator.ts`

**チケットPDF生成**
```typescript
generateTicketPDF(ticketData: TicketPDFData): Promise<Blob>
```

**含まれる情報**
- イベント名・詳細
- チケット種類・価格
- 購入者情報
- QRコード画像（埋め込み）
- 注文番号・購入日

---

## 4. オーダー情報のデータ永続化

### 4.1 テーブル構造

#### orders テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | 注文ID |
| user_id | UUID | FK → auth.users(id) CASCADE | ユーザーID |
| event_id | UUID | FK → events(id) CASCADE | イベントID |
| total_amount | DECIMAL(10,2) | NOT NULL | 合計金額 |
| status | TEXT | CHECK | 注文状態（'pending', 'paid', 'cancelled', 'refunded'） |
| payment_method | TEXT | CHECK | 決済方法（'credit_card', 'paypal', 'convenience_store'） |
| payment_id | TEXT | NULLABLE | 決済プロバイダID（Stripe Payment Intent ID等） |
| guest_info | JSONB | NULLABLE | ゲスト購入時の情報 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

#### order_items テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | 注文アイテムID |
| order_id | UUID | FK → orders(id) CASCADE | 注文ID |
| ticket_type_id | UUID | FK → ticket_types(id) CASCADE | チケット種類ID |
| quantity | INTEGER | NOT NULL DEFAULT 1 | 数量 |
| unit_price | DECIMAL(10,2) | NOT NULL | 単価 |
| total_price | DECIMAL(10,2) | NOT NULL | 合計価格 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

#### インデックス
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_event_status ON orders(event_id, status);
```

### 4.2 決済フロー

#### 決済Intent作成API: `/api/payments/create-payment-intent`

**リクエスト**
```typescript
{
  amount: number;
  paymentMethod: 'credit' | 'paypay' | 'convenience';
  orderItems: OrderItem[];
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  eventId: string;
  eventTitle: string;
}
```

**レスポンス（Stripe）**
```json
{
  "success": true,
  "paymentIntentId": "pi_xxx",
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "ORDER-xxx",
  "paymentMethod": "credit"
}
```

**レスポンス（PayPay）**
```json
{
  "success": true,
  "paymentIntentId": "paypay_payment_id",
  "orderId": "ORDER-xxx",
  "paymentMethod": "paypay",
  "redirectUrl": "https://paypay.ne.jp/...",
  "qrCodeUrl": "https://paypay.ne.jp/qr/..."
}
```

#### 決済確認API: `/api/payments/confirm-payment`

**決済完了後の処理**
1. 注文ステータスを`paid`に更新
2. チケット種類の`quantity_sold`を更新
3. 各注文アイテムに対してチケット発行（QRコード生成）
4. tickets テーブルにレコード挿入

### 4.3 CRUD操作（API）

#### 注文API: `orderAPI`

```typescript
orderAPI.getUserOrders(userId: string): Promise<OrderWithItems[]>
orderAPI.getAllOrders(): Promise<OrderWithItems[]>
orderAPI.createOrder(data: OrderInsert): Promise<Order>
orderAPI.updateOrder(id: string, updates: OrderUpdate): Promise<Order>
```

### 4.4 RLSポリシー

```sql
-- ユーザーは自分の注文のみ閲覧可能
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分の注文のみ作成可能
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理者は全注文にアクセス可能
CREATE POLICY "Admins can view all orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 5. トリガー・関数

### 5.1 updated_at自動更新

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON ticket_types
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
```

### 5.2 新規ユーザープロファイル自動作成

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

---

## 6. 統計・分析データ

### 6.1 売上統計API: `analyticsAPI`

**総合統計取得**
```typescript
analyticsAPI.getSalesStats(): Promise<{
  totalRevenue: number;
  totalTickets: number;
  totalCustomers: number;
  avgOrderValue: number;
}>
```

**イベント別売上取得**
```typescript
analyticsAPI.getEventSales(): Promise<Array<{
  eventId: string;
  eventTitle: string;
  revenue: number;
  tickets: number;
}>>
```

---

## 7. エラーハンドリング

### 7.1 カスタムエラークラス

```typescript
class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

### 7.2 エラーメッセージ

- **イベント**: `公開イベント取得に失敗しました`, `イベント作成に失敗しました`
- **チケット**: `チケット種類取得に失敗しました`, `チケット使用処理に失敗しました`
- **注文**: `注文履歴取得に失敗しました`, `注文作成に失敗しました`

---

## 8. トランザクション管理

### 8.1 チケット購入トランザクション

**複数テーブルの原子性保証が必要な操作**

1. `orders` テーブルにレコード作成
2. `order_items` テーブルに複数レコード作成
3. `ticket_types` の `quantity_sold` を更新
4. `tickets` テーブルに複数レコード作成（QRコード付き）

**実装方針**
- Supabaseのトランザクション機能を使用
- エラー発生時は全てロールバック
- 在庫不足チェックを事前に実施

---

## 9. パフォーマンス最適化

### 9.1 実装済みインデックス

- 複合インデックス: `(date_start, is_published)` でイベント検索を高速化
- 外部キーインデックス: `event_id`, `user_id`, `qr_code` で関連データ取得を最適化

### 9.2 クエリ最適化

- `select('*, ticket_types(*)')` でN+1問題を回避
- RLSポリシーでデータベース側でアクセス制御

---

## 10. マイグレーション管理

### 10.1 既存マイグレーション

- `001_create_initial_tables.sql` - 初期テーブル作成
- `002_setup_row_level_security.sql` - RLSポリシー設定

### 10.2 今後の拡張予定

- チケット使用履歴テーブル追加
- 返金履歴テーブル追加
- イベントカテゴリテーブル追加
- 座席指定機能用テーブル追加

---

## 11. 参考ファイル

### データベース関連
- `supabase/migrations/001_create_initial_tables.sql`
- `.claude/docs/database-schema.md`

### 実装ファイル
- `src/lib/database.ts` - データベースAPI
- `src/lib/supabase/types.ts` - TypeScript型定義
- `src/lib/supabase/client.ts` - Supabaseクライアント設定
- `src/lib/supabase/server.ts` - サーバーサイド設定

### API Routes
- `src/app/api/payments/create-payment-intent/route.ts`
- `src/app/api/payments/confirm-payment/route.ts`
- `src/app/api/tickets/verify/route.ts`

### ライブラリ
- `src/lib/qr-generator.ts` - QRコード生成・検証
- `src/lib/pdf-generator.ts` - PDF生成
- `src/lib/stripe.ts` - Stripe決済
- `src/lib/paypay.ts` - PayPay決済