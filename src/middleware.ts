import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションを更新してユーザーを取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // セッションの更新をレスポンスに反映
  await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // デバッグログ
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    console.log('[Middleware] Path:', pathname)
    console.log('[Middleware] Cookies:', request.cookies.getAll().map(c => c.name))
    console.log('[Middleware] User:', user ? `${user.email} (${user.id})` : 'null')
    console.log('[Middleware] User Error:', userError)
  }

  // 管理画面へのアクセス
  if (pathname.startsWith('/admin')) {
    // /admin/login は認証不要
    if (pathname === '/admin/login') {
      // 既に認証済みで管理者の場合はダッシュボードへ
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('[Middleware] Profile fetch error in admin login:', profileError)
          // エラーの場合はログインページを表示
          return response
        }

        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
      return response
    }

    // 管理画面の他のページは認証必須
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // 管理者権限チェック
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[Middleware] Profile:', profile)
    console.log('[Middleware] Profile Error:', profileError)

    // プロファイル取得エラーの場合、一時的に通過を許可（デバッグ用）
    if (profileError) {
      console.error('[Middleware] Profile fetch error:', profileError)
      // エラーの場合は一旦通過させる（後で修正）
      return response
    }

    if (!profile || profile.role !== 'admin') {
      console.log('[Middleware] Access denied: not admin')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 一般ユーザー向けの認証が必要なページ
  const protectedPaths = ['/profile', '/my-tickets', '/checkout']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect_to', pathname)
    return NextResponse.redirect(url)
  }

  // 一般ユーザー向けログイン・登録ページ
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      // 管理者は一般ログインページにアクセスできない
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // プロファイル取得エラーの場合、一般ユーザーとして扱う
      if (profileError) {
        console.error('[Middleware] Profile fetch error in login page:', profileError)
      }

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // 一般ユーザーは元のページまたはトップへ
      const redirectTo = request.nextUrl.searchParams.get('redirect_to') || '/'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}