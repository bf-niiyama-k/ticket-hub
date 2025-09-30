# 認証システムのトラブルシューティングガイド

## 概要

このドキュメントでは、Next.js 15 App Router + Supabase認証の実装中に発生した問題と、その解決方法をまとめています。

**作成日**: 2025-09-30
**対象**: Next.js 15 (App Router) + Supabase + TypeScript

---

## 発生した問題の一覧

### 1. SupabaseのRLS（Row Level Security）無限再帰エラー

**エラーメッセージ**:
```
infinite recursion detected in policy for relation "profiles"
```

**原因**:
- `profiles`テーブルのRLSポリシーで、管理者ポリシーが同じ`profiles`テーブルを参照していたため無限再帰が発生

**解決方法**:
1. 問題のあるポリシーを削除
2. シンプルなポリシーに置き換え

```sql
-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can access all profiles" ON profiles;

-- 新しい安全なポリシーを作成
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

**ポイント**:
- 管理者が他ユーザーのプロファイルにアクセスする必要がある場合は、サーバーサイドでservice_roleキーを使用するか、専用のRPC関数を作成する
- RLSポリシー内で同じテーブルへの再帰的な参照を避ける

---

### 2. ログイン成功後のリダイレクトが動作しない

**症状**:
- ログインは成功するが、ページがリダイレクトされない
- ローディングスピナーが止まらない

**原因**:
1. `AdminLayout`コンポーネントで認証チェックとリダイレクトを行っており、middlewareとの競合が発生
2. ログイン後の`setIsLoading(false)`が呼ばれず、ローディング状態が継続
3. クライアント側とサーバー側（middleware）で二重に認証チェックを実行

**解決方法**:

#### A. AdminLayoutの認証チェックを削除

```typescript
// ❌ 修正前: AdminLayoutで認証チェック
useEffect(() => {
  if (!loading && !user) {
    router.push('/login?redirect_to=/admin');
  } else if (!loading && user && profile !== null && !['admin', 'staff'].includes(profile?.role || '')) {
    router.push('/');
  }
}, [user, profile, loading, router]);

// ✅ 修正後: middlewareに認証チェックを一元化
// AdminLayoutでは認証チェックを行わない
const { user, profile, signOut } = useAuth();
// middlewareで認証チェック済みのため、ここでは何もチェックしない
```

#### B. ログイン後の処理を修正

```typescript
// ❌ 修正前
if (user) {
  router.push(redirectTo)
}

// ✅ 修正後
if (user) {
  // middlewareでリダイレクト処理される
  // 少し待ってからリダイレクト（認証状態の反映を待つ）
  await new Promise(resolve => setTimeout(resolve, 500))
  router.push(redirectTo)
}

// finally ブロックで確実にローディングを解除
finally {
  setIsLoading(false)
}
```

**ポイント**:
- 認証チェックはmiddlewareで一元管理
- クライアント側ではログイン処理のみを行い、リダイレクトはmiddlewareに任せる
- `finally`ブロックでローディング状態を確実に解除

---

### 3. セッションが維持されているのにログイン画面に遷移する

**症状**:
- ブラウザのCookieにSupabaseセッションは存在する
- しかし、middlewareでセッションが取得できず、ログイン画面にリダイレクトされる

**エラーメッセージ**:
```
AuthSessionMissingError: Auth session missing!
```

**原因**:
1. クライアント側で`@supabase/supabase-js`の`createClient()`を使用していた
2. これはlocalStorageベースのセッション管理を行うため、Next.jsのSSR/middlewareと互換性がない
3. middlewareでCookieからセッション情報を読み取れない

**解決方法**:

#### A. クライアント側のSupabaseクライアントを修正

```typescript
// ❌ 修正前: @supabase/supabase-js を使用
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

// ✅ 修正後: @supabase/ssr を使用
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
```

#### B. middlewareのCookie処理を改善

```typescript
// ✅ 正しい実装
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 認証チェックとリダイレクト処理
  // ...

  return response
}
```

**ポイント**:
- Next.js App Routerでは必ず`@supabase/ssr`を使用する
- クライアント側: `createBrowserClient()` - 自動的にCookieを管理
- サーバー側（middleware）: `createServerClient()` - カスタムCookie処理
- `@supabase/supabase-js`のlocalStorageベースの認証はNext.jsと互換性がない

---

### 4. TypeScriptの厳格な型チェックエラー

**エラーの種類**:

#### A. `exactOptionalPropertyTypes: true`によるエラー

```typescript
// ❌ エラー: undefined を明示的に設定できない
setFormData({ ...formData, max_capacity: undefined })

// ✅ 修正: プロパティを削除
const updated = {...formData};
if (value !== undefined) {
  updated.max_capacity = value;
} else {
  delete updated.max_capacity;
}
setFormData(updated);
```

#### B. `noPropertyAccessFromIndexSignature: true`によるエラー

```typescript
// ❌ エラー: インデックスシグネチャはブラケット記法が必要
process.env.NEXT_PUBLIC_SUPABASE_URL
metadata.eventTitle

