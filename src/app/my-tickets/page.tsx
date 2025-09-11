"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import QRCodeModal from "../../components/ticket/QRCodeModal";
import { Ticket } from "../../types/ticket";
import { generateTicketPDF } from "../../lib/pdf-generator";

export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const tickets = {
    upcoming: [
      {
        id: "ticket-001",
        eventId: "event-001",
        userId: "user-001",
        eventTitle: "東京国際展示会2024",
        eventDate: "2024-03-15",
        eventTime: "10:00 - 18:00",
        venue: "東京ビッグサイト",
        ticketType: "一般入場券",
        price: 3000,
        quantity: 2,
        orderNumber: "ORDER-12345678",
        purchaseDate: "2024-02-01",
        status: "active" as const,
        customerName: "田中太郎",
        customerEmail: "tanaka@example.com",
        image: "/img/event.jpg",
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
      },
      {
        id: "ticket-002",
        eventId: "event-002",
        userId: "user-001",
        eventTitle: "ホテル春の特別ディナー",
        eventDate: "2024-03-20",
        eventTime: "19:00 - 22:00",
        venue: "グランドホテル東京",
        ticketType: "ワインペアリングコース",
        price: 12000,
        quantity: 1,
        orderNumber: "ORDER-12345679",
        purchaseDate: "2024-02-05",
        status: "active" as const,
        customerName: "田中太郎",
        customerEmail: "tanaka@example.com",
        image: "/img/event.jpg",
        createdAt: "2024-02-05T10:00:00Z",
        updatedAt: "2024-02-05T10:00:00Z",
      },
    ],
    past: [
      {
        id: "ticket-003",
        eventId: "event-003",
        userId: "user-001",
        eventTitle: "冬のアートフェスティバル2024",
        eventDate: "2024-01-15",
        eventTime: "11:00 - 19:00",
        venue: "六本木アートセンター",
        ticketType: "一般入場券",
        price: 2500,
        quantity: 1,
        orderNumber: "ORDER-12345677",
        purchaseDate: "2024-01-01",
        status: "used" as const,
        customerName: "田中太郎",
        customerEmail: "tanaka@example.com",
        image: "/img/event.jpg",
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-15T11:00:00Z",
      },
    ],
  };

  const currentTickets = tickets[activeTab as keyof typeof tickets];

  const handleDownloadTicket = async (ticket: Ticket) => {
    try {
      await generateTicketPDF(ticket);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDFの生成に失敗しました。しばらく時間をおいて再度お試しください。');
    }
  };

  const handleShowQR = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              マイチケット
            </h1>
            <p className="text-xl text-gray-600">
              購入済みチケットの管理と確認ができます
            </p>
          </div>

          {/* タブ切り替え */}
          <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="ri-calendar-event-line mr-2"></i>
                利用予定 ({tickets.upcoming.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === "past"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="ri-history-line mr-2"></i>
                利用済み ({tickets.past.length})
              </button>
            </div>
          </div>

          {/* チケット一覧 */}
          {currentTickets.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {currentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Image
                        src={ticket.image}
                        alt={ticket.eventTitle}
                        width={400}
                        height={192}
                        className="w-full h-48 md:h-full object-cover object-top"
                        unoptimized={true}
                      />
                    </div>

                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                ticket.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {ticket.status === "active" ? "利用可能" : 
                               ticket.status === "used" ? "使用済み" : "期限切れ"}
                            </span>
                            <span className="text-sm text-gray-500">
                              注文番号: {ticket.orderNumber}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {ticket.eventTitle}
                          </h3>
                          <p className="text-lg text-blue-600 font-semibold mb-3">
                            {ticket.ticketType} × {ticket.quantity}枚
                          </p>
                        </div>

                        {ticket.status === "active" && (
                          <div className="text-right">
                            <div 
                              className="w-20 h-20 border rounded-lg mb-2 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => handleShowQR(ticket)}
                            >
                              <i className="ri-qr-code-line text-2xl text-gray-600"></i>
                            </div>
                            <p className="text-xs text-gray-500">
                              入場用QRコード
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <i className="ri-calendar-line mr-2"></i>
                            <span>
                              {ticket.eventDate} {ticket.eventTime}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <i className="ri-map-pin-line mr-2"></i>
                            <span>{ticket.venue}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <i className="ri-shopping-cart-line mr-2"></i>
                            <span>購入日: {ticket.purchaseDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {ticket.status === "active" && (
                          <>
                            <button
                              onClick={() => handleShowQR(ticket)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                            >
                              <i className="ri-qr-code-line mr-2"></i>
                              QRコード表示
                            </button>
                            <button
                              onClick={() => handleDownloadTicket(ticket)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                            >
                              <i className="ri-download-line mr-2"></i>
                              PDFダウンロード
                            </button>
                            <button
                              onClick={() =>
                                alert("カレンダーに追加（シミュレーション）")
                              }
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                            >
                              <i className="ri-calendar-line mr-2"></i>
                              カレンダー追加
                            </button>
                          </>
                        )}

                        <Link
                          href={`/events/${ticket.eventId}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-information-line mr-2"></i>
                          イベント詳細
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-ticket-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {activeTab === "upcoming"
                  ? "利用予定のチケットはありません"
                  : "利用済みのチケットはありません"}
              </h3>
              <p className="text-gray-600 mb-8">
                {activeTab === "upcoming"
                  ? "新しいイベントのチケットを購入してみましょう"
                  : "過去に利用したチケットがここに表示されます"}
              </p>
              {activeTab === "upcoming" && (
                <Link
                  href="/events"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer inline-block"
                >
                  イベントを探す
                </Link>
              )}
            </div>
          )}

          {/* 注意事項 */}
          {activeTab === "upcoming" && currentTickets.length > 0 && (
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                <i className="ri-information-line mr-2"></i>
                チケット利用時の注意事項
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• 入場時にはQRコードの提示が必要です</li>
                <li>• 身分証明書もご持参ください</li>
                <li>• チケットの転売・譲渡は禁止されています</li>
                <li>• QRコードのスクリーンショットでも入場可能です</li>
                <li>• 会場により入場開始時間が異なる場合があります</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {/* QRコードモーダル */}
      {selectedTicket && (
        <QRCodeModal
          ticket={selectedTicket}
          isOpen={isQRModalOpen}
          onClose={handleCloseQRModal}
        />
      )}
    </div>
  );
}
