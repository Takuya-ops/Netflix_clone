// 'use client'
import { getSession, signOut } from "next-auth/react";
// import Auth from "./auth";
import { NextPageContext } from "next";
import useCurrentUser from "@/hooks/useCurrentUser";
import NavBar from "@/components/NavBar";

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
  const { data: user } = useCurrentUser()
  return (
    <>
      <NavBar/>
      <h1 className="text-4xl text-green-500">NetFlix Clone</h1>
      {/* ログインしたユーザーを表示させる */}
      <p className="text-white">Logged in as : {user?.name}</p>
      {/* ログアウトボタンの追加 */}
      <button className="h-10 w-full bg-white" onClick={() => signOut()}>Logout</button>
      {/* <Auth/> */}
    </>
  )
}
