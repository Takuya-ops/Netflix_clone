// 'use client'
import { getSession } from "next-auth/react";
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
    </>
  )
}
