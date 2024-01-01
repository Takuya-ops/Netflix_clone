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