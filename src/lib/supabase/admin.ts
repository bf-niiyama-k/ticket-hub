import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// サービスロールクライアント（RLSをバイパス）
// Webhook処理など、サーバーサイドの管理操作に使用
export function createAdminClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
