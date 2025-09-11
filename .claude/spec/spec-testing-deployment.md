# テスト・デプロイ・品質向上 仕様書

## 実装方針
優先度：**低** - 主要機能完了後の品質向上フェーズ

## 現状調査結果

### 既存設定状況
- ✅ **Jest設定済み** - `jest.config.js`存在、テストランナー準備完了
- ✅ **Testing Library導入済み** - React Testing Library、Jest DOM完備
- ✅ **TypeScript設定済み** - 型安全テスト実装可能
- ✅ **ESLint設定済み** - コード品質チェック機能完備
- ✅ **ビルド正常動作** - Next.js本番ビルド成功（32ページ生成）
- ❌ **テストファイル未実装** - `__tests__`ディレクトリ存在せず
- ❌ **GitHub Actions未設定** - CI/CDパイプライン未構築

### プロジェクト構成確認
- **ファイル数**: 6606行のコード実装済み
- **主要機能**: 認証・決済・QR・データベース統合完了
- **技術構成**: Next.js 15 + TypeScript + Tailwind + Supabase + Stripe
- **デプロイ先**: Vercel（設定済み）

## テスト戦略設計

### Phase 1: ユニットテスト実装
**対象**: コンポーネント・hooks・utilities
**カバレッジ目標**: 80%以上

#### 1.1 コンポーネントテスト
```
__tests__/components/
├── ui/             # shadcn/ui基本コンポーネント
├── shared/         # ビジネスロジックコンポーネント
├── layout/         # レイアウトコンポーネント
├── auth/           # 認証コンポーネント
└── ticket/         # QRコード・チケットコンポーネント
```

#### 1.2 フック・ライブラリテスト
```
__tests__/
├── hooks/          # カスタムフック
├── lib/            # ユーティリティライブラリ
└── utils/          # ヘルパー関数
```

### Phase 2: インテグレーションテスト
**対象**: API・データベース連携

#### 2.1 API統合テスト
```
__tests__/api/
├── payments/       # 決済API
├── tickets/        # チケット検証API
└── auth/           # 認証API
```

#### 2.2 データベース統合テスト
- Supabase接続テスト
- RLSポリシーテスト
- CRUD操作テスト

### Phase 3: E2Eテスト設計
**ツール**: Playwright（推奨）または Cypress
**対象**: 主要ユーザーフロー

#### 3.1 重要フロー
1. **ユーザー登録・ログイン**
2. **イベント閲覧・チケット購入**
3. **決済処理（Stripe・PayPay）**
4. **チケット表示・QRコード**
5. **管理画面操作**

## CI/CDパイプライン設計

### GitHub Actions ワークフロー

#### 4.1 メインワークフロー（.github/workflows/ci.yml）
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    - Node.jsセットアップ
    - 依存関係インストール
    - ESLint実行
    - TypeScriptチェック
    - ユニット・統合テスト実行
    - テストカバレッジ測定
    
  build:
    - Next.jsビルド実行
    - 静的解析チェック
    
  e2e:
    - Playwrightセットアップ
    - E2Eテスト実行
    
  deploy:
    - Vercelデプロイ（本番）
```

### 4.2 セキュリティテスト
- **依存関係脆弱性チェック**: `npm audit`
- **TypeScript厳密チェック**: `tsc --noEmit`
- **環境変数検証**: `.env`ファイルチェック

## パフォーマンステスト

### 5.1 Core Web Vitals対応
- **Lighthouse CI統合**
- **Bundle分析**: `@next/bundle-analyzer`
- **画像最適化**: Next.js Image対応
- **コンポーネント遅延読み込み**

### 5.2 負荷テスト
- **API負荷テスト**: k6またはArteriy
- **データベース負荷**: Supabaseパフォーマンス監視

## 品質向上施策

### 6.1 コード品質
- **ESLint強化**: strict設定、カスタムルール
- **Prettier統合**: コードフォーマット自動化
- **Husky**: pre-commit hooks設定
- **TypeScript厳密化**: `strict: true`設定

### 6.2 セキュリティ強化
- **CSPヘッダー**: Next.js設定
- **認証トークン**: JWTセキュリティ監査
- **HTTPS強制**: 本番環境設定

## 実装優先順位

### Phase 1（高優先度）
1. ✅ **Jest設定最適化**
2. **基本ユニットテスト実装**（コンポーネント・hooks）
3. **CI/CDパイプライン基本設定**
4. **ESLint・TypeScript厳密化**

### Phase 2（中優先度）
5. **API統合テスト実装**
6. **E2Eテスト基本フロー**
7. **パフォーマンステスト**
8. **セキュリティ監査**

### Phase 3（低優先度）
9. **高度なE2Eシナリオ**
10. **負荷テスト**
11. **監視・ログ設定**
12. **ドキュメント整備**

## 成功基準

### テスト基準
- **ユニットテストカバレッジ**: 80%以上
- **統合テスト**: 主要API全カバー
- **E2Eテスト**: 重要フロー5つ以上
- **CI/CD**: 全パイプライン成功

### パフォーマンス基準
- **Lighthouse Score**: 90以上
- **First Load JS**: 200KB以下
- **Core Web Vitals**: Good評価
- **ビルド時間**: 30秒以内

### セキュリティ基準
- **脆弱性**: Critical/High 0件
- **TypeScript**: エラー 0件
- **ESLint**: エラー・警告 0件
- **環境変数**: 本番環境分離

## 関連ファイル

### 新規作成予定
- `__tests__/` - テストディレクトリ
- `.github/workflows/` - CI/CDワークフロー
- `playwright.config.js` - E2E設定
- `jest.setup.js` - Jest環境設定
- `.eslintrc.strict.js` - 厳密ESLint設定

### 更新予定
- `jest.config.js` - 設定最適化
- `package.json` - テストスクリプト追加
- `next.config.js` - セキュリティヘッダー
- `tsconfig.json` - 厳密化設定

## 注意事項
- **環境変数管理**: テスト用環境の適切な分離
- **モック戦略**: 外部API（Stripe・PayPay）の適切なモック
- **データベーステスト**: 本番データへの影響回避
- **CI/CD制限**: GitHub Actions実行時間・リソース考慮