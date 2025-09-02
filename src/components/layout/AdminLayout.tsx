'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  actions?: React.ReactNode;
  isPremiumUser?: boolean;
  username?: string;
}

export default function AdminLayout({
  children,
  title,
  backHref,
  actions,
  isPremiumUser = false,
  username = '管理者'
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {backHref && (
                <Link 
                  href={backHref}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-arrow-left-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
                </Link>
              )}
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{username}</span>
              {!isPremiumUser ? (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  無料プラン
                </Badge>
              ) : (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  プレミアム
                </Badge>
              )}
              
              {actions ? (
                actions
              ) : (
                <Button asChild size="sm">
                  <Link href="/">
                    サイトを見る
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}