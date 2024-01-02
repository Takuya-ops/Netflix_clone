import { useCallback, useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import NavBarItem from "./NavBarItem";
import { BsBell, BsChevronDown, BsSearch } from 'react-icons/bs'
import AccountMenu from "./AccountMenu";

const TOP_OFFSET = 66

const NavBar = () => {
  // モバイルメニューが表示されているか？
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showBackground, setShowBackground] = useState(false)
  // showMobileMenuを切り替える関数
  const toggleMobileMenu = useCallback(() => {
    // 更新前の状態（current）を、もう一つの状態に変える（falseならtrueに、trueならfalseに）
    setShowMobileMenu((current) => (!current))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= TOP_OFFSET) {
        setShowBackground(true)
      } else {
        setShowBackground(false)
      }
    }
  })

  // toggleは切り替えという意味
  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current)
  }, [])

  return (
    // z-40は前面に出すものを制御する
    <nav className="flex text-white w-full fixed z-40">
      <div className={`
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
        // // 50 から 900 の範囲で指定できる
        // bg-zinc-900
        // // 透過度（透けて見えるようになる）
        // bg-opacity-90
        ${showBackground ? 'bg-zinc-900 bg-opacity-90' : ''}
      `}>
        {/* 画面幅が1024px以上で高さを20にする（lg:h-20） */}
        <img className="h-16" src="/images/logo.png" alt="logo"></img>
        <div className="
          flex-row
          ml-10
          gap-8
          hidden
          lg:flex
        ">
          <NavBarItem label="Home"/>
          <NavBarItem label="Series"/>
          <NavBarItem label="Films"/>
          <NavBarItem label="New & Popular"/>
          <NavBarItem label="My List"/>
          <NavBarItem label="Browse by languages"/>
        </div>
        {/* 画面が小さい時用 */}
        <div onClick={toggleMobileMenu} className="lg:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative">
          <p className="text-white text-sm">Browse</p>
          <BsChevronDown className={`text-white transition ${showMobileMenu ? 'rotate-180' : 'rotate-0'}`}/>
          {/* <MobileMenu visible /> */}
          <MobileMenu visible={showMobileMenu}/>
        </div>
        <div className="ml-40 flex flex-row gap-8 items-center">
          <div className="ml-20 md:ml-40 lg:ml-40 text-gray-200 hover:text-gray-300 cursor-pointer transition">
            <BsSearch/>
          </div>
          <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
            <BsBell/>
          </div>
          <div onClick={toggleAccountMenu} className="flex flex-row items-center gap-2 cursor-pointer relative">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-md overflow-hidden">
              <img src="/images/face.png" alt="" />
            </div>
            <BsChevronDown className={`text-white transition ${showAccountMenu ? 'rotate-180' : 'rotate-0'}`}/>
             {/* face.imgのアイコンをクリックした時に表示されるメニュー */}
            <AccountMenu visible={showAccountMenu}/>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar;