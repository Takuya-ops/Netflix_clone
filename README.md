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

pagesディレクトリ内に、profiles.tsx を作成する。(以下のように記述)
※ アクセス時のパスはファイル名になる
例）http://localhost:3000/profiles でアクセスすると表示される。
```typescript:profiles.tsx
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";

export async function getServerSideProps(context: NextPageContext) {
  // getSession内に { req: context.req }がないと、ログイン後も /authにリダイレクトされてしまうので注意
  const session = await getSession({ req: context.req })

  // 未認証の場合は登録画面にリダイレクトする
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }
  return {
    props: {}
  }
}

const Profiles = () => {
  return (
  <>
    <div>
      <p className="text-white text-4xl">Profiles</p>
    </div>
  </>
  )
}

export default Profiles;
```

※ たまに、npm run devができなくなる。
以下のようにすると、とりあえずは直る（またしばらく経つと発生するが、、）
```terminal:terminal
npm install
npx prisma generate
npm install @prisma/client
npm run dev
```

auth.tsxのrouterに関する記述を消す。
リダイレクト(callbackUrl)先を '/profiles'に変更する。
github, googleも同様に'/profiles'に変更。

左右の中間にテキストを配置するには、text-centerで事足りるが、上下の中間に表示されるには、親のdivタグを作成し、その中に、flex justify-center items-center h-screen などを記述してやる必要がある。
縦に並べたいものはその要素の親タグに、flex-col を指定。
mb-4（マージンボトム）

groupがhoverした時のトリガー（親タグと子タグを関連付ける）
```ts:profiles.tsx
import useCurrentUser from "@/hooks/useCurrentUser";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

export async function getServerSideProps(context: NextPageContext) {
  // const session = await getSession()
  const session = await getSession({ req: context.req })


  // 未認証の場合は登録画面にリダイレクトする
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }
  return {
    props: {}
  }
}

const Profiles = () => {
  const router = useRouter()
  const { data:user } = useCurrentUser()
  return (
  <>
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-white text-4xl mb-10">Who is watching?</h1>
        <div onClick={() => router.push('/')}>
          {/* 画像用 */}
          <div className="group">
            <div className="
              w-40
              h-40
              // 角を丸くする
              // rounded-md
              rounded-sm
              border-2
              border-transparent
              group-hover:cursor-pointer
            group-hover:border-red-400
            ">
              {/* alt属性には画像を説明する簡潔なテキストを入れる（画像を読み込めなかった場合、このテキストが表示される） */}
              <img src="images/face.png" alt="user image"></img>
            </div>
            {/* 名前用 */}
            <div className="
              text-gray-300
              mt-2
              text-center
              group-hover:text-white
            ">
              {user?.name}
            </div>
          </div>
        </div>
    </div>
  </>
  )
}

export default Profiles;
```

ページ遷移させたい時（useRouterを使用）
```
import { useRouter } from "next/router";
const router = useRouter()
<div onClick={() => router.push('/')}>
```

index.tsxのsignoutに関する記述を消す

# ホーム画面の作成
#### Navbar.tsxの作成
componentsディレクトリ内に Navbar.tsxを作成する。
```ts:NavBar.tsx
const NavBar = () => {
  return (
    // z-40は前面に出すものを制御する
    <nav className="text-white f-full fixed z-40">
      <div className="
        // 水平方向のパディング
        px-4
        // md:スクリーンのサイズが768px以上のときに適用されるようにする
        md:px-16
        垂直方向のパディング
        py-6
        flex
        // 縦並びにする
        flex-row
        items-center
        // 変更を滑らかにする（transitionとduration-500は併用する → transitionだけだと変化が分からない）
        transition
        // 500ミリ秒（0.5秒）かけて、変化するようにする
        duration-500
        // 50 から 900 の範囲で指定できる
        bg-zinc-900
        // 透過度（透けて見えるようになる）
        bg-opacity-90
      ">
        {/* 画面幅が1024px以上で高さを20にする（lg:h-20） */}
        <img className="h-20" src="/images/logo.png" alt="logo"></img>
      </div>
    </nav>
  )
}

export default NavBar;
```

<nav>はナビゲーションリンクを意味的にグループ化するためのセマンティックなタグ。
<div>は内容や機能の汎用的なコンテナとして使用され、特にスタイリングやレイアウトのためによく使われる。


