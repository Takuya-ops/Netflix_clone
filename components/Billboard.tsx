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
            {/* けんちゃん */}
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
            {/* 2023年の成長の記録 */}
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