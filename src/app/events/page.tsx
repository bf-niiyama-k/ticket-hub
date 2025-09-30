"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useEvents } from "@/hooks";

export default function EventsPage() {
  const { events, loading, error } = useEvents(true); // 公開イベントのみ取得
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = [
    { id: "all", name: "すべて" },
    { id: "exhibition", name: "展示会" },
    { id: "seminar", name: "セミナー" },
    { id: "dinner", name: "ディナー" },
    { id: "conference", name: "カンファレンス" },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "all"; // カテゴリはDBにないため一旦すべて表示

      let matchesDateRange = true;
      if (startDate || endDate) {
        const eventDate = new Date(event.date_start);
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          matchesDateRange = eventDate >= start && eventDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          matchesDateRange = eventDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          matchesDateRange = eventDate <= end;
        }
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    });
  }, [events, searchTerm, selectedCategory, startDate, endDate]);

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              イベント一覧
            </h1>
            <p className="text-xl text-gray-600">
              お好みのイベントを見つけてチケットを予約しましょう
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  検索
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="イベント名で検索..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-calendar-line text-gray-400"></i>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-calendar-line text-gray-400"></i>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">期間指定:</span>
                {startDate && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {startDate}以降
                  </span>
                )}
                {endDate && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {endDate}以前
                  </span>
                )}
                <button
                  onClick={clearDateRange}
                  className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                >
                  <i className="ri-close-line mr-1"></i>
                  期間をクリア
                </button>
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {filteredEvents.length}件のイベントが見つかりました
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">並び順:</span>
              <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8">
                <option>開催日順</option>
                <option>価格安い順</option>
                <option>価格高い順</option>
                <option>人気順</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                // 最安値チケットを計算
                const minPrice = event.ticket_types && event.ticket_types.length > 0
                  ? Math.min(...event.ticket_types.map(t => Number(t.price)))
                  : 0;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <Image
                        src={event.image_url || "/img/event.jpg"}
                        alt={event.title}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover object-top"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        販売中
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {event.description || ""}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <i className="ri-calendar-line mr-2"></i>
                          <span>
                            {new Date(event.date_start).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <i className="ri-map-pin-line mr-2"></i>
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          ¥{minPrice.toLocaleString()}〜
                        </span>
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer"
                        >
                          詳細を見る
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                イベントが見つかりませんでした
              </h3>
              <p className="text-gray-600">検索条件を変更してお試しください</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
