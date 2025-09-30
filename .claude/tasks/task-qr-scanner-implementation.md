# Task: QRコードスキャナー実装

**優先度**: 🟡 高 (現地運用に必要)

## 目的

管理画面でチケットのQRコードをスキャンし、チケットの有効性を確認して使用済みにする機能を実装する。

## 参照ドキュメント

- `.claude/spec/spec-remaining-features.md`
- `src/lib/database.ts` (ticketAPI)

## 実装計画

### Phase 1: QRコードスキャン機能

#### 1-1. QRコードリーダーライブラリのインストール
```bash
npm install react-qr-reader
npm install --save-dev @types/react-qr-reader
```

または

```bash
npm install html5-qrcode
```

#### 1-2. スキャナーコンポーネントの実装
**ファイル**: `src/app/admin/scanner/page.tsx`

- [ ] カメラアクセス許可の取得
- [ ] QRコードスキャン機能
- [ ] 手動入力モード
- [ ] スキャン音・バイブレーション（モバイル）

**実装例（html5-qrcode使用）**:
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components';
import { ticketAPI } from '@/lib/database';
import type { TicketWithDetails } from '@/types/database';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  // スキャナー初期化
  const startScanning = async () => {
    try {
      if (!readerRef.current) return;

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // 背面カメラ
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );

      setScanning(true);
      setError(null);
    } catch (err) {
      console.error('カメラ起動エラー:', err);
      setError('カメラの起動に失敗しました。手動入力モードをお試しください。');
    }
  };

  // スキャナー停止
  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // スキャン成功時
  const onScanSuccess = async (decodedText: string) => {
    console.log('QRコード検出:', decodedText);
    await stopScanning();
    await verifyTicket(decodedText);
  };

  // スキャン失敗時（無視）
  const onScanFailure = () => {
    // スキャン失敗は頻繁に発生するので何もしない
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  // ... チケット検証処理（Phase 2）
}
```

---

### Phase 2: チケット検証機能

#### 2-1. チケット照合処理
- [ ] `ticketAPI.getTicketByQR()` でチケット検索
- [ ] チケット情報の表示
- [ ] チケットステータスの確認

**実装例**:
```typescript
const verifyTicket = async (qrCodeValue: string) => {
  try {
    setError(null);
    setSuccess(null);
    setTicket(null);

    // チケット検索
    const foundTicket = await ticketAPI.getTicketByQR(qrCodeValue);

    if (!foundTicket) {
      setError('無効なQRコードです。チケットが見つかりませんでした。');
      playErrorSound();
      return;
    }

    setTicket(foundTicket);

    // ステータス確認
    if (foundTicket.status === 'used') {
      setError('このチケットは既に使用済みです。');
      playErrorSound();
      return;
    }

    if (foundTicket.status === 'cancelled') {
      setError('このチケットはキャンセル済みです。');
      playErrorSound();
      return;
    }

    // イベント日時確認（オプション）
    const eventDate = new Date(foundTicket.event.date_start);
    const now = new Date();
    const daysDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      setError(`このチケットのイベントは${daysDiff}日後です。`);
      playErrorSound();
      return;
    }

    if (daysDiff < -1) {
      setError('このチケットのイベントは終了しています。');
      playErrorSound();
      return;
    }

    playSuccessSound();
  } catch (err) {
    console.error('チケット検証エラー:', err);
    setError('チケットの検証に失敗しました。');
    playErrorSound();
  }
};

// 効果音
const playSuccessSound = () => {
  const audio = new Audio('/sounds/success.mp3');
  audio.play().catch(() => {});
};

