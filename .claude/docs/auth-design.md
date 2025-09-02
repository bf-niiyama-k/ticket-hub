# 認証システム設計

## 概要
ticket-hubアプリケーションにおける認証システムの設計ドキュメント。メール認証、Google認証、ゲスト購入の3つの認証フローに対応する。

## 認証フロー設計

### 1. メール認証フロー
```
ユーザー登録画面 → メールアドレス入力 → 確認メール送信 → メール確認 → アカウント有効化 → ログイン完了
```

#### 実装詳細
- Supabaseのauth.signUpを使用
- メールアドレス + パスワード
- 確認メール送信（email_confirm）
- メール認証後にユーザープロファイルを作成

### 2. Google認証フロー
```
ログイン画面 → Googleボタンクリック → Google OAuth → 認証成功 → プロファイル自動作成 → ログイン完了
```

#### 実装詳細
- Supabaseのauth.signInWithOAuth (provider: 'google')
- Google OAuth 2.0使用
- 初回ログイン時にプロファイル自動作成
- リダイレクトURL: /auth/callback

### 3. ゲスト購入フロー
```
購入画面 → ゲスト購入選択 → 最小限情報入力 → 一時アカウント作成 → チケット購入 → 購入完了
```

#### 実装詳細
- 匿名アカウント（anonymous user）としてSupabaseに登録
- 最小限の情報のみ収集（名前、メール）
- 購入後にアカウント登録への案内
- セッション期限：24時間

## セキュリティ設定

### RLS（Row Level Security）ポリシー
- 各テーブルでRLSを有効化
- ユーザーは自身のデータのみアクセス可能
- 管理者は全データアクセス可能

### セッション管理
- セッション期限：7日間（通常ユーザー）
- リフレッシュトークンによる自動更新
- ログアウト時の完全セッション削除

## 実装対象ファイル

### 認証関連
- `src/lib/supabase/client.ts` - Supabaseクライアント設定
- `src/lib/auth/` - 認証ユーティリティ関数
- `src/app/auth/callback/` - OAuth認証コールバック
- `src/components/auth/` - 認証コンポーネント

### データベース
- `profiles` テーブル - ユーザープロファイル
- `orders` テーブル - 注文履歴（ゲスト含む）
- RLSポリシー設定

## 環境変数
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```