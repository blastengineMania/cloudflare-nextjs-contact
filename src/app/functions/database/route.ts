// Cloudflare Workers および Next.js に関連するモジュールをインポート
import { D1Database } from '@cloudflare/workers-types';
import type { NextRequest } from 'next/server'

// エッジサーバーでの実行を指定
export const runtime = 'edge';

// 環境変数からデータベースの情報を取得
const DB = process.env.DB as unknown as D1Database;

// GETリクエストの処理関数
export async function GET(request: NextRequest) {
  // 認証トークンを確認
  const auth = request.headers.get('Authorization');
  if (auth?.trim() === '' || auth !== process.env.AUTH_TOKEN) {
    // 認証トークンが一致しない場合は401エラーを返す
    return new Response('Unauthorized', { status: 401 });
  }
  // データベースから問い合わせ情報を取得
  const res = await DB.prepare('SELECT * FROM Contacts ORDER BY id').all();
  // JSON形式で応答を返す
  return new Response(JSON.stringify(res.results));
}