componentsディレクトリに、NavBarItem.tsxを作成
```ts:NavBarItem.tsx
import React from "react";

interface NavBarItemProps {
  label: string
} 

const NavBarItem: React.FC<NavBarItemProps> = ({label}) => {
  return (
    <div className="text-white cursor-pointer hover:text-gray-300 transition">
      {label}
    </div>
  )
}

export default NavBarItem;
```

一定以下の画面サイズのときは、Browseを表示させる
<div className="lg:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative">
  <p className="text-white text-sm">Browse</p>
  <BsChevronDown className="text-white transition"/>
  <MobileMenu/>
</div>

componentsディレクトリ内に、MobileMenu.tsxを作成する
※ left-0を使用すると、要素が親の左端から開始することが保証される。
```MobileMenu.tsx

```

※ テキストサイズの変更について
テキストサイズは通常、text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, ... など、text-{size}で指定できる。

React は不変性の原則に従う。これは、状態を直接変更するのではなく、新しい状態を作成して更新。
useStateの第一引数、第二引数が状態を更新用（set〇〇 のやつ）

const MobileMenu: React.FC<MobileMenuProps> = ({visible}) => {

ここの部分、visibleの記述は{}で囲むことを忘れない。
({visible})
こうしないと、対象のボタンを押しても画面が切り替わらないので注意。

componentsディレクトリにAccountMenu.tsxを作成する。
```ts:AccountMenu.tsx
import { signOut } from "next-auth/react";
import React from "react";

interface AccountMenuProps {
  visible?: boolean
}

const AccountMenu:React.FC<AccountMenuProps> = ({
  visible
}) => {

  if (!visible) {
    return null
  }

  return (
    <div className="bg-black w-56 absolute top-14 right-0 py-5 flex-col border-2 border-gray-800 flex">
      <div className="flex flex-col gap-3">
        <div className="px-3 group/item flex flex-row gap-3 items-center w-full">
          <img className="w-8 rounded-md" src="/images/face.png" alt=""></img>
          <p className="text-white text-sm group-hover/item:underline">
            username
          </p>
        </div>
        {/* 下線を引く */}
        <hr className="bg-gray-600 border-0 h-px my-4" />
        <div onClick={() => signOut()} className="px-3 text-center text-white text-sm hover:underline">
          Sign out of App
        </div>
      </div>
    </div>
  )
}

export default AccountMenu;
```

MongoDBのMovieに仮データを挿入

pages > api に random.ts ファイルを作成。
```ts:random.ts
import { NextApiRequest, NextApiResponse } from "next";

import prismadb from '@/lib/prismadb'
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  try {
    await serverAuth(req)

    const movieCount = await prismadb.movie.count();
    const randomIndex = Math.floor(Math.random() * movieCount)

    const randomMovies  = await prismadb.movie.findMany({
      take: 1,
      skip: randomIndex
    });
    return res.status(200).json(randomMovies[0])
  } catch (error) {
    console.log(error)
    return res.status(400).end()
  }
}
```

hooksディレクトリの中に useBillboard.tsを作成する 
SWR（Stale-While-Revalidate）というデータ取得戦略に基づくReact Hooksライブラリ。
fetchの際に必要。
```ts:useBillboard.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useBillboard = () => {
  const {data, error, isLoading} = useSWR('/api/random', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    data,
    error,
    isLoading
  }
}
```

componentsディレクトリに、Billboard.tsxファイルを作成
```typescript:Billboard.tsx
import useBillboard from "@/hooks/useBillboard";
import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

const Billboard = () => {
  // useBillboardでfetchしたデータをdataに入れる
  const {data} = useBillboard()

  return (
    // vwはviewport width
    <div className="relative h-[56.25vw]">
      {/* webページにビデオコンテンツを埋め込むために使用 */}
      <video
        className="
          w-full
          h-[56.25vw]
          object-cover
          brightness-[80%]
        "
        autoPlay
        muted
        loop
        poster={data?.thumbnailUrl}
        src={data?.videoUrl}>
        {/* // src="/movies/concat_movie.mp4"> */}
      </video>
      <div className="absolute top-[30%] md:top-[40%] ml-4 md:ml-16">
          <p className="
            text-white
            text-xl
            md:text-5xl
            h-full
            w-[50%]
            lg:text-6xl
            font-bold
            drop-shadow-xl
            // whitespace-nowrap
          ">
            {data?.title}
          </p>
          <p className="
            text-white
            text-[8px]
            md:text-lg
            mt-3
            md:mt-8
            w-[90%]
            // 768px以上で適用
            md:w-[80%]
            // 1024px以上で適用
            lg:w-[50%]
            drop-shadow-xl
            // whitespace-nowrap
            break-words whitespace-pre-line
          ">
            {data?.description}
          </p>
          <div className="flex flex-row items-center mt-3 md:mt-4 gap-3">
            <button className="
              bg-white
              text-white
              bg-opacity-60
              rounded-md
              py-1 md:py-2
              px-2 md:px-4
              w-auto
              text-xs lg:text-lg
              font-semibold
              flex
              flex-row
              items-center
              hover:bg-opacity-20
              transition
            ">
              <AiOutlineInfoCircle className="mr-2"/>
              More Info
            </button>
          </div>
      </div>
    </div>
  )
}

export default Billboard;
```

md:text-lgは、中程度のビューポート幅以上でテキストを大きくする。


pages > api > movies 内に、index.tsを作成する。

以下のテンプレはAPI作成によく使用するので書き留めておく。
```ts:APIテンプレート
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  try {
    await serverAuth(req)
  } catch (error) {
    console.log(error)
    return res.status(400).end()
  }
}
```

```ts:index.ts
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  try {
    await serverAuth(req)
    const movies = prismadb.movie.findMany()
    return res.status(200).json(movies)
  } catch (error) {
    console.log(error)
    return res.status(400).end()
  }
}
```

**revalidateIfStale**
false は、SWRが最初にマウントされたときに、キャッシュが古くなっていてもデータの再検証を行わないようにします。つまり、キャッシュにデータがあれば、それをそのまま使用し、新たなリクエストを送らないようにします。これはパフォーマンスを向上させるためや、不要なリクエストを減らすために有用です。
**revalidateOnFocus**
false は、ブラウザのタブにフォーカスが戻った時にデータの再検証を行わないようにします。通常、ユーザーがアプリケーションに戻った時にデータが最新であることを保証するために使用されますが、このオプションをfalseにするとその機能がオフになります。
**revalidateOnReconnect**
false は、ネットワークが再接続された時にデータの再検証を行わないようにします。インターネット接続が不安定な場合や、オフラインからオンラインに戻ったときに自動的にデータを更新するのを避けたい場合に便利です。


hooksファイルの中に、useMovieList.tsを作成する。
```ts:useMovieList.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useMovieList = () => {
  const {data, error, isLoading} = useSWR('/api/movies', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    data,
    error,
    isLoading
  }
}

export default useMovieList
```

ターミナルで以下のコマンドを実行
```terminal:terminal
npm install lodash

npm install -D @types/lodash
```

componentsディレクトリ内に MovieList.tsxを作成する。
```ts:MovieList.tsx
import React from "react"
import { isEmpty } from "lodash"

interface MovieListProps {
  data: Record<string, any>[]
  title: string
}

const MovieList: React.FC<MovieListProps> = ({data, title}) => {
  if (isEmpty(data)) {
    return null
  }

  return (
    <div className="px-4 md:px-12 mt-4 space-y-8">
      <p className="text-white text-md md:text-xl lg:text-2xl font-semibold mb-4">
        {title}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {data.map((movie) => (
          <div key={movie.id}>
            movie
          </div>
        ))}
      </div>
    </div>
  )
}

export default MovieList
```

index.tsファイルを修正
```
const movies = await prismadb.movie.findMany()
```

componentsディレクトリにMovieCard.tsxを作成
```ts:MovieCard.tsx
import React from "react"
import { BsFillPlayFill } from "react-icons/bs"

interface MovieCardProps {
  data: Record<string, any>
}

const MovieCard: React.FC<MovieCardProps> = ({data}) => {
  return (
    <div className="
      group 
      bg-zinc-900
      col-span 
      relative 
      h-[12vw]
    ">
      <img
        className="
          cursor-pointer
          object-cover
          transition
          duration
          shadow-xl
          rounded-md
          group-hover:opacity-90
          sm:group-hover:opacity-10
          delay-100
          w-full
          h-[12vw]
        "
        src={data.thumbnailUrl}
      />
      <div className="
        opacity-0
        absolute
        top-0
        transition
        duration-200
        z-10
        invisible
        sm:visible
        delay-100
        w-full
        scale-0
        group-hover:scale-110
        group-hover:-translate-y-[6vw]
        group-hover:translate-x-[2vw]
        group-hover:opacity-100
      ">
        <img
        className="
          cursor-pointer
          object-cover
          transition
          duration
          shadow-xl
          rounded-t-md
          w-full
          h-[12vw]
        "
        src={data.thumbnailUrl} alt="Thumbnail"/>
        {/* サムネイル画像の下にスペースを確保 */}
        <div className="
          z-10
          bg-zinc-800
          p-2
          lg:p-4
          absolute
          w-full
          transition
          shadow-md
          rounded-b-md
        ">
          <div className="flex flex-row items-center gap-3">
            <div className="
              cursor-pointer
              w-6
              h-6
              lg:w-10
              lg:h-10
              bg-white
              rounded-full
              flex
              justify-center
              items-center
              transition
              hover:bg-neutral-300
            "
            onClick={() => {}}
            >
              <BsFillPlayFill size={26}/>
            </div>
          </div>
          <p className="text-green-400 font-semibold mt-4">
            New <span className="text-white">2023</span>
          </p>
          <div className="flex flex-row mt-4 gap-2 items-center">
            <p className="text-white text-[10px] lg:text-sm">{data.duration}</p>
          </div>
          <div className="flex flex-row mt-4 gap-2 items-center">
            <p className="text-white text-[10px] lg:text-sm">{data.genre}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
```

apiディレクトリにfavorite.tsを作成する。
```ts:favorite.ts
import serverAuth from "@/lib/serverAuth";
import { without } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method == 'POST') {
      const {currentUser} = await serverAuth(req)

      const {movieId} = req.body

      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId
        }
      })
      
      if (!existingMovie) {
        throw new Error('Invalid ID')
      }

      const user = await prismadb.user.update({
        where: {
          email: currentUser.email || '',
        },
        data: {
          favoriteIds: {
            push:movieId
          }
        }
      })

      return res.status(200).json(user);
    }

    if (req.method === 'DELETE') {
      const {currentUser} = await serverAuth(req)
      const {movieId} = req.body
      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId
        }
      })

      if (!existingMovie) {
        throw new Error('Invalid ID')
      }

      const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);
      
      const updatedUser = await prismadb.user.update({ 
        where: {
          email: currentUser.email || '',
        },
        data: {
          favoriteIds: updatedFavoriteIds
        }
      })
      return res.status(200).json(updatedUser)
    }
    return res.status(405).end()
  } catch (error) {
    console.log(error)
    return res.status(400).end
  }
}
```

apiディレクトリに、favorites.ts を作成する。
```ts:favorites.ts
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from  '@/lib/prismadb'
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  
  try {
    const {currentUser} = await serverAuth(req)
    const favoriteMovies = await prismadb.movie.findMany({
      where: {
        id: {
          in: currentUser?.favoriteIds
        }
      }
    });
    return res.status(200).json(favoriteMovies)
  } catch (error) {
    console.log(error)
    return res.status(400).end()
  }
}
```

hooksディレクトリ内に、useFavorites.tsを作成。
```ts:useFavorites.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

// mutateはデータを更新すること
const useFavorites = () => {
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR('/api/favorites', fetcher,{
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

export default useFavorites
```

※ mutateはデータを更新すること

componentsディレクトリにFavoriteButton.tsxを作成。
```ts:FavoriteButton.tsx
import axios from "axios";
import { useCallback, useMemo } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFavorites from "@/hooks/useFavorites";
import { AiOutlinePlus } from "react-icons/ai";

interface FavoriteButtonProps {
  movieId: string
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({movieId}) => {
  return (
    <div className="
      cursor-pointer
      group/item
      w-6
      h-6
      lg:w-10
      lg:h-10
      border-white
      border-2
      rounded-full
      // flex
      // justify-center
      // items-center
      // transition
      // hover:border-netural-300
    ">
      <AiOutlinePlus className="text-white size={24}" />
    </div>
  )
}

export default FavoriteButton
```

index.tsxに追記する
```ts:index.tsx
  const { data: favorite = []} = useFavorites();

  <MovieList title="My List" data={movies}/>
```

FavoriteButton.tsxを編集する。
```tsx:FavoriteButton.tsx

```