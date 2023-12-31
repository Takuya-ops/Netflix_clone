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

auth.tsxにログインの処理も追記する
```
  const login = useCallback(async () => {
    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      });
    } catch (error) {
      console.log(error)
    }
  }, [email, password])
```
こちらも修正
```
<button onClick={variant === 'login' ? login : register} className="bg-red-600 py-3 text-white rounded-md w-full mt-10 hover:bg-red-700 transition">
  {variant === 'login' ? 'Login' : 'Sign Up'}
</button>
```

Loginを押したあと、以下のエラーが出てしまう。
```
Error: This action with HTTP GET is not supported by NextAuth.js
```

これを解決するには、apiディレクトリ内にauthディレクトリを作成し、この中に[...nextauth].tsを入れる。
http://localhost:3000/auth にアクセスし、ログイン情報を入力後、Loginボタンを押し、200番出レスポンスがあればOK。

auth.tsxの、auth内に以下の記述を追加。
```
const router = useRouter()
```

※ npm run devで以下のようなエラーが発生する場合は、index.tsxの１行目に'use client'を記述すると直る。
 ⚠ Fast Refresh had to perform a full reload.

ターミナルで以下のコマンドを実行。
```
npm install react-icons
```

Githubとgoogleのアイコンをインポート
```
import {FcGoogle} from "react-icons/fc"
import {FaGithub} from "react-icons/fa"
```

buttonタグの下に、GoogleとGithubのアイコンを挿入する。

react-iconsで提供されているアイコン
（例）FcGoogleなどFc（FontAwesome Colors）がついているものはカラーが付いているアイコン。
その他の多くのアイコン、Fa（FontAwesome）、Ai（Ant Design Icons）、Io（Ionicons）、Si（Simple Icons）などはデフォルトで色がついていないので自分で指定する必要がある。

例
```typescript:auth.tsx
<FaInstagram style={{ color: "#C13584" }} /> // Instagramの場合
<FaTwitter style={{ color: "#1DA1F2" }} /> // Twitterの場合
<AiFillFacebook style={{ color: "#4267B2" }} /> // Facebookの場合
<SiLinkedin style={{ color: "#0077B5" }} /> // LinkedInの場合
```

.envに以下を追記（登録時の認証に使用する外部SNSの情報）
```
GITHUB_ID=
GITHUB_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

TWITTER_ID=
TWITTER_SECRET=

LINKEDIN_ID=
LINKEDIN_SECRET=

FACEBOOK_ID=
FACEBOOK_SECRET=
```

ここで登録する情報
- Github
GithubのDeveloper SettingsからOAuth AppsのRegister New Applicationをクリック。
https://github.com/settings/developers
必要情報を入力
Application name：任意の名前
Homepage URL：http://localhost:3000
Authorization callback URL：http://localhost:3000
Register Applicationを押すとClientIDが発行される → これを.envファイルに指定する。
その画面にgenerat client secretのボタンがあるので、ここをクリックするとclient secretも取得できる。 → .envファイルに指定
auth.tsxファイルの、githubのアイコンを作っている箇所に、onClick部分を追加する。
```typescript:auth.tsx
<div
  // この１行を追加
  onClick={() => signIn('github', {callbackUrl: '/'})}
  className="
    w-12
    h-12
    bg-white
    rounded-full
    flex
    items-center
    justify-center
    cursor-pointer
    hover:opacity-70
    transition
  "
>
  <FaGithub size="24px"/>
</div>
```

- Google
- Twitter
- Linkedin
- Facebook

pages > api > auth > [...nextauth].ts で .envで指定した認証情報を読み込む（provider部分に追記）
```typescript:[...nextauth].ts
providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID || '',
      clientSecret: process.env.TWITTER_SECRET || ''
    }),
    LinkedinProvider({
      clientId: process.env.LINKEDIN_ID || '',
      clientSecret: process.env.LINKEDIN_SECRET || ''
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || ''
    }),
```

ターミナルで以下のコマンドを実行
```
npm install @next-auth/prisma-adapter
```

インストールした以下のパッケージを追加
```typescript:[...nextauth].ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";

debugの記述があるところあたりに、adapterを追記
```typescript:[...nextauth].ts
debug: process.env.NODE_ENV === 'development',
adapter: PrismaAdapter(prismadb),
```

githubの認証後、エラーページが表示される。
ログでsession_stateがschema.prismaのAccountでしてないためといった内容が出力されたが、記述しているので原因不明。実装は保留とする。
```
 +   session_state: String
 Argument `session_state` is missing.
 ```

 googleログイン
 google cloudを開く。
 https://console.cloud.google.com/
 プロジェクトの選択から、新しいプロジェクトをクリック。
 ```
 プロジェクト名："任意の名前"
 場所："組織なし"
