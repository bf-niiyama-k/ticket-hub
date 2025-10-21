import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'プロフィールの取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const body = await request.json();

  // バリデーション
  type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
  const updateData: ProfileUpdate = {};

  // full_name
  if ('full_name' in body) {
    updateData.full_name = body.full_name as string | null;
  }

  // phone
  if ('phone' in body) {
    const phone = body.phone as string | null;
    if (phone && typeof phone === 'string') {
      const phoneRegex = /^[\d-]+$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { error: '電話番号の形式が正しくありません' },
          { status: 400 }
        );
      }
    }
    updateData.phone = phone;
  }

  // birth_date
  if ('birth_date' in body) {
    const birthDate = body.birth_date as string | null;
    if (birthDate && typeof birthDate === 'string') {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: '生年月日の形式が正しくありません' },
          { status: 400 }
        );
      }
    }
    updateData.birth_date = birthDate;
  }

  // gender
  if ('gender' in body) {
    updateData.gender = body.gender as "male" | "female" | "other" | "prefer-not-to-say" | null;
  }

  // interests
  if ('interests' in body) {
    updateData.interests = body.interests as string[];
  }

  // notification_email
  if ('notification_email' in body) {
    updateData.notification_email = body.notification_email as boolean;
  }

  // notification_sms
  if ('notification_sms' in body) {
    updateData.notification_sms = body.notification_sms as boolean;
  }

  // notification_push
  if ('notification_push' in body) {
    updateData.notification_push = body.notification_push as boolean;
  }

  // avatar_url
  if ('avatar_url' in body) {
    updateData.avatar_url = body.avatar_url as string | null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase as any)
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }

  return NextResponse.json(profile);
}
