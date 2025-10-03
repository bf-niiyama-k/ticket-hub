# Stripe Webhook設定ガイド

## 開発環境（localhost）の設定

### 1. Stripe CLIのインストール

#### Windows (推奨: Scoop使用)
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

#### Windows (直接ダウンロード)
https://github.com/stripe/stripe-cli/releases/latest からダウンロード

#### macOS (Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

### 2. Stripe CLIでログイン

```bash
stripe login
```

ブラウザが開いてStripeアカウントへの接続を許可します。

### 3. Webhookイベントをローカルにフォワーディング

開発サーバーを起動した状態で、別のターミナルで以下を実行：

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

実行すると以下のようなメッセージが表示されます：
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### 4. 環境変数に設定

`.env.local`ファイルに以下を追加：

```bash
# 開発環境用
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # stripe listenコマンドで表示されたシークレット
```

### 5. テスト実行

別のターミナルで以下を実行してWebhookをテスト：

```bash
stripe trigger checkout.session.completed
```

---

## 本番環境・テストサイトの設定

### 1. Stripeダッシュボードでエンドポイントを作成

1. [Stripeダッシュボード](https://dashboard.stripe.com) にログイン
2. **開発者** → **Webhooks** に移動
3. **エンドポイントを追加** をクリック

### 2. エンドポイントURLの設定

**テストモード用エンドポイント**（開発・ステージング環境）:
```
https://your-test-site.vercel.app/api/webhooks/stripe
```

**本番モード用エンドポイント**（本番環境）:
```
https://your-production-site.com/api/webhooks/stripe
```

> **重要**: テストモードと本番モードで別々にエンドポイントを設定する必要があります

### 3. イベント選択

以下のイベントを選択：
- ✅ `checkout.session.completed` - 決済完了時
- ✅ `checkout.session.expired` - セッション期限切れ時

### 4. Signing Secretの取得

エンドポイント作成後、**Signing secret**が表示されます。
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. 環境変数に設定

**Vercelの場合**:
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 以下を追加：

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**環境別に設定する場合**:
- Development: 開発環境用のシークレット
- Preview: テスト環境用のシークレット
- Production: 本番環境用のシークレット

---

## 複数環境での管理方法

### 方法1: 環境変数で分岐（推奨）

`.env.local` (開発環境):
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # stripe listen で取得
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Vercel環境変数 (テスト環境):
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # テストモードのWebhook secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_BASE_URL=https://your-test-site.vercel.app
```

Vercel環境変数 (本番環境):
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # 本番モードのWebhook secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_BASE_URL=https://your-production-site.com
```

### 方法2: Stripe CLIでのテストトリガー

開発中にWebhookをテストする場合：

```bash
# 決済成功をシミュレート
stripe trigger checkout.session.completed

# 決済期限切れをシミュレート
stripe trigger checkout.session.expired
```

---

## トラブルシューティング

### Webhookが届かない場合

1. **エンドポイントURLの確認**
   - HTTPSを使用しているか（localhost以外）
   - URLが正しいか

2. **Signing Secretの確認**
   ```bash
   # 環境変数が正しく設定されているか確認
   echo $STRIPE_WEBHOOK_SECRET
   ```

3. **Stripeダッシュボードでログ確認**
   - Webhooks → エンドポイント → イベントログを確認
   - エラーメッセージを確認

4. **開発環境でstripe listenが起動しているか確認**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Webhook署名検証エラー

```
Webhook signature verification failed
```

→ `STRIPE_WEBHOOK_SECRET`が正しく設定されているか確認

### タイムアウトエラー

Webhookは5秒以内にレスポンスを返す必要があります。処理が重い場合は非同期処理を検討してください。

---

## セキュリティのベストプラクティス

1. **必ず署名を検証する** - すでに実装済み（`validateWebhookSignature`）
2. **冪等性を確保する** - 重複処理を防ぐ（`payment_id`でチェック済み）
3. **環境変数を安全に管理** - `.env.local`はgitにコミットしない
4. **HTTPSを使用** - 本番環境では必須

---

## 動作確認手順

### 開発環境
1. `npm run dev` でサーバー起動
2. `stripe listen --forward-to localhost:3000/api/webhooks/stripe` を別ターミナルで実行
3. チェックアウトフローをテスト
4. Webhookが正しく処理されることを確認

### 本番環境
1. Vercelにデプロイ
2. Stripeダッシュボードでエンドポイント設定
3. テストモードで実際に決済をテスト
4. Stripeダッシュボードのログで成功を確認
5. 本番モードに切り替え

---

## 参考リンク

- [Stripe CLI公式ドキュメント](https://stripe.com/docs/stripe-cli)
- [Webhookのテスト方法](https://stripe.com/docs/webhooks/test)
- [Webhook署名検証](https://stripe.com/docs/webhooks/signatures)
