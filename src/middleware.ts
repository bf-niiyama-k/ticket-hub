import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッション情報を取得してユーザーを更新
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 管理者専用ページの保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // 未認証の場合はログインページにリダイレクト
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // ユーザーの役割を確認（profilesテーブルから取得）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'staff'].includes(profile.role)) {
      // 管理者権限がない場合はホームページにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 認証が必要なページの保護
  const protectedPaths = ['/profile', '/my-tickets', '/checkout']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect_to', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーがログイン・登録ページにアクセスした場合の処理
  const authPages = ['/login', '/register']
  if (user && authPages.includes(request.nextUrl.pathname)) {
    const redirectTo = request.nextUrl.searchParams.get('redirect_to') || '/'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 以下のパスを除いて全てのリクエストにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコンファイル)
     * - /api/ (APIルート - 別途処理)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}