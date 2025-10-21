import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  // バリデーション
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: '現在のパスワードと新しいパスワードを入力してください' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: '新しいパスワードは8文字以上で入力してください' },
      { status: 400 }
    );
  }

  // Supabaseのパスワード更新
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json(
      { error: 'パスワードの変更に失敗しました' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'パスワードを変更しました' });
}
