-- プロフィール情報の拡張
ALTER TABLE public.profiles
ADD COLUMN phone TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
ADD COLUMN interests TEXT[] DEFAULT '{}',
ADD COLUMN notification_email BOOLEAN DEFAULT true,
ADD COLUMN notification_sms BOOLEAN DEFAULT false,
ADD COLUMN notification_push BOOLEAN DEFAULT true;

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON COLUMN public.profiles.phone IS '電話番号（ハイフン含む）';
COMMENT ON COLUMN public.profiles.birth_date IS '生年月日';
COMMENT ON COLUMN public.profiles.gender IS '性別 (male/female/other/prefer-not-to-say)';
COMMENT ON COLUMN public.profiles.interests IS '興味のあるイベントカテゴリ配列';
COMMENT ON COLUMN public.profiles.notification_email IS 'メール通知の有効/無効';
COMMENT ON COLUMN public.profiles.notification_sms IS 'SMS通知の有効/無効';
COMMENT ON COLUMN public.profiles.notification_push IS 'プッシュ通知の有効/無効';
