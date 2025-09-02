"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "太郎",
    lastName: "田中",
    email: "tanaka@example.com",
    phone: "090-1234-5678",
    birthDate: "1990-01-01",
    gender: "male",
    interests: ["exhibition", "conference", "dining"],
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profilePublic: false,
      emailVisible: false,
    },
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const interestOptions = [
    { id: "exhibition", name: "展示会・見本市", icon: "ri-building-line" },
    {
      id: "conference",
      name: "カンファレンス・セミナー",
      icon: "ri-presentation-line",
    },
    { id: "dining", name: "ディナーイベント", icon: "ri-restaurant-line" },
    {
      id: "entertainment",
      name: "エンターテインメント",
      icon: "ri-music-line",
    },
    { id: "sports", name: "スポーツイベント", icon: "ri-football-line" },
    { id: "art", name: "アート・文化", icon: "ri-palette-line" },
  ];

  const handleProfileUpdate = (field: string, value: string | string[] | object) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    alert("プロフィールを更新しました（シミュレーション）");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("パスワードを変更しました（シミュレーション）");
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const recentActivity = [
    {
      id: 1,
      type: "purchase",
      title: "東京国際展示会2024のチケットを購入",
      date: "2024年2月15日",
      icon: "ri-shopping-cart-line",
      color: "bg-green-100 text-green-600",
    },
    {
      id: 2,
      type: "login",
      title: "アカウントにログイン",
      date: "2024年2月14日",
      icon: "ri-login-box-line",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 3,
      type: "profile",
      title: "プロフィール情報を更新",
      date: "2024年2月10日",
      icon: "ri-user-settings-line",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              マイプロフィール
            </h1>
            <p className="text-xl text-gray-600">
              アカウント設定と個人情報の管理
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* サイドバー */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-user-line text-3xl text-blue-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profileData.lastName} {profileData.firstName}
                  </h3>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left whitespace-nowrap cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className="ri-user-line mr-3"></i>
                    基本情報
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left whitespace-nowrap cursor-pointer ${
                      activeTab === "security"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className="ri-shield-line mr-3"></i>
                    セキュリティ
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left whitespace-nowrap cursor-pointer ${
                      activeTab === "notifications"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className="ri-notification-line mr-3"></i>
                    通知設定
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left whitespace-nowrap cursor-pointer ${
                      activeTab === "activity"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className="ri-history-line mr-3"></i>
                    アクティビティ
                  </button>
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    href="/my-tickets"
                    className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-ticket-line mr-3"></i>
                    マイチケット
                  </Link>
                </div>
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* 基本情報 */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      基本情報
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-edit-line mr-2"></i>
                      {isEditing ? "編集完了" : "編集する"}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          お名前（姓）
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) =>
                              handleProfileUpdate("lastName", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg">
                            {profileData.lastName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          お名前（名）
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) =>
                              handleProfileUpdate("firstName", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg">
                            {profileData.firstName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            handleProfileUpdate("email", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg">
                          {profileData.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電話番号
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            handleProfileUpdate("phone", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg">
                          {profileData.phone}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          生年月日
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={profileData.birthDate}
                            onChange={(e) =>
                              handleProfileUpdate("birthDate", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg">
                            {profileData.birthDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          性別
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.gender}
                            onChange={(e) =>
                              handleProfileUpdate("gender", e.target.value)
                            }
                            className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">その他</option>
                            <option value="prefer-not-to-say">
                              回答しない
                            </option>
                          </select>
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg">
                            {profileData.gender === "male"
                              ? "男性"
                              : profileData.gender === "female"
                              ? "女性"
                              : profileData.gender === "other"
                              ? "その他"
                              : "回答しない"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        興味のあるイベント
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {interestOptions.map((interest) => (
                          <div
                            key={interest.id}
                            onClick={
                              isEditing
                                ? () => handleInterestToggle(interest.id)
                                : undefined
                            }
                            className={`border-2 rounded-lg p-4 text-center transition-colors ${
                              profileData.interests.includes(interest.id)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            } ${
                              isEditing
                                ? "cursor-pointer hover:border-gray-300"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                                profileData.interests.includes(interest.id)
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <i className={interest.icon}></i>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {interest.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                        >
                          保存する
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* セキュリティ */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      パスワード変更
                    </h2>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          現在のパスワード
                        </label>
                        <input
                          type="password"
                          value={securityData.currentPassword}
                          onChange={(e) =>
                            setSecurityData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="現在のパスワードを入力"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          新しいパスワード
                        </label>
                        <input
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) =>
                            setSecurityData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="新しいパスワードを入力"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          新しいパスワード確認
                        </label>
                        <input
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) =>
                            setSecurityData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="新しいパスワードを再入力"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                      >
                        パスワードを変更
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      2段階認証
                    </h2>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">SMS認証</h3>
                        <p className="text-sm text-gray-600">
                          ログイン時にSMSで認証コードを送信
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          alert("2段階認証を設定（シミュレーション）")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                      >
                        設定する
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 通知設定 */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    通知設定
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          メール通知
                        </h3>
                        <p className="text-sm text-gray-600">
                          イベント情報やお知らせをメールで受信
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notifications.email}
                          onChange={(e) =>
                            handleProfileUpdate("notifications", {
                              ...profileData.notifications,
                              email: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">SMS通知</h3>
                        <p className="text-sm text-gray-600">
                          緊急のお知らせをSMSで受信
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notifications.sms}
                          onChange={(e) =>
                            handleProfileUpdate("notifications", {
                              ...profileData.notifications,
                              sms: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          プッシュ通知
                        </h3>
                        <p className="text-sm text-gray-600">
                          ブラウザでプッシュ通知を受信
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notifications.push}
                          onChange={(e) =>
                            handleProfileUpdate("notifications", {
                              ...profileData.notifications,
                              push: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() =>
                        alert("通知設定を保存しました（シミュレーション）")
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                    >
                      設定を保存
                    </button>
                  </div>
                </div>
              )}

              {/* アクティビティ */}
              {activeTab === "activity" && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    最近のアクティビティ
                  </h2>

                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center p-4 border border-gray-200 rounded-lg"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${activity.color} mr-4`}
                        >
                          <i className={activity.icon}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <button
                      onClick={() =>
                        alert("全てのアクティビティを表示（シミュレーション）")
                      }
                      className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap cursor-pointer"
                    >
                      すべて表示
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
