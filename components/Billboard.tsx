import useBillboard from "@/hooks/useBillboard";
import React from "react";

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
        // src={data?.videoUrl}>
        src="/movies/movie1.MP4">
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
            whitespace-nowrap
          ">
            {/* {data?.title} */}
            けんちゃん
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
            whitespace-nowrap
          ">
            {/* {data?.description} */}
            2023年の成長の記録
          </p>
      </div>
    </div>
  )
}

export default Billboard;