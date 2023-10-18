# Cloudflare PagesとFunctions、D1を使ったお問い合わせフォーム

## 概要

Cloudflare PagesとFunctions、D1を使ったお問い合わせフォームのサンプルです。確認メールにblastengineを利用しています。

## 利用している技術

- Cloudflare Pages
- Cloudflare Workers（Pages Functions）
- Cloudflare D1
- blastengine

## デモ

https://blastengine.pages.dev/

Ccにatsushi@moongift.co.jpへ送信するので注意してください。

## セットアップ

必要な環境変数は以下の2つです。

- `BLASTENGINE_API_KEY`  
blastengineのAPIキー
- `BLASTENGINE_USER_ID`  
blastengineのユーザーID

D1の設定は以下のようにしてください。以下はデータベース名を `be_customers` とした場合です。

```
$ npx wrangler d1 execute be_customers --file=./schema.sql
$ npx wrangler d1 execute be_customers --file=./schema.sql --local
```

## ライセンス

MIT License
