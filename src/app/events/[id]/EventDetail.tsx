"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useEvent } from "@/hooks";
import { LoadingScreen, ErrorScreen } from "@/components";

interface EventDetailProps {
  eventId: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
  const { event, loading, error } = useEvent(eventId);
  const [selectedTickets, setSelectedTickets] = useState<{
    [key: string]: number;
  }>({});

  // ローディング中
  if (loading) {
    return <LoadingScreen />;
  }

  // エラーまたはイベントが見つからない
  if (error || !event) {
    return <ErrorScreen message={error || "イベントが見つかりません"} />;
  }

  const tickets = event.ticket_types || [];

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
            src={event.image_url || "/img/event.jpg"}
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
                {event.description || ""}
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
                  {event.description || ""}
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
                        <p className="text-gray-600">
                          {new Date(event.date_start).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                        <p className="text-gray-600">
                          〜 {new Date(event.date_end).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <i className="ri-map-pin-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">会場</h3>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <i className="ri-ticket-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">チケット種類</h3>
                        <p className="text-gray-600">{tickets.length}種類</p>
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
                  {tickets.map((ticket) => {
                    // 在庫計算
                    const stock = ticket.quantity_total - ticket.quantity_sold;
                    const isAvailable = stock > 0 && ticket.is_active;

                    return (
                      <div
                        key={ticket.id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {ticket.name}
                              </h3>
                              {!isAvailable && (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                                  売り切れ
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">
                              {ticket.description || ""}
                            </p>
                            <div className="text-sm text-gray-500">
                              残り {stock} 枚
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <p className="text-2xl font-bold text-blue-600 mb-4">
                              ¥{Number(ticket.price).toLocaleString()}
                            </p>
                            {isAvailable && (
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
                                  disabled={(selectedTickets[ticket.id] || 0) >= stock}
                                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <i className="ri-add-line"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
