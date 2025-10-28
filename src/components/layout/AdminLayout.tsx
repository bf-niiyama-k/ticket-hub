"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { MdArrowBack, MdLogout } from "react-icons/md";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  actions?: React.ReactNode;
  isPremiumUser?: boolean;
}

export default function AdminLayout({
  children,
  title,
  backHref,
  actions,
  isPremiumUser = false,
}: AdminLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // middlewareで認証チェック済みのため、ここでは何もチェックしない

  const displayUsername = profile?.full_name || user?.email || "管理者";
  const userIsPremium = profile?.role === "admin" || isPremiumUser;
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
                  <MdArrowBack className="text-gray-600 text-xl" />
                </Link>
              )}
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{displayUsername}</span>
              {!userIsPremium ? (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  無料プラン
                </Badge>
              ) : (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  プレミアム
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <MdLogout className="mr-2" />
                ログアウト
              </Button>

              {actions ? (
                actions
              ) : (
                <Button asChild size="sm">
                  <Link href="/">サイトを見る</Link>
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
