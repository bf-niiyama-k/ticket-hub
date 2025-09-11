"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { usePayment } from "../../hooks/usePayment";
import type { PaymentMethod, OrderItem } from "../../types/payment";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("credit");
  
  // 決済フックを使用
  const {
    isProcessing,
    error: paymentError,
    createPaymentIntent,
    confirmPayment,
    clearError,
  } = usePayment();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const eventId = searchParams.get("event");
  const ticketsParam = searchParams.get("tickets");
  const selectedTickets = ticketsParam
    ? JSON.parse(decodeURIComponent(ticketsParam))
    : {};

  const events = {
    "1": {
      title: "東京国際展示会2024",
      date: "2024年3月15日",
      venue: "東京ビッグサイト",
    },
    "2": {
      title: "ホテル春の特別ディナー",
      date: "2024年3月20日",
      venue: "グランドホテル東京",
    },
  };

  const ticketTypes = {
    "1": [
      { id: "general", name: "一般入場券", price: 3500 },
      { id: "vip", name: "VIPパス", price: 8500 },
      { id: "business", name: "ビジネスパス", price: 12000 },
    ],
    "2": [
      { id: "dinner", name: "特別ディナーコース", price: 12000 },
      { id: "wine", name: "ワインペアリングコース", price: 18000 },
      { id: "premium", name: "プレミアムコース", price: 25000 },
    ],
  };

  const event = events[eventId as keyof typeof events];
  const tickets = ticketTypes[eventId as keyof typeof ticketTypes] || [];

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce(
      (total, [ticketId, count]) => {
        const ticket = tickets.find((t) => t.id === ticketId);
        return total + (ticket ? ticket.price * (count as number) : 0);
      },
      0
    );
  };

  const paymentMethods = [
    { id: "credit", name: "クレジットカード", icon: "ri-bank-card-line" },
    { id: "paypay", name: "PayPay", icon: "ri-smartphone-line" },
    { id: "convenience", name: "コンビニ決済", icon: "ri-store-line" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePurchase = async () => {
    if (!eventId || !event) {
      alert("イベント情報が見つかりません");
      return;
    }

    // バリデーション
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert("お名前とメールアドレスは必須項目です");
      return;
    }

    if (selectedPaymentMethod === "credit" && (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName)) {
      alert("クレジットカード情報を正しく入力してください");
      return;
    }

    clearError();

    try {
      // 注文項目を作成
      const orderItems: OrderItem[] = Object.entries(selectedTickets)
        .filter(([, count]) => (count as number) > 0)
        .map(([ticketId, count]) => {
          const ticket = tickets.find((t) => t.id === ticketId);
          return {
            ticketId,
            ticketName: ticket?.name || "チケット",
            price: ticket?.price || 0,
            quantity: count as number,
          };
        });

      if (orderItems.length === 0) {
        alert("チケットを選択してください");
        return;
      }

      const totalAmount = getTotalPrice() + Math.floor(getTotalPrice() * 0.05);

      // PaymentIntentを作成
      const result = await createPaymentIntent({
        amount: totalAmount,
        paymentMethod: selectedPaymentMethod,
        orderItems,
        customerInfo: formData,
        eventId,
      });

      if (result.success) {
        if (selectedPaymentMethod === "paypay" && result.redirectUrl) {
          // PayPay決済の場合はリダイレクト
          window.location.href = result.redirectUrl;
        } else if (selectedPaymentMethod === "convenience") {
          // コンビニ決済の場合は完了ページへ
          router.push(`/purchase-complete?payment_intent=${result.paymentIntentId}&order_id=${result.orderId}&payment_method=convenience`);
        } else {
          // クレジットカード決済の場合は決済確認
          const confirmResult = await confirmPayment(result.paymentIntentId!);
          if (confirmResult.success) {
            router.push(`/purchase-complete?payment_intent=${result.paymentIntentId}&order_id=${confirmResult.orderId}&payment_method=credit`);
          }
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("決済処理中にエラーが発生しました");
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            イベント情報が見つかりません
          </h1>
          <Link href="/events" className="text-blue-600 hover:text-blue-700">
            イベント一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/events" className="text-blue-600 hover:text-blue-700">
              イベント一覧
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <Link
              href={`/events/${eventId}`}
              className="text-blue-600 hover:text-blue-700"
            >
              {event.title}
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-gray-600">チケット購入</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">チケット購入</h1>
        </div>

        {/* エラー表示 */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <i className="ri-error-warning-line text-red-600 mr-3 mt-1"></i>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">エラーが発生しました</p>
                <p>{paymentError.message}</p>
                {paymentError.code && (
                  <p className="text-xs mt-1 text-red-600">エラーコード: {paymentError.code}</p>
                )}
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
        )}

        {/* プログレスバー */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: "購入者情報", icon: "ri-user-line" },
              { step: 2, title: "決済方法", icon: "ri-bank-card-line" },
              { step: 3, title: "確認", icon: "ri-check-line" },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= item.step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <i className={item.icon}></i>
                </div>
                <span
                  className={`ml-3 font-medium ${
                    step >= item.step ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.title}
                </span>
                {index < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      step > item.step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  購入者情報
                </h2>

                {!isLoggedIn && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          ログインして簡単購入
                        </h3>
                        <p className="text-sm text-blue-700">
                          アカウントをお持ちの方はログインすると情報入力が簡単になります
                        </p>
                      </div>
                      <button
                        onClick={() => setIsLoggedIn(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer"
                      >
                        ログイン
                      </button>
                    </div>
                  </div>
                )}

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お名前（姓）*
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="田中"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お名前（名）*
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="太郎"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス*
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話番号*
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                    >
                      次へ進む
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  決済方法選択
                </h2>

                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id as PaymentMethod)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                            selectedPaymentMethod === method.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPaymentMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <i className={`${method.icon} text-xl mr-3`}></i>
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPaymentMethod === "credit" && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900">
                      クレジットカード情報
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カード番号*
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          handleInputChange("cardNumber", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          有効期限*
                        </label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          セキュリティコード*
                        </label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カード名義*
                      </label>
                      <input
                        type="text"
                        value={formData.cardName}
                        onChange={(e) =>
                          handleInputChange("cardName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="TARO TANAKA"
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                  >
                    次へ進む
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  注文確認
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      購入者情報
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>
                        <strong>お名前:</strong> {formData.lastName}{" "}
                        {formData.firstName}
                      </p>
                      <p>
                        <strong>メールアドレス:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>電話番号:</strong> {formData.phone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      決済方法
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>
                        {
                          paymentMethods.find(
                            (m) => m.id === selectedPaymentMethod
                          )?.name
                        }
                      </p>
                      {selectedPaymentMethod === "credit" && (
                        <p className="text-sm text-gray-600 mt-1">
                          **** **** **** {formData.cardNumber.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <i className="ri-information-line text-blue-600 mr-3 mt-1"></i>
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">ご注意事項</p>
                        <ul className="space-y-1">
                          <li>• 購入後のキャンセル・返金は承っておりません</li>
                          <li>• チケットは当日QRコードでの入場となります</li>
                          <li>• 転売は禁止されています</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <input type="checkbox" id="agree" className="mr-3" />
                    <label htmlFor="agree" className="text-sm text-gray-700">
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        利用規約
                      </Link>
                      および
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        プライバシーポリシー
                      </Link>
                      に同意します
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                    >
                      戻る
                    </button>
                    <button
                      onClick={handlePurchase}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                    >
                      {isProcessing ? "処理中..." : "購入を確定する"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 注文サマリー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">注文内容</h3>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {event.title}
                </h4>
                <p className="text-sm text-gray-600">{event.date}</p>
                <p className="text-sm text-gray-600">{event.venue}</p>
              </div>

              <div className="space-y-3 mb-6">
                {Object.entries(selectedTickets).map(([ticketId, count]) => {
                  if ((count as number) === 0) return null;
                  const ticket = tickets.find((t) => t.id === ticketId);
                  if (!ticket) return null;

                  return (
                    <div
                      key={ticketId}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {ticket.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ¥{ticket.price.toLocaleString()} × {count as number}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ¥{(ticket.price * (count as number)).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600">小計</p>
                  <p className="font-semibold">
                    ¥{getTotalPrice().toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600">システム手数料</p>
                  <p className="font-semibold">
                    ¥{Math.floor(getTotalPrice() * 0.05).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-blue-600 pt-2 border-t">
                  <p>合計</p>
                  <p>
                    ¥
                    {(
                      getTotalPrice() + Math.floor(getTotalPrice() * 0.05)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
