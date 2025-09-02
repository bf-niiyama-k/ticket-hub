"use client";

import Link from "next/link";
import { Header, Footer, EventCard } from "@/components";
import type { EventCardData } from "@/components";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      icon: "ri-ticket-2-line",
      title: "簡単チケット予約",
      description: "わずか数クリックでイベントチケットを予約できます",
    },
    {
      icon: "ri-qr-code-line",
      title: "QRコード入場",
      description: "スマートフォンでQRコードを表示して入場",
    },
    {
      icon: "ri-shield-check-line",
      title: "安全な決済",
      description: "安全で確実な決済システムで安心してお支払い",
    },
    {
      icon: "ri-customer-service-2-line",
      title: "24時間サポート",
      description: "いつでもお客様をサポートいたします",
    },
  ];

  const upcomingEvents: EventCardData[] = [
    {
      id: 1,
      title: "東京国際展示会2024",
      date: "2024-03-15",
      venue: "東京ビッグサイト",
      price: 3500,
      image: "/img/event.jpg",
      status: "published",
      category: "展示会",
    },
    {
      id: 2,
      title: "ホテル春の特別ディナー",
      date: "2024-03-20",
      venue: "グランドホテル東京",
      price: 12000,
      image: "/img/event.jpg",
      status: "published",
      category: "グルメ",
    },
    {
      id: 3,
      title: "ビジネスセミナー2024",
      date: "2024-03-25",
      venue: "品川コンベンションセンター",
      price: 8000,
      image: "/img/event.jpg",
      status: "published",
      category: "セミナー",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <section
                    className="relative h-screen flex items-center justify-center text-white">
          <Image
            src="/img/fv.jpg"
            alt="ファーストビュー"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              お気に入りのイベントを
              <br />
              簡単予約
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              ホテル・展示会・特別イベントのチケットをオンラインで簡単予約
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
              >
                イベントを探す
              </Link>
              <Link
                href="/events"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                使い方を見る
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                TicketHubの特徴
              </h2>
              <p className="text-xl text-gray-600">
                簡単・安全・便利なチケット予約体験をお届けします
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${feature.icon} text-2xl text-blue-600`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                開催予定のイベント
              </h2>
              <p className="text-xl text-gray-600">
                今すぐ予約できる注目のイベント
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="default" />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/events"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                すべてのイベントを見る
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">まずは会員登録から</h2>
            <p className="text-xl mb-8 text-blue-100">
              無料の会員登録で、お気に入りのイベントをすぐに予約できます
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                無料で会員登録
              </Link>
              <Link
                href="/events"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                イベントを見る
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