const playErrorSound = () => {
  const audio = new Audio('/sounds/error.mp3');
  audio.play().catch(() => {});
};
```

#### 2-2. チケット情報表示
- [ ] イベント名
- [ ] チケット種類
- [ ] 購入者情報
- [ ] ステータス
- [ ] 使用確認ボタン

**実装例**:
```typescript
{ticket && (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">チケット情報</h3>
      {ticket.status === 'valid' && (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          有効
        </span>
      )}
    </div>

    <div className="space-y-3">
      <div>
        <p className="text-sm text-gray-600">イベント</p>
        <p className="text-lg font-semibold text-gray-900">{ticket.event.title}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">日時</p>
        <p className="text-gray-900">
          {new Date(ticket.event.date_start).toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">会場</p>
        <p className="text-gray-900">{ticket.event.location}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">チケット種類</p>
        <p className="text-gray-900">{ticket.ticket_type.name}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">チケットID</p>
        <p className="font-mono text-sm text-gray-900">#{ticket.id.slice(-8)}</p>
      </div>
    </div>

    {ticket.status === 'valid' && (
      <button
        onClick={() => handleUseTicket(ticket.id)}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-lg"
      >
        チケットを使用する
      </button>
    )}
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-center">
      <i className="ri-error-warning-line text-red-600 text-2xl mr-3"></i>
      <p className="text-red-800 font-medium">{error}</p>
    </div>
  </div>
)}

{success && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
    <div className="flex items-center">
      <i className="ri-checkbox-circle-line text-green-600 text-2xl mr-3"></i>
      <p className="text-green-800 font-medium">{success}</p>
    </div>
  </div>
)}
```

---

### Phase 3: チケット使用処理

#### 3-1. チケット使用機能
- [ ] `ticketAPI.useTicket()` でステータス更新
- [ ] 成功メッセージ表示
- [ ] 次のスキャンへの準備

**実装例**:
```typescript
const handleUseTicket = async (ticketId: string) => {
  try {
    await ticketAPI.useTicket(ticketId);

    setSuccess('チケットを使用済みにしました。入場を許可してください。');
    playSuccessSound();

    // 3秒後にリセット
    setTimeout(() => {
      setTicket(null);
      setSuccess(null);
      setError(null);

      if (!manualMode) {
        startScanning();
      }
    }, 3000);
  } catch (err) {
    console.error('チケット使用エラー:', err);
    setError('チケットの使用処理に失敗しました。');
    playErrorSound();
  }
};
```

---

### Phase 4: 手動入力モード

#### 4-1. 手動入力UI
- [ ] QRコード文字列の入力フィールド
- [ ] 検証ボタン
- [ ] スキャンモードへの切り替え

**実装例**:
```typescript
<div className="mb-6">
  <button
    onClick={() => {
      setManualMode(!manualMode);
      if (!manualMode) {
        stopScanning();
      }
    }}
    className="text-blue-600 hover:text-blue-700 font-medium"
  >
    {manualMode ? 'スキャンモードに戻る' : '手動入力モードに切り替え'}
  </button>
</div>

{manualMode ? (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      QRコードを手動入力
    </h3>
    <div className="space-y-4">
      <input
        type="text"
        value={qrCode}
        onChange={(e) => setQrCode(e.target.value)}
        placeholder="QRコードの文字列を入力"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={() => verifyTicket(qrCode)}
        disabled={!qrCode}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        検証する
      </button>
    </div>
  </div>
) : (
  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
    <div
      id="qr-reader"
      ref={readerRef}
      className="w-full"
      style={{ minHeight: '400px' }}
    />

    {!scanning && (
      <div className="p-6">
        <button
          onClick={startScanning}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold"
        >
          スキャンを開始
        </button>
      </div>
    )}
  </div>
)}
```

---

### Phase 5: UI/UX改善

#### 5-1. レスポンシブ対応
- [ ] モバイル表示の最適化
- [ ] タブレット表示の最適化

#### 5-2. アクセシビリティ
- [ ] スキャン音のON/OFF設定
- [ ] カメラ選択（フロント/リア）
- [ ] 明るさ調整のヒント表示

#### 5-3. 統計表示
- [ ] 本日のスキャン数
- [ ] 有効チケット数
- [ ] 使用済みチケット数
- [ ] エラー数

**実装例**:
```typescript
const [stats, setStats] = useState({
  todayScans: 0,
  validTickets: 0,
  usedTickets: 0,
  errors: 0,
});

// 統計カード
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-white rounded-lg shadow-sm p-4">
    <p className="text-sm text-gray-600 mb-1">本日のスキャン</p>
    <p className="text-2xl font-bold text-gray-900">{stats.todayScans}</p>
  </div>
  <div className="bg-white rounded-lg shadow-sm p-4">
    <p className="text-sm text-gray-600 mb-1">有効</p>
    <p className="text-2xl font-bold text-green-600">{stats.validTickets}</p>
  </div>
  <div className="bg-white rounded-lg shadow-sm p-4">
    <p className="text-sm text-gray-600 mb-1">使用済み</p>
    <p className="text-2xl font-bold text-gray-600">{stats.usedTickets}</p>
  </div>
  <div className="bg-white rounded-lg shadow-sm p-4">
    <p className="text-sm text-gray-600 mb-1">エラー</p>
    <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
  </div>
</div>
```

---

### Phase 6: 検証

- [ ] QRコードスキャンが正常に動作する
- [ ] カメラアクセスが正常に動作する
- [ ] チケット検証が正常に動作する
- [ ] チケット使用処理が正常に動作する
- [ ] 手動入力モードが正常に動作する
- [ ] 有効なチケットが使用できる
- [ ] 使用済みチケットが拒否される
- [ ] キャンセル済みチケットが拒否される
- [ ] 無効なQRコードが拒否される
- [ ] 効果音が鳴る
- [ ] TypeScript型エラー解消
- [ ] ESLint警告解消
- [ ] ビルドエラー解消

---

## 技術的な注意点

### カメラアクセス
- HTTPSが必要（localhostを除く）
- ユーザーの許可が必要
- モバイルでは背面カメラを優先

### QRコード読み取り
- 照明条件によって読み取り精度が変わる
- 距離・角度に注意
- 手動入力モードを必ず用意

### セキュリティ
- QRコードの一意性を確保
- 使用済みチケットの再利用防止
- 管理者権限の確認

### パフォーマンス
- スキャン頻度を適切に設定（fps: 10）
- 重複スキャン防止

---

## 進捗メモ
<!-- 作業進捗を随時更新 -->