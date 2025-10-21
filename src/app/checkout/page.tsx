"use client";

import { useState, Suspense, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import { usePayment } from "../../hooks/usePayment";
import { useEvent } from "../../hooks/useEvents";
import { useAuth } from "../../hooks/useAuth";
import type { PaymentMethod, OrderItem } from "../../types/payment";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("credit");
  const [stockError, setStockError] = useState<string | null>(null);

  // 認証情報を取得
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();

  const eventId = searchParams.get("event");
  const ticketsParam = searchParams.get("tickets");
  const selectedTickets = useMemo(
    () => (ticketsParam ? JSON.parse(decodeURIComponent(ticketsParam)) : {}),
    [ticketsParam]
  );

  // イベント情報をDBから取得
  const {
    event,
    loading: eventLoading,
    error: eventError,
    refetch,
  } = useEvent(eventId || "");

  // 決済フックを使用
  const {
    isProcessing,
    error: paymentError,
    createPaymentIntent,
    clearError,
  } = usePayment();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  // ログイン状態の場合、プロファイル情報から自動入力
  useEffect(() => {
    if (isAuthenticated && profile) {
      const nameParts = profile.full_name?.split(" ") || [];
      setFormData({
        email: profile.email || "",
        lastName: nameParts[0] || "",
        firstName: nameParts[1] || "",
        phone: profile.phone || "",
      });
    }
  }, [isAuthenticated, profile]);

  const tickets = useMemo(
    () => event?.ticket_types || [],
    [event?.ticket_types]
  );

  // チケット在庫確認関数
  const validateTicketAvailability = useCallback(async () => {
    setStockError(null);

    for (const [ticketId, count] of Object.entries(selectedTickets)) {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) continue;

      const availableStock = ticket.quantity_total - ticket.quantity_sold;
      if (availableStock < (count as number)) {
        const errorMsg = `${ticket.name}の在庫が不足しています（残り${availableStock}枚）`;
        setStockError(errorMsg);
        return false;
      }
    }
    return true;
  }, [selectedTickets, tickets]);

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
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone
    ) {
      alert("すべての項目を入力してください");
      return;
    }

    // 在庫確認
    const isAvailable = await validateTicketAvailability();
    if (!isAvailable) {
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
        ...(user?.id && { userId: user.id }),
      });

      if (result.success) {
        if (selectedPaymentMethod === "paypay" && result.redirectUrl) {
          // PayPay決済の場合はリダイレクト
          window.location.href = result.redirectUrl;
        } else if (result.redirectUrl) {
          // Stripe Payment Linkの場合はStripeのホストページにリダイレクト
          window.location.href = result.redirectUrl;
        } else {
          // その他の場合（通常は発生しない）
          router.push(
            `/purchase-complete?order_id=${result.orderId}&payment_method=${selectedPaymentMethod}`
          );
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("決済処理中にエラーが発生しました");
    }
  };

  // ローディング表示
  if (eventLoading || authLoading) {
    return <LoadingScreen />;
  }

  // エラー表示
  if (eventError || !event) {
    return (
      <ErrorScreen
        message={eventError || "イベント情報が見つかりません"}
        onRetry={refetch}
      />
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
        {(paymentError || stockError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <i className="ri-error-warning-line text-red-600 mr-3 mt-1"></i>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">エラーが発生しました</p>
                <p>{stockError || paymentError?.message}</p>
                {paymentError?.code && (
                  <p className="text-xs mt-1 text-red-600">
                    エラーコード: {paymentError.code}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  clearError();
                  setStockError(null);
                }}
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

                {!isAuthenticated && (
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
                      <Link
                        href="/login"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer"
                      >
                        ログイン
                      </Link>
                    </div>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <i className="ri-checkbox-circle-line text-green-600 mr-3"></i>
                      <div>
                        <h3 className="font-semibold text-green-900">
                          ログイン済み
                        </h3>
                        <p className="text-sm text-green-700">
                          {profile?.email || user?.email} でログイン中
                        </p>
                      </div>
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
                      onClick={() =>
                        setSelectedPaymentMethod(method.id as PaymentMethod)
                      }
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <i className="ri-information-line text-blue-600 mr-3 mt-1"></i>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">決済について</p>
                      <p>
                        次のステップで「購入を確定する」をクリックすると、安全な決済ページに移動します。
                        {selectedPaymentMethod === "credit" &&
                          "カード情報はStripeの安全なページで入力いただきます。"}
                        {selectedPaymentMethod === "convenience" &&
                          "コンビニ決済用の支払い番号が発行されます。"}
                        {selectedPaymentMethod === "paypay" &&
                          "PayPayアプリで決済を完了してください。"}
                      </p>
                    </div>
                  </div>
                </div>

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
                      <div className="flex items-center">
                        <i
                          className={`${
                            paymentMethods.find(
                              (m) => m.id === selectedPaymentMethod
                            )?.icon
                          } text-xl mr-2`}
                        ></i>
                        <p>
                          {
                            paymentMethods.find(
                              (m) => m.id === selectedPaymentMethod
                            )?.name
                          }
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedPaymentMethod === "credit" &&
                          "Stripeの安全な決済ページでカード情報を入力します"}
                        {selectedPaymentMethod === "convenience" &&
                          "コンビニ決済用の支払い番号が発行されます"}
                        {selectedPaymentMethod === "paypay" &&
                          "PayPayアプリで決済を完了します"}
                      </p>
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
                <p className="text-sm text-gray-600">
                  {new Date(event.date_start).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600">{event.location}</p>
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
