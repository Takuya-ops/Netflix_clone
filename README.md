## メモ

### next.jsの雛形作成
```typescript
npx create-next-app --typescript

Ok to proceed? (y) y
✔ What is your project named? … netflix_clone
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? (recommended) … No
　※ ここをNoにしないとpagesディレクトリが作成されず、appディレクトリが作成される。
　参考：https://qiita.com/mu_tomoya/items/7545bea039e82e483f9e
✔ Would you like to customize the default import alias (@/*)? … No
``` 

※ npmのバージョンは、18.17.0以上にする必要がある（nvm use 18.17.0 などでバージョン変更）
→ v18.17.0未満の場合、npm run dev コマンドが実行できない。
```バージョンが足りていない場合
nvm use 18.17.0
```

```ローカルサーバー起動
npm run dev
```

app > page.tsx のreturn内の記述をすべて消し、h1タグなどで変更が反映されるか確認。
app > globals.css のファイル内の記述をすべて削除。

### tailwindCSSの導入

以下のドキュメントを参考に作業。
https://tailwindcss.com/docs/guides/nextjs

```
npm install -D tailwindcss postcss autoprefixer
```

```
npx tailwindcss init -p
```

作成された、tailwind.config.jsのcontent内に、以下を追記。
  ```
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  ```

globals.cssに以下を追記
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

画像はこのパスに保存しておく（AWSを使用するならS3に入れておくのがベター）
public/images

'use client'
これをpage.tsxの１行目に書いて置く必要がある。
そうしないと、useState使用時にエラーが発生する。

ログイン画面と登録画面を切り替える際には、useCallbackを使用する。

Prismaを使うとDB周りの処理を簡潔に書ける。
```
npm install -D prisma
```
※ -Dは開発中のみ使用するものをインストールする際に使用するオプション

```
npx prisma init
```
このコマンドで、prismaディレクトリ内にschema.prismaファイルが作成される。
今回はmongodbを使用するので、datasource dbのproviderをmongodbに書き換える。（デフォルトはpostgresqlとなっている）

```
npm install @prisma/client
```

プロジェクトフォルダ配下にlibディレクトリを作成し、その中にprismadb.tsファイルを作成する
```
mkdir lib

touch prismadb.ts
```

以下の内容を追記
```ts:prismadb.ts
import { PrismaClient } from "@prisma/client";

const client = global.prismadb || new PrismaClient();
if (process.env.NODE_ENV === 'production') global.prismadb = client

export default client;
```

global.prismadbの部分でエラーが発生するので、プロジェクトフォルダ配下に、global.d.tsファイルを作成し、以下のように記述する。
```ts:global.d.ts
import { PrismaClient } from "@prisma/client";
import { decl } from "postcss";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient
  }
}
```

mongoDBのAtlasを開く。
https://www.mongodb.com/ja-jp

・無料プラン
・local環境と接続（自分のIPアドレスを追加）
・接続（Connect using VS code）

URLが発行されるので、.envの、DATABASE_URLに貼り付ける。
※ パスワードはDB作成時に登録したものに置き換え、mongodb.net/の配下にDB名を記載する。

記載例：DATABASE_URL="mongodb+srv://takuya:パスワード@cluster0.pkwjdde.mongodb.net/DB名"

MongoDB for VS Codeのvscode拡張機能をインストールする。

schema.prismaに以下を追記
```prisma:schema.prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  image          String?
  email          String?   @unique
  emailVerified  DateTime?
  hashedPassword String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  favoriteIds    String[]  @db.ObjectId
  sessions       Session[]
  accounts       Account[]
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  User         User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String?  @db.ObjectId
  sessionToken String   @unique
  expires      DateTime
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  User              User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String? @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.String
  access_token      String? @db.String
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.String
  session_state     String

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Movie {
  id           String @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  description  String
  videoUrl     String
  thumbnailUrl String
  genre        String
  duration     String
}
```

作成が終わったら、ターミナルを開き、以下のコマンドを叩く。
```
npx prisma db push
```

※ 以下のようなエラーが起きていたら、MongoDBの接続URLが違う可能性がある（自分はここで詰まった）
URLの末尾にDB名が記載されているか？、パスワードは正しいかをチェック

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MongoDB database at "cluster0.pkwjdde.mongodb.net"
Error: P1013

The provided database string is invalid. An invalid argument was provided: Database must be defined in the connection string in database URL. Please refer to the documentation in https://www.prisma.io/docs/reference/database-reference/connection-urls for constructing a correct connection string. In some cases, certain characters must be escaped. Please check the string for any illegal characters.
```

こんな感じのログが出ればOK！（MongoDBの方でも確認しておく）
```
~/Desktop/dev/Netflix_clone main *1 !4 ?3 ❯ npx prisma db push
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MongoDB database "NetFlix_clone" at "cluster0.pkwjdde.mongodb.net"
Applying the following changes:

[+] Collection `User`
[+] Collection `Session`
[+] Collection `Account`
[+] Collection `VerificationToken`
[+] Collection `Movie`
[+] Unique index `User_email_key` on ({"email":1})
[+] Unique index `Session_sessionToken_key` on ({"sessionToken":1})
[+] Unique index `Account_provider_providerAccountId_key` on ({"provider":1,"providerAccountId":1})
[+] Unique index `VerificationToken_token_key` on ({"token":1})
[+] Unique index `VerificationToken_identifier_token_key` on ({"identifier":1,"token":1})


🚀  Your database indexes are now in sync with your Prisma schema. Done in 1.52s

✔ Generated Prisma Client (v5.7.1) to ./node_modules/@prisma/client in 78ms
```

pages > api > [...nextauth].tsを作成。

以下のコマンドを実施。

ログイン時のパスワードの認証を行う際に使用するもの。
```
npm install next-auth

npm install bcrypt
```

[...nextauth].tsファイルに以下を追記
```typescript:[...nextauth].ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prismadb from '@/lib/prismadb';
import { compare } from 'bcrypt';

export default NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
        },
        password: {
          label: 'Password',
          type: 'password',
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.hashedPassword) {
          throw new Error('Email does not exist')
        }
        const isCorrectPassword = await compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Incorrect password')
        }
        return user;
      }
    })
  ],
  pages: {
    signIn: '/auth',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy:'jwt'
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
})
```

.envファイルに以下を追記
```.env
NEXTAUTH_JWT_SECRET = "NEXT-JWT-SECRET"
NEXTAUTH_SECRET = "NEXT-SECRET"
```

ターミナルで以下のコマンドを実施
```
npm i -D @types/bcrypt

npm i axios
```

pages > auth.tsファイルを編集する。
以下の記述を追加
```typescript:auth.tsx
  const register = useCallback(async () => {
    try {
      await axios.post('/api/register', {
        email,
        name,
        password
      });
    } catch (error) {
      console.log(error);
    }
  }, []);
```

=== は厳密等価演算子。型と値が等しい場合のみTrueとなる。

pages > api > register.tsファイルを作成
name, email, passwordがpostされた時の処理を書く。

※ 422エラーは、すでに登録済みのユーザーが再度アカウント登録を行おうとした時などに返されるエラー。

auth.tsxに作成した、api/registerにpostする処理を書く、
```typescript:auth.tsx
  const register = useCallback(async () => {
    try {
      await axios.post('/api/register', {
        email,
        name,
        password
      });
    } catch (error) {
      console.log(error);
    }
  }, [email, name, password]);
```

localhost:3000のアプリ画面で、適当に情報を入力し、Sign Upを押下。
デベロッパーツールで情報が送られたか確認。
→ 成功していれば、MongoDBのUserに入力した情報が入っている。