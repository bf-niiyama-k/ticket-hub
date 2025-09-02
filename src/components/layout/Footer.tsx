'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-['Pacifico'] text-2xl text-blue-400 mb-4">TicketHub</h3>
            <p className="text-gray-300 mb-4">
              イベント・ホテル・展示会向けのチケット予約システム。<br />
              簡単操作で確実なチケット管理を実現します。
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <i className="ri-facebook-fill text-white"></i>
              </div>
              <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-500">
                <i className="ri-twitter-fill text-white"></i>
              </div>
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-pink-700">
                <i className="ri-instagram-fill text-white"></i>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">サービス</h4>
            <ul className="space-y-2">
              <li><Link href="/events" className="text-gray-300 hover:text-white">イベント一覧</Link></li>
              <li><Link href="/venues" className="text-gray-300 hover:text-white">会場情報</Link></li>
              <li><Link href="/pricing" className="text-gray-300 hover:text-white">料金プラン</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">サポート</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-300 hover:text-white">ヘルプ</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">お問い合わせ</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white">利用規約</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white">プライバシーポリシー</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2024 TicketHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}