
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-['Pacifico'] text-2xl text-blue-600">
              TicketHub
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                ホーム
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-blue-600 font-medium">
                イベント一覧
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-['Pacifico'] text-2xl text-blue-600">
            TicketHub
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              ホーム
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600 font-medium">
              イベント一覧
            </Link>
            {user && (
              <Link href="/my-tickets" className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap">
                マイチケット
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap cursor-pointer"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer"
                >
                  新規登録
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-line text-blue-600"></i>
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {profile?.full_name || user.email?.split('@')[0] || 'ユーザー'}
                  </span>
                  <i className="ri-arrow-down-s-line"></i>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <Link href="/my-tickets" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      <i className="ri-ticket-line mr-2"></i>
                      マイチケット
                    </Link>
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      <i className="ri-user-settings-line mr-2"></i>
                      プロフィール
                    </Link>
                    {profile?.role === 'admin' && (
                      <>
                        <hr className="my-2" />
                        <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <i className="ri-settings-line mr-2"></i>
                          管理画面
                        </Link>
                      </>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-logout-line mr-2"></i>
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