```
 作成を押す。

 検索窓から、API & servicesを検索。
 サイドバーのOAuth同意画面をクリックし、Externalを選択。
 作成を押す。

以下の必須入力項目を入力。
```
アプリ名
ユーザーサポートメール
メールアドレスを登録
```
保存して次へ

保存して次をクリック
最後まで（２つ目以降の項目は入力の必要はない。）

サイドバーの認証情報を選択。
上部の認証情報を作成からOAuthClientIDを選択し、アプリケーションの種類を入力する。（今回はWebアプリケーション）
名前は、とりあえずこのままでOK
承認済みのリダイレクト URIの項目に以下を入力
```
http://localhost:3000/api/auth/callback/google
```
※ これを入力しないと、フロントエンドのgoogleアイコンをクリックした時、400番エラ-となるので注意。

作成をクリックすると、IDとSECRETが発行される。（設定が完了されるまで５分程度かかる場合がある。）

githubの時と同じ要領で以下をgoogle アイコン部分のdivタグに追加する。
```typescript:auth.tsx
onClick={() => signIn('google', {callbackUrl: '/'})}
```

Gアカウントについても、githubと同じエラーが発生する。
以下のようなエラーがフロントエンドで表示される...
```
missing required error components, refreshing...
```
やはり、Prismaのschemaに関する入力間違い？
MongoDBにもデータが登録されていない。
こちらも、ひとまずスキップ。

やはりschema.prismaの記述がおかしかったよう。
修正版↓
```prisma:schema.prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["mongoDb"]
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
  sessions       Session[]
  accounts       Account[]
  favoriteIds    String[]  @db.ObjectId
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.String
  access_token      String? @db.String
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.String
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
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

npx prisma db push も忘れずに。

libディレクトリに、serverAuth.ts を作成し、以下を記述。
```typescript:serverAuth.ts
import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";

import prismadb from '@/lib/prismadb';

const serverAuth = async (req: NextApiRequest) => {
  const session = await getSession({req});

  if (!session?.user?.email) {
    throw new Error('Not signed in')
  }

  const currentUser = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    }
  });

  if (!currentUser) {
    throw new Error('Not signed in')
  }

  return { currentUser }
}

export default serverAuth;
```

apiディレクトリ内に、current.ts を作成し、以下を記述。
```typescript:current.ts
import { NextApiRequest, NextApiResponse } from "next";
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  try {
    const {currentUser} = await serverAuth(req)
    return res.status(200).json(currentUser)
  } catch (error) {
    console.log(error)
    return res.status(400).end()
  }
}
```

libディレクトリ内に、fetcher.ts を作成し、以下を記述。
```typescript:fetcher.ts
 import axios from 'axios'

 const fetcher = (url : string) => axios.get(url).then((res) => res.data)

 export default fetcher;
```

ターミナルで以下のコマンドを実行
```
npm install swr
```

プロジェクトディレクトリ配下にhooksディレクトリを作成し、その中に useCurrentUser.ts を作成する。
```typescript:useCurrentUser.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useCurrentUser = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/current', fetcher)
  
  return {
    data,
    error,
    isLoading,
    mutate
  }
};

export default useCurrentUser;
```

index.tsxを以下のように修正する。
サインアウト機能、ログインユーザーの表示など。

```ts:index.tsx
import { getSession, signOut } from "next-auth/react";
import Auth from "./auth";
import { NextPageContext } from "next";
import useCurrentUser from "@/hooks/useCurrentUser";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: 'auth',
        // 一時的なリダイレクト（ログイン認証など）
        permanent: false
      }
    }
  }
  return {
    props: {}
  }
}

export default function Home() {
  const {data: user} = useCurrentUser();
  
  return (
    <>
      <h1 className="text-4xl text-green-500">NetFlix Clone</h1>
      // ログインしたユーザーを表示させる
      <p className="text-white">Logged in as : {user?.name}</p>
      {/* ログアウトボタンの追加 */}
      <button className="h-10 w-full bg-white" onClick={() => signOut()}>Logout</button>
    </p>
  )
}
```

mongoDBのAtlasを開く。
サイドバーのSECURITY内の、Network Accessを選択し、IP Access Listのタブの ADD IP ADDRESSを選択する。
ALLOW ACCESS FROM ANYWHEREをクリック（Access ListAccess List Entryに、0.0.0.0/0 が入る）
Confirmを押す。

pagesディレクトリ内に、profiles.tsx を作成する。
