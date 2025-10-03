"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import QRCodeModal from "../../components/ticket/QRCodeModal";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import { useUserTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";

interface TicketWithDetails {
  id: string;
  qr_code: string;
  status: string;
  event?: {
    id: string;
    title: string;
    date_start: string;
    time_start: string | null;
    venue: string | null;
    image_url: string | null;
  };
  ticket_type?: {
    id: string;
    name: string;
    price: number;
  };
  created_at: string;
}

export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 認証情報を取得
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || null;

  const { tickets, loading, error } = useUserTickets(userId);

  const now = new Date();

  // チケットをフィルタリング
  const upcomingTickets = tickets.filter(ticket => {
    if (!ticket.event) return false;
    const eventDate = new Date(ticket.event.date_start);
    return ticket.status === 'valid' && eventDate > now;
  });

  const pastTickets = tickets.filter(ticket => {
    if (!ticket.event) return false;
    const eventDate = new Date(ticket.event.date_start);
    return ticket.status === 'used' || eventDate <= now;
  });

  const currentTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  const handleDownloadTicket = async () => {
    // PDF生成はPhase 3で実装
    alert('PDFダウンロード機能はPhase 3で実装予定です');
  };

  const handleShowQR = (ticket: TicketWithDetails) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  if (authLoading || loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  // 認証チェック
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <ErrorScreen message="ログインが必要です。ログインしてチケットを確認してください。" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              マイチケット
            </h1>
            <p className="text-gray-600">
              購入済みのチケットを確認できます
            </p>
          </div>

          {/* タブ */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-8 py-4 font-semibold text-sm transition-colors whitespace-nowrap ${
                    activeTab === "upcoming"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  予定のイベント ({upcomingTickets.length})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-8 py-4 font-semibold text-sm transition-colors whitespace-nowrap ${
                    activeTab === "past"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  過去のイベント ({pastTickets.length})
                </button>
              </nav>
            </div>
          </div>

          {/* チケット一覧 */}
          {currentTickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-ticket-line text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === "upcoming"
                  ? "予定のチケットがありません"
                  : "過去のチケットがありません"}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === "upcoming"
                  ? "イベントを探してチケットを購入しましょう"
                  : "まだイベントに参加していません"}
              </p>
              {activeTab === "upcoming" && (
                <Link
                  href="/events"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  イベントを探す
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {ticket.event?.image_url && (
                    <div className="relative h-48">
                      <Image
                        src={ticket.event.image_url}
                        alt={ticket.event.title}
                        width={600}
                        height={192}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "used"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {ticket.status === "used" ? "使用済み" : "有効"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {ticket.event?.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <i className="ri-calendar-line mr-2 w-4"></i>
                          <span>
                            {ticket.event ? `${new Date(ticket.event.date_start).toLocaleDateString("ja-JP")} ${ticket.event.time_start || ''}` : ''}
                          </span>
                        </div>

                        {ticket.event?.venue && (
                          <div className="flex items-center">
                            <i className="ri-map-pin-line mr-2 w-4"></i>
                            <span>{ticket.event.venue}</span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <i className="ri-ticket-2-line mr-2 w-4"></i>
                          <span>{ticket.ticket_type?.name}</span>
                        </div>

                        <div className="flex items-center">
                          <i className="ri-price-tag-3-line mr-2 w-4"></i>
                          <span>¥{ticket.ticket_type?.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {ticket.status === "valid" && (
                        <button
                          onClick={() => handleShowQR(ticket)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-qr-code-line mr-1.5"></i>
                          QRコード表示
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadTicket()}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-download-line mr-1.5"></i>
                        PDFダウンロード
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* サポート情報 */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <i className="ri-information-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  チケットについて
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• イベント当日は、QRコードを会場でご提示ください</li>
                  <li>• チケットの転売・譲渡はご遠慮ください</li>
                  <li>• ご不明な点がございましたら、サポートまでお問い合わせください</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* QRコードモーダル */}
      {isQRModalOpen && selectedTicket && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={handleCloseQRModal}
          ticketId={selectedTicket.id}
          qrCode={selectedTicket.qr_code}
          eventTitle={selectedTicket.event?.title || ''}
          eventDate={selectedTicket.event ? new Date(selectedTicket.event.date_start).toLocaleDateString("ja-JP") : ''}
          ticketType={selectedTicket.ticket_type?.name || ''}
        />
      )}
    </div>
  );
}
