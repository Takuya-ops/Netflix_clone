// 'use client'
import { getSession } from "next-auth/react";
// import Auth from "./auth";
import { NextPageContext } from "next";
import useCurrentUser from "@/hooks/useCurrentUser";
import NavBar from "@/components/NavBar";
import Billboard from "@/components/Billboard";
import MovieList from "@/components/MovieList";
import useMovieList from "@/hooks/useMovieList";

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
  // const { data: user } = useCurrentUser()
  const { data: movies = []} = useMovieList();

  return (
    <>
      <NavBar/>
      <Billboard/>
      <div className="pb-40">
        <MovieList title="trending now" data={movies}/>
      </div>
    </>
  )
}
