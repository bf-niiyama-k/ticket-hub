"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function PurchaseCompletePage() {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    // QRコード生成のシミュレーション
    const generateQRCode = () => {
      const ticketId = "TICKET-" + Date.now();
      setQrCode(
        `https://readdy.ai/api/search-image?query=QR%20code%20for%20event%20ticket%20with%20black%20squares%20on%20white%20background%2C%20clean%20design%2C%20scannable%20format&width=200&height=200&seq=${ticketId}&orientation=squarish`
      );
    };

    generateQRCode();
  }, []);

  const orderDetails = {
    orderNumber: "ORDER-" + Date.now().toString().slice(-8),
    eventTitle: "東京国際展示会2024",
    eventDate: "2024年3月15日",
    eventTime: "10:00 - 18:00",
    venue: "東京ビッグサイト",
    tickets: [
      { name: "一般入場券", quantity: 2, price: 3500 },
      { name: "VIPパス", quantity: 1, price: 8500 },
    ],
    totalAmount: 15500,
    systemFee: 775,
    finalAmount: 16275,
    purchaseDate: new Date().toLocaleDateString("ja-JP"),
    customerName: "田中太郎",
    customerEmail: "tanaka@example.com",
  };

  const handleDownloadTicket = () => {
    // チケットPDFダウンロードのシミュレーション
    alert("チケットPDFをダウンロードしました（シミュレーション）");
  };

  const handleAddToCalendar = () => {
    // カレンダー追加のシミュレーション
    alert("カレンダーに追加しました（シミュレーション）");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* 成功メッセージ */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-4xl text-green-600"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              チケット購入が完了しました！
            </h1>
            <p className="text-xl text-gray-600">
              ご購入ありがとうございます。チケット情報をメールでお送りしました。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QRコード表示 */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                入場用QRコード
              </h2>

              <div className="bg-gray-50 rounded-lg p-8 mb-6">
                {qrCode ? (
                  <Image
                    src={qrCode}
                    alt="入場用QRコード"
                    width={192}
                    height={192}
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <div className="text-center">
                      <i className="ri-qr-code-line text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500">QRコード生成中...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadTicket}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-download-line mr-2"></i>
                  チケットPDFをダウンロード
                </button>

                <button
                  onClick={handleAddToCalendar}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-calendar-line mr-2"></i>
                  カレンダーに追加
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <i className="ri-information-line text-yellow-600 mr-2 mt-1"></i>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">当日の注意事項</p>
                    <ul className="text-left space-y-1">
                      <li>• 入場時にこのQRコードを提示してください</li>
                      <li>• 身分証明書もご持参ください</li>
                      <li>• 開場時間の30分前から入場可能です</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 注文詳細 */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                注文詳細
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">注文番号</span>
                    <span className="font-mono text-sm">
                      {orderDetails.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">購入日</span>
                    <span className="text-sm">{orderDetails.purchaseDate}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    イベント情報
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-lg">
                      {orderDetails.eventTitle}
                    </p>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-calendar-line mr-2"></i>
                      <span>
                        {orderDetails.eventDate} {orderDetails.eventTime}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-map-pin-line mr-2"></i>
                      <span>{orderDetails.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    チケット詳細
                  </h3>
                  <div className="space-y-3">
                    {orderDetails.tickets.map((ticket, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <div>
                          <p className="font-medium">{ticket.name}</p>
                          <p className="text-sm text-gray-500">
                            ¥{ticket.price.toLocaleString()} × {ticket.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ¥{(ticket.price * ticket.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">小計</span>
                      <span>¥{orderDetails.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">システム手数料</span>
                      <span>¥{orderDetails.systemFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                      <span>合計</span>
                      <span>¥{orderDetails.finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    購入者情報
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">お名前</span>
                      <span>{orderDetails.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">メールアドレス</span>
                      <span className="text-sm">
                        {orderDetails.customerEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 次のアクション */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                次におすすめのアクション
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/my-tickets"
                  className="block bg-blue-50 hover:bg-blue-100 rounded-lg p-4 transition-colors cursor-pointer"
                >
                  <i className="ri-ticket-line text-2xl text-blue-600 mb-2"></i>
                  <p className="font-semibold text-blue-900">マイチケット</p>
                  <p className="text-sm text-blue-700">
                    購入済みチケットを確認
                  </p>
                </Link>

                <Link
                  href="/events"
                  className="block bg-green-50 hover:bg-green-100 rounded-lg p-4 transition-colors cursor-pointer"
                >
                  <i className="ri-calendar-event-line text-2xl text-green-600 mb-2"></i>
                  <p className="font-semibold text-green-900">他のイベント</p>
                  <p className="text-sm text-green-700">
                    他のイベントもチェック
                  </p>
                </Link>

                <button
                  onClick={() =>
                    alert("サポートにお問い合わせ（シミュレーション）")
                  }
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors cursor-pointer"
                >
                  <i className="ri-customer-service-line text-2xl text-gray-600 mb-2"></i>
                  <p className="font-semibold text-gray-900">サポート</p>
                  <p className="text-sm text-gray-700">お困りの際はこちら</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
