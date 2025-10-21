"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decodeQRData, verifyQRSignature } from "@/lib/qr-generator";
import { ticketAPI } from "@/lib/database";
import { TicketScanResult } from "@/types/ticket";
import { Input } from "@/components/ui/input";

interface QRCodeScannerProps {
  onScanSuccess: (result: TicketScanResult) => void;
  onError?: (error: string) => void;
}

export default function QRCodeScanner({ onScanSuccess }: QRCodeScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<TicketScanResult | null>(
    null
  );
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // クリーンアップ
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    if (scannerRef.current && !isScanning) {
      setCameraError(null);
      console.log("Starting QR scanner...");

      try {
        const qrcodeScanner = new Html5QrcodeScanner(
          "qr-scanner-container",
          {
            fps: 0.5,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
            rememberLastUsedCamera: true,
            // カメラリクエストのタイムアウトを延長
            videoConstraints: {
              facingMode: "environment",
            },
          },
          false
        );

        console.log("Scanner instance created, rendering...");

        qrcodeScanner.render(
          (decodedText: string) => {
            // スキャン成功
            console.log("QR Code detected:", decodedText);
            handleScanSuccess(decodedText);
          },
          (error: string) => {
            // QRコードが見つからない通常のエラーは無視
            if (
              error.includes("NotFoundException") ||
              error.includes("No MultiFormat Readers")
            ) {
              // QRコードスキャン中の通常のエラー - 何もしない
              return;
            }

            // すべてのエラーをコンソールに出力
            console.log("QR Scanner Error:", error);

            // カメラ関連のエラーを検出
            const isCameraError =
              error.includes("Permission") ||
              error.includes("NotAllowed") ||
              error.includes("NotSupported") ||
              error.includes("NotReadable") ||
              error.includes("OverconstrainedError") ||
              error.includes("timeout") ||
              error.includes("Timeout");

            if (isCameraError) {
              console.error("Camera error detected:", error);
              setCameraError(error);
              setIsScanning(false);
            }
          }
        );

        console.log("Scanner render called successfully");
        setScanner(qrcodeScanner);
        setIsScanning(true);
      } catch (error) {
        console.error("Scanner initialization error:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setCameraError(`初期化エラー: ${errorMessage}`);
        setIsScanning(false);
      }
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
      setIsScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    // 検証中は無視
    if (isVerifying) {
      return;
    }

    setIsVerifying(true);

    try {
      // QRコードデータをデコード・検証（JSON形式の場合）
      const qrData = decodeQRData(decodedText);

      // JSON形式のQRコードの場合は署名検証
      if (qrData && !verifyQRSignature(qrData)) {
        const errorResult: TicketScanResult = {
          success: false,
          message: "QRコードの署名が無効です",
          scanTime: new Date().toISOString(),
          status: "invalid",
        };
        setLastScanResult(errorResult);
        onScanSuccess(errorResult);
        playErrorSound();
        return;
      }

      // データベースからチケット情報を取得
      // JSON形式でもプレーンテキストでもどちらでもOK
      const ticketData = await ticketAPI.getTicketByQR(decodedText);

      if (!ticketData) {
        const errorResult: TicketScanResult = {
          success: false,
          message: "チケットが見つかりませんでした",
          scanTime: new Date().toISOString(),
          status: "invalid",
        };
        setLastScanResult(errorResult);
        onScanSuccess(errorResult);
        playErrorSound();
        return;
      }

      // チケット型をTicket型に変換
      const ticket = {
        id: ticketData.id,
        eventId: ticketData.event_id,
        userId: ticketData.user_id || "",
        eventTitle: ticketData.event?.title || "",
        eventDate: new Date(
          ticketData.event?.date_start || ""
        ).toLocaleDateString("ja-JP"),
        eventTime: `${new Date(
          ticketData.event?.date_start || ""
        ).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(ticketData.event?.date_end || "").toLocaleTimeString(
          "ja-JP",
          { hour: "2-digit", minute: "2-digit" }
        )}`,
        venue: ticketData.event?.location || "",
        ticketType: ticketData.ticket_type?.name || "",
        price: ticketData.ticket_type?.price || 0,
        quantity: 1,
        purchaseDate: new Date(ticketData.created_at).toLocaleDateString(
          "ja-JP"
        ),
        status: ticketData.status as
          | "active"
          | "used"
          | "expired"
          | "cancelled",
        customerName: "お客様", // TODO: orderテーブルから取得
        customerEmail: "", // TODO: orderテーブルから取得
        orderNumber: ticketData.order_item_id,
        createdAt: ticketData.created_at,
        updatedAt: ticketData.created_at, // updated_atがない場合created_atを使用
      };

      // ステータスに応じた結果を生成
      let scanResult: TicketScanResult;

      if (ticketData.status === "used") {
        scanResult = {
          success: false,
          message: "このチケットは既に使用済みです",
          scanTime: new Date().toISOString(),
          status: "used",
          ticket,
        };
        playErrorSound();
      } else if (ticketData.status === "cancelled") {
        scanResult = {
          success: false,
          message: "このチケットはキャンセル済みです",
          scanTime: new Date().toISOString(),
          status: "invalid",
          ticket,
        };
        playErrorSound();
      } else if (ticketData.status === "valid") {
        // イベント日時確認
        const eventDate = new Date(ticketData.event?.date_start || "");
        const now = new Date();
        const daysDiff = Math.floor(
          (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 1) {
          scanResult = {
            success: false,
            message: `このチケットのイベントは${daysDiff}日後です`,
            scanTime: new Date().toISOString(),
            status: "invalid",
            ticket,
          };
          playErrorSound();
        } else if (daysDiff < -1) {
          scanResult = {
            success: false,
            message: "このチケットのイベントは終了しています",
            scanTime: new Date().toISOString(),
            status: "expired",
            ticket,
          };
          playErrorSound();
        } else {
          scanResult = {
            success: true,
            message: "有効なチケットです。入場を許可できます",
            scanTime: new Date().toISOString(),
            status: "valid",
            ticket,
          };
          playSuccessSound();
        }
      } else {
        scanResult = {
          success: false,
          message: "無効なチケットステータスです",
          scanTime: new Date().toISOString(),
          status: "invalid",
          ticket,
        };
        playErrorSound();
      }

      setLastScanResult(scanResult);
      onScanSuccess(scanResult);
    } catch (error) {
      console.error("チケット検証エラー:", error);
      const errorResult: TicketScanResult = {
        success: false,
        message: "チケットの検証に失敗しました",
        scanTime: new Date().toISOString(),
        status: "invalid",
      };
      setLastScanResult(errorResult);
      onScanSuccess(errorResult);
      playErrorSound();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanSuccess(manualInput.trim());
      setManualInput("");
    }
  };

  const toggleManualMode = () => {
    if (!manualMode) {
      stopScanning();
    }
    setManualMode(!manualMode);
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio("/sounds/success.mp3");
      audio.play().catch(() => {
        // 音声再生失敗は無視
      });
    } catch {
      // 音声ファイルがない場合は無視
    }
  };

  const playErrorSound = () => {
    try {
      const audio = new Audio("/sounds/error.mp3");
      audio.play().catch(() => {
        // 音声再生失敗は無視
      });
    } catch {
      // 音声ファイルがない場合は無視
    }
  };

  return (
    <div className="space-y-6">
      {/* モード切り替え */}
      <div className="flex justify-center">
        <Button
          onClick={toggleManualMode}
          variant="outline"
          className="text-blue-600 hover:text-blue-700"
        >
          {manualMode ? (
            <>
              <i className="ri-qr-scan-2-line mr-2"></i>
              スキャンモードに戻る
            </>
          ) : (
            <>
              <i className="ri-keyboard-line mr-2"></i>
              手動入力モードに切り替え
            </>
          )}
        </Button>
      </div>

      {/* スキャナー制御 */}
      {!manualMode ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">QRコードスキャナー</h3>
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? "destructive" : "default"}
              disabled={isVerifying}
            >
              {isScanning ? (
                <>
                  <i className="ri-stop-line mr-2"></i>
                  スキャン停止
                </>
              ) : (
                <>
                  <i className="ri-qr-scan-2-line mr-2"></i>
                  スキャン開始
                </>
              )}
            </Button>
          </div>

          {/* カメラエラー表示 */}
          {cameraError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <i className="ri-error-warning-line text-red-600 text-xl mr-2 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium mb-1">
                    カメラエラー
                  </p>
                  <p className="text-red-700 text-sm">{cameraError}</p>
                  <p className="text-red-600 text-xs mt-2">
                    ※ カメラが使用できない場合は、手動入力モードをご利用ください
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* スキャナー表示エリア */}
          <div className="relative">
            {!isScanning && !isVerifying && (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="ri-qr-scan-2-line text-6xl mb-4"></i>
                  <p className="text-lg font-medium mb-2">QRコードをスキャン</p>
                  <p className="text-sm">
                    「スキャン開始」ボタンをクリックしてください
                  </p>
                </div>
              </div>
            )}
            {isVerifying && (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="ri-loader-4-line text-6xl mb-4 animate-spin"></i>
                  <p className="text-lg font-medium">検証中...</p>
                </div>
              </div>
            )}
            <div
              id="qr-scanner-container"
              ref={scannerRef}
              className={`${isScanning && !isVerifying ? "block" : "hidden"}`}
            />
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            QRコードを手動入力
          </h3>
          <div className="space-y-4">
            <Input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualSubmit();
                }
              }}
              placeholder="QRコードの文字列を入力"
              className="w-full"
              disabled={isVerifying}
            />
            <Button
              onClick={handleManualSubmit}
              disabled={!manualInput.trim() || isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  検証中...
                </>
              ) : (
                <>
                  <i className="ri-search-line mr-2"></i>
                  検証する
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* スキャン結果表示 */}
      {lastScanResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">スキャン結果</h3>

          <div
            className={`border-2 rounded-lg p-4 mb-4 ${
              lastScanResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-center mb-2">
              <i
                className={`text-xl mr-2 ${
                  lastScanResult.success
                    ? "ri-check-line text-green-600"
                    : "ri-close-line text-red-600"
                }`}
              ></i>
              <Badge
                className={
                  lastScanResult.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {lastScanResult.status === "valid"
                  ? "有効"
                  : lastScanResult.status === "used"
                  ? "使用済み"
                  : lastScanResult.status === "expired"
                  ? "期限切れ"
                  : "無効"}
              </Badge>
            </div>
            <p
              className={
                lastScanResult.success ? "text-green-800" : "text-red-800"
              }
            >
              {lastScanResult.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              スキャン時刻:{" "}
              {new Date(lastScanResult.scanTime).toLocaleString("ja-JP")}
            </p>
          </div>

          {/* チケット詳細表示 */}
          {lastScanResult.ticket && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">チケット詳細</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">イベント:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.eventTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">お客様名:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">チケット種類:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.ticketType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">枚数:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.quantity}枚
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">開催日時:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.eventDate}{" "}
                    {lastScanResult.ticket.eventTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">会場:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.venue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">チケットID:</span>
                  <span className="font-mono text-xs">
                    {lastScanResult.ticket.id}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
