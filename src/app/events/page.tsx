"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function EventsPage() {
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

  const events = [
    {
      id: 1,
      title: "東京国際展示会2024",
      description:
        "最新テクノロジーが集結する国際展示会。AI、IoT、ロボティクスなど最先端技術を体験できます。",
      date: "2024年3月15日",
      dateValue: "2024-03-15",
      time: "10:00 - 18:00",
      venue: "東京ビッグサイト",
      category: "exhibition",
      price: 3500,
      status: "販売中",
      image:
        "https://readdy.ai/api/search-image?query=modern%20technology%20exhibition%20with%20innovative%20displays%2C%20professional%20atmosphere%2C%20bright%20lighting%2C%20tech%20booths%20and%20interactive%20demonstrations&width=400&height=250&seq=5&orientation=landscape",
    },
    {
      id: 2,
      title: "ホテル春の特別ディナー",
      description:
        "有名シェフによる季節限定の特別コースディナー。厳選された食材を使用した絶品料理をお楽しみください。",
      date: "2024年3月20日",
      dateValue: "2024-03-20",
      time: "19:00 - 22:00",
      venue: "グランドホテル東京",
      category: "dinner",
      price: 12000,
      status: "販売中",
      image:
        "https://readdy.ai/api/search-image?query=elegant%20hotel%20restaurant%20with%20fine%20dining%20setup%2C%20luxurious%20atmosphere%2C%20beautiful%20table%20settings%2C%20warm%20ambient%20lighting&width=400&height=250&seq=6&orientation=landscape",
    },
    {
      id: 3,
      title: "ビジネスセミナー2024",
      description:
        "業界のトップリーダーが語る最新ビジネストレンド。ネットワーキングの機会も豊富です。",
      date: "2024年3月25日",
      dateValue: "2024-03-25",
      time: "13:00 - 17:00",
      venue: "品川コンベンションセンター",
      category: "seminar",
      price: 8000,
      status: "販売中",
      image:
        "https://readdy.ai/api/search-image?query=professional%20business%20conference%20room%20with%20presentation%20stage%2C%20modern%20design%2C%20networking%20area%2C%20corporate%20atmosphere&width=400&height=250&seq=7&orientation=landscape",
    },
    {
      id: 4,
      title: "アートフェスティバル2024",
      description:
        "国内外のアーティストが集結するアートの祭典。絵画、彫刻、インスタレーションなど多彩な作品を展示。",
      date: "2024年4月1日",
      dateValue: "2024-04-01",
      time: "11:00 - 19:00",
      venue: "六本木アートセンター",
      category: "exhibition",
      price: 2500,
      status: "販売中",
      image:
        "https://readdy.ai/api/search-image?query=modern%20art%20gallery%20with%20contemporary%20artworks%2C%20white%20walls%2C%20professional%20lighting%2C%20visitors%20appreciating%20art%2C%20creative%20atmosphere&width=400&height=250&seq=8&orientation=landscape",
    },
    {
      id: 5,
      title: "ITカンファレンス2024",
      description:
        "最新のIT技術動向とソリューションを紹介する大規模カンファレンス。",
      date: "2024年4月10日",
      dateValue: "2024-04-10",
      time: "09:00 - 18:00",
      venue: "東京国際フォーラム",
      category: "conference",
      price: 15000,
      status: "残りわずか",
      image:
        "https://readdy.ai/api/search-image?query=large%20technology%20conference%20with%20multiple%20stages%2C%20attendees%20networking%2C%20modern%20venue%2C%20IT%20professionals%20presenting&width=400&height=250&seq=9&orientation=landscape",
    },
    {
      id: 6,
      title: "ワインテイスティング",
      description:
        "ソムリエが厳選した世界各国のワインをテイスティング。チーズとのペアリングも楽しめます。",
      date: "2024年4月15日",
      dateValue: "2024-04-15",
      time: "18:30 - 21:00",
      venue: "リッツカールトン東京",
      category: "dinner",
      price: 9500,
      status: "販売中",
      image:
        "https://readdy.ai/api/search-image?query=elegant%20wine%20tasting%20event%20with%20various%20wine%20bottles%2C%20cheese%20platters%2C%20sophisticated%20atmosphere%2C%20luxury%20hotel%20setting&width=400&height=250&seq=10&orientation=landscape",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;

    let matchesDateRange = true;
    if (startDate || endDate) {
      const eventDate = new Date(event.dateValue);
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover object-top"
                  />
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === "販売中"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {event.status}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <i className="ri-calendar-line mr-2"></i>
                      <span>
                        {event.date} {event.time}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <i className="ri-map-pin-line mr-2"></i>
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{event.price.toLocaleString()}〜
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
            ))}
          </div>

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
