## メモ

### next.jsの雛形作成
```typescript
npx create-next-app --typescript

Ok to proceed? (y) y
✔ What is your project named? … netflix_clone
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like to use `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to customize the default import alias (@/*)? … No / Yes
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
