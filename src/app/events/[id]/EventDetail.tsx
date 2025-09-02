"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

interface EventDetailProps {
  eventId: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
  const [selectedTickets, setSelectedTickets] = useState<{
    [key: string]: number;
  }>({});

  const events = {
    "1": {
      id: 1,
      title: "東京国際展示会2024",
      description:
        "最新テクノロジーが集結する国際展示会。AI、IoT、ロボティクスなど最先端技術を体験できます。世界各国から集まった企業が最新の製品・サービスを展示し、ビジネスマッチングの機会も豊富です。",
      fullDescription:
        "この展示会では、次世代のテクノロジーを直接体験することができます。各企業のブースでは実際に製品を手に取って確認でき、専門スタッフからの詳しい説明も受けられます。また、併設されるセミナーでは業界の最新動向について学ぶことができます。",
      date: "2024年3月15日",
      time: "10:00 - 18:00",
      venue: "東京ビッグサイト",
      venueAddress: "東京都江東区有明3-11-1",
      category: "exhibition",
      status: "販売中",
      image:
        "/img/event.jpg",
      organizer: "日本テクノロジー協会",
      contact: "info@techexpo2024.jp",
    },
    "2": {
      id: 2,
      title: "ホテル春の特別ディナー",
      description:
        "有名シェフによる季節限定の特別コースディナー。厳選された食材を使用した絶品料理をお楽しみください。",
      fullDescription:
        "春の食材を贅沢に使用した特別コースディナーをご提供いたします。ミシュラン星付きレストランで経験を積んだシェフが、季節の味覚を最大限に活かした料理をお作りします。ワインペアリングもご用意しており、料理との絶妙なマリアージュをお楽しみいただけます。",
      date: "2024年3月20日",
      time: "19:00 - 22:00",
      venue: "グランドホテル東京",
      venueAddress: "東京都千代田区丸の内1-1-1",
      category: "dinner",
      status: "販売中",
      image:
        "/img/event.jpg",
      organizer: "グランドホテル東京",
      contact: "dining@grandhotel-tokyo.com",
    },
  };

  const ticketTypes = {
    "1": [
      {
        id: "general",
        name: "一般入場券",
        price: 3500,
        description: "展示会への入場券。すべての展示ブースをご覧いただけます。",
        benefits: [
          "全展示ブース見学可能",
          "パンフレット配布",
          "無料WiFi利用可能",
        ],
      },
      {
        id: "vip",
        name: "VIPパス",
        price: 8500,
        description: "VIP専用エリアへのアクセスと特別セミナー参加権付き。",
        benefits: [
          "VIP専用エリアアクセス",
          "特別セミナー参加可能",
          "専用休憩スペース利用可能",
          "ドリンク・軽食無料",
        ],
      },
      {
        id: "business",
        name: "ビジネスパス",
        price: 12000,
        description: "ビジネスマッチング会への参加権とネットワーキング機会。",
        benefits: [
          "ビジネスマッチング会参加",
          "VIP専用エリアアクセス",
          "名刺交換会参加",
          "懇親会参加",
        ],
      },
    ],
    "2": [
      {
        id: "dinner",
        name: "特別ディナーコース",
        price: 12000,
        description: "シェフ特製の春の特別コースディナー（7品）",
        benefits: ["7品の特別コース", "ウェルカムドリンク", "記念品プレゼント"],
      },
      {
        id: "wine",
        name: "ワインペアリングコース",
        price: 18000,
        description: "料理に合わせたワインペアリング付きコース",
        benefits: [
          "7品の特別コース",
          "5種類のワインペアリング",
          "ソムリエによる解説",
        ],
      },
      {
        id: "premium",
        name: "プレミアムコース",
        price: 25000,
        description: "個室でのプライベートディナー（2名様まで）",
        benefits: [
          "個室利用",
          "特別食材使用",
          "シェフによる料理説明",
          "記念写真撮影",
        ],
      },
    ],
  };

  const event = events[eventId as keyof typeof events];
  const tickets = ticketTypes[eventId as keyof typeof ticketTypes] || [];

  if (!event) {
    return <div>イベントが見つかりません</div>;
  }

  const updateTicketCount = (ticketId: string, count: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, count),
    }));
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce(
      (total, [ticketId, count]) => {
        const ticket = tickets.find((t) => t.id === ticketId);
        return total + (ticket ? ticket.price * count : 0);
      },
      0
    );
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce(
      (total, count) => total + count,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <div className="relative h-96 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover object-top"
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto px-6 pb-8 text-white w-full">
              <div className="flex items-center space-x-2 mb-4">
                <Link href="/events" className="text-blue-200 hover:text-white">
                  イベント一覧
                </Link>
                <i className="ri-arrow-right-s-line"></i>
                <span>{event.title}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {event.title}
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  イベント詳細
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {event.fullDescription}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <i className="ri-calendar-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          開催日時
                        </h3>
                        <p className="text-gray-600">{event.date}</p>
                        <p className="text-gray-600">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <i className="ri-map-pin-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">会場</h3>
                        <p className="text-gray-600">{event.venue}</p>
                        <p className="text-gray-500 text-sm">
                          {event.venueAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <i className="ri-user-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">主催者</h3>
                        <p className="text-gray-600">{event.organizer}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <i className="ri-mail-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          お問い合わせ
                        </h3>
                        <p className="text-gray-600">{event.contact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  チケット選択
                </h2>
                <div className="space-y-6">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {ticket.name}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {ticket.description}
                          </p>
                          <ul className="space-y-1">
                            {ticket.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-center text-sm text-gray-600"
                              >
                                <i className="ri-check-line text-green-500 mr-2"></i>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-blue-600 mb-4">
                            ¥{ticket.price.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                updateTicketCount(
                                  ticket.id,
                                  (selectedTickets[ticket.id] || 0) - 1
                                )
                              }
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                            >
                              <i className="ri-subtract-line"></i>
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {selectedTickets[ticket.id] || 0}
                            </span>
                            <button
                              onClick={() =>
                                updateTicketCount(
                                  ticket.id,
                                  (selectedTickets[ticket.id] || 0) + 1
                                )
                              }
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                            >
                              <i className="ri-add-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    注文内容
                  </h3>

                  {getTotalTickets() > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(selectedTickets).map(
                        ([ticketId, count]) => {
                          if (count === 0) return null;
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
                                  ¥{ticket.price.toLocaleString()} × {count}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                ¥{(ticket.price * count).toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-lg font-bold text-gray-900">
                            合計
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            ¥{getTotalPrice().toLocaleString()}
                          </p>
                        </div>

                        <Link
                          href={`/checkout?event=${eventId}&tickets=${encodeURIComponent(
                            JSON.stringify(selectedTickets)
                          )}`}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-center block whitespace-nowrap cursor-pointer"
                        >
                          チケットを購入する
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-ticket-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-500">
                        チケットを選択してください
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-6 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    <i className="ri-information-line mr-2"></i>
                    ご注意事項
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• チケットの転売は禁止されています</li>
                    <li>• 入場時にはQRコードの提示が必要です</li>
                    <li>• キャンセルポリシーをご確認ください</li>
                    <li>• 当日は身分証明書をお持ちください</li>
                  </ul>
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
