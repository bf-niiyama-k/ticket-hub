"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // メール送信のシミュレーション
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      alert("確認コードを送信しました（シミュレーション）");
    }, 2000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // コード確認のシミュレーション
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // パスワードリセットのシミュレーション
    setTimeout(() => {
      setIsLoading(false);
      alert("パスワードをリセットしました（シミュレーション）");
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-12">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-lock-line text-2xl text-red-600"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                パスワードを忘れた方
              </h1>
              <p className="text-gray-600">
                {step === 1 && "メールアドレスを入力してください"}
                {step === 2 && "メールに送信された確認コードを入力してください"}
                {step === 3 && "新しいパスワードを設定してください"}
              </p>
            </div>

            {/* プログレスバー */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {/* ステップ1: メールアドレス入力 */}
            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="登録時のメールアドレスを入力"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    登録されているメールアドレスに確認コードをお送りします
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      送信中...
                    </>
                  ) : (
                    "確認コードを送信"
                  )}
                </button>
              </form>
            )}

            {/* ステップ2: 確認コード入力 */}
            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認コード
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    {email} に送信された6桁のコードを入力してください
                  </p>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      alert("確認コードを再送信しました（シミュレーション）")
                    }
                    className="text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap cursor-pointer"
                  >
                    確認コードが届かない場合は再送信
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        確認中...
                      </>
                    ) : (
                      "コードを確認"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                  >
                    戻る
                  </button>
                </div>
              </form>
            )}

            {/* ステップ3: 新しいパスワード設定 */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8文字以上で入力"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      <i
                        className={
                          showPassword ? "ri-eye-off-line" : "ri-eye-line"
                        }
                      ></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード確認
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="新しいパスワードを再入力"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      パスワードが一致しません
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    パスワードの要件
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center">
                      <i
                        className={`mr-2 ${
                          newPassword.length >= 8
                            ? "ri-check-line text-green-500"
                            : "ri-close-line text-red-500"
                        }`}
                      ></i>
                      8文字以上
                    </li>
                    <li className="flex items-center">
                      <i
                        className={`mr-2 ${
                          /[A-Za-z]/.test(newPassword)
                            ? "ri-check-line text-green-500"
                            : "ri-close-line text-red-500"
                        }`}
                      ></i>
                      英字を含む
                    </li>
                    <li className="flex items-center">
                      <i
                        className={`mr-2 ${
                          /[0-9]/.test(newPassword)
                            ? "ri-check-line text-green-500"
                            : "ri-close-line text-red-500"
                        }`}
                      ></i>
                      数字を含む
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || newPassword !== confirmPassword}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      更新中...
                    </>
                  ) : (
                    "パスワードを更新"
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-700">
                ログイン画面に戻る
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