// ✅ 修正: ブラケット記法を使用
process.env['NEXT_PUBLIC_SUPABASE_URL']
metadata['eventTitle']
```

#### C. 未使用変数のエラー

```typescript
// ❌ エラー: 変数が使用されていない
const [verificationCode] = useState('')

// ✅ 修正1: アンダースコアで始める
const [_verificationCode] = useState('')

// ✅ 修正2: 使用しないなら削除
// 削除する
```

#### D. override修飾子のエラー

```typescript
// ❌ エラー: override修飾子が必要
export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

// ✅ 修正: override修飾子を追加
export class DatabaseError extends Error {
  constructor(message: string, public override cause?: Error) {
    super(message);
  }
}
```

---

## ベストプラクティス

### 1. 認証フロー設計

```
┌─────────────┐
│   ユーザー   │
└──────┬──────┘
       │ ログイン
       ↓
┌─────────────────┐
│  LoginForm      │
│  (Client)       │
│  - signIn()実行 │
└────────┬────────┘
         │ 認証成功
         ↓
┌─────────────────┐
│  Middleware     │
│  (Server)       │
│  - セッション確認│
│  - 権限チェック  │
│  - リダイレクト  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  目的のページ    │
└─────────────────┘
```

**原則**:
1. 認証チェックはmiddlewareで一元管理
2. クライアント側はログイン処理のみ
3. リダイレクトはmiddlewareに任せる

### 2. Supabase認証の設定

#### クライアント側（Browser）
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
)
```

#### サーバー側（Middleware）
```typescript
import { createServerClient } from '@supabase/ssr'

const supabase = createServerClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  }
)
```

### 3. RLSポリシーの設計

**原則**:
- シンプルに保つ
- 再帰的な参照を避ける
- 管理者用の特殊な処理はサーバーサイドで実装

```sql
-- ✅ 良い例: シンプルなポリシー
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- ❌ 悪い例: 再帰的な参照
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles  -- 無限再帰の原因
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
```

---

## デバッグ方法

### 1. middlewareのデバッグ

```typescript
// Cookie情報の確認
console.log('[Middleware] Cookies:', request.cookies.getAll().map(c => c.name))

// ユーザー情報の確認
console.log('[Middleware] User:', user ? `${user.email} (${user.id})` : 'null')

// エラーの確認
console.log('[Middleware] User Error:', userError)

// プロファイル情報の確認
console.log('[Middleware] Profile:', profile)
console.log('[Middleware] Profile Error:', profileError)
```

### 2. 認証状態の確認

ブラウザの開発者ツール:
1. **Application/Storage タブ**
   - Cookiesに`sb-`で始まるCookieが存在するか確認
   - `sb-access-token`、`sb-refresh-token`があるか

2. **Console タブ**
   - エラーメッセージを確認
   - 認証フローのログを確認

3. **Network タブ**
   - Supabase APIへのリクエストを確認
   - 401 Unauthorizedエラーがないか確認

---

## チェックリスト

### 認証実装のチェックリスト

- [ ] `@supabase/ssr`パッケージをインストール済み
- [ ] クライアント側で`createBrowserClient()`を使用
- [ ] サーバー側（middleware）で`createServerClient()`を使用
- [ ] middlewareでCookie処理を正しく実装
- [ ] SupabaseのRLSポリシーに無限再帰がない
- [ ] 認証チェックはmiddlewareで一元管理
- [ ] クライアント側で重複した認証チェックがない
- [ ] `finally`ブロックでローディング状態を解除
- [ ] 環境変数が正しく設定されている

### トラブルシューティングのチェックリスト

セッションが取得できない場合:
- [ ] ブラウザのCookieに`sb-`で始まるCookieがあるか確認
- [ ] `createBrowserClient()`を使用しているか確認
- [ ] middlewareのCookie処理が正しいか確認
- [ ] 環境変数が正しく設定されているか確認
- [ ] ブラウザのキャッシュをクリアしてみる

リダイレクトが動作しない場合:
- [ ] middlewareで認証チェックを実装しているか
- [ ] クライアント側で重複した認証チェックがないか
- [ ] `setIsLoading(false)`を`finally`ブロックで呼んでいるか
- [ ] リダイレクト前に少し待機しているか（500ms程度）

---

## 参考リソース

- [Supabase公式ドキュメント - Next.js認証](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15ドキュメント - Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase公式ドキュメント - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 更新履歴

- 2025-09-30: 初版作成
  - RLS無限再帰エラーの解決方法を追加
  - ログイン後のリダイレクト問題の解決方法を追加
  - セッション取得エラーの解決方法を追加
  - TypeScript型エラーの解決方法を追加