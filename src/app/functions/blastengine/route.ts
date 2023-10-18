// Cloudflare Workers および Next.js に関連するモジュールをインポート
import { D1Database } from '@cloudflare/workers-types';
import type { NextRequest } from 'next/server'

// エッジサーバーでの実行を指定
export const runtime = 'edge';

// 環境変数からデータベースの情報を取得
const DB = process.env.DB as unknown as D1Database;

// フォームから受け取る入力データの型を定義
type formData = {
  company: string;
  accountname: string;
  email: string;
  type: string;
  message: string;
};

// メール送信APIからの応答の型を定義
type blastengineResponse = {
  delivery_id: number;
};

// POSTリクエストの処理関数
export async function POST(request: NextRequest) {
  console.log(request.url);
  console.log(request.method);

  // リクエストボディから入力データを取得
  const body = await request.json() as formData;

  // メールを送信し、その結果を取得
  const json = await sendMail(body);

  // データベースに問い合わせ情報を保存
  await saveContact(body, json.delivery_id);

  // 応答を返す
  return new Response(JSON.stringify(json));
};

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

// データベースに問い合わせ情報を保存する関数
const saveContact = async (body: formData, deliveryId: number): Promise<boolean> => {
  // SQLを使用してデータをデータベースに挿入
  const { success } = await DB
    .prepare(`INSERT INTO Contacts (
      company,
      accountname,
      email,
      type,
      message,
      delivery_id
    ) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(body.company, body.accountname, body.email, body.type, body.message, deliveryId)
    .run();
  // 操作が成功したかどうかを返す
  return success;
};

// メールを送信する関数
const sendMail = async (body: formData): Promise<blastengineResponse> => {
  // 環境変数からAPIの認証情報を取得
  const apiUser = process.env.BLASTENGINE_USER_ID;
  const apiKey = process.env.BLASTENGINE_API_KEY;

  // 認証トークンを生成
  const token = await generateToken(`${apiUser}${apiKey}`);
  
  // リクエストヘッダーを設定
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  // メールの内容を設定
  const text_part = `__ACCOUNTNAME__様   
    お問い合わせいただきありがとうございます。内容を確認し、追ってご連絡いたします。
    
    会社名：
    __COMPANY__
    お名前：
    __ACCOUNTNAME__
    お問い合わせ内容：
    __MESSAGE__
    `;

  // メールのデータを整形
  const data = {
    from: {
      email: 'no-reply@opendata.jp',
      name: '管理者'
    },
    to: body.email,
    cc: ['atsushi@moongift.co.jp'],
    subject: 'お問い合わせありがとうございます',
    encode: 'UTF-8',
    text_part,
    // メールテンプレート内のプレースホルダーに対応する値を設定
    insert_code: Object.entries(body).map(([key, value]) => ({
      key: `__${key.toUpperCase()}__`,
      value,
    })),
  };
  
  // APIを呼び出してメールを送信
  const res = await fetch('https://app.engn.jp/api/v1/deliveries/transaction', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  // APIの応答をJSONとして解析
  const json = await res.json();
  return json as blastengineResponse;
}

// 認証トークンを生成する関数
const generateToken = async (message: string): Promise<string> => {
  // 文字列をUint8Arrayに変換
  const msgUint8 = new TextEncoder().encode(message);

  // SHA-256ハッシュを計算
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // ハッシュを16進数の文字列に変換
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // ハッシュをBase64形式のトークンに変換
  const token = Buffer
    .from(hashHex.toLowerCase())
    .toString('base64');
  
  return token;
};
