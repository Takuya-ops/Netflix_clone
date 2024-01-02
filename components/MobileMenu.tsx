interface MobileMenuProps {
  // 見せるか、見せないか（Trueの時に表示させる）
  visible?: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({visible}) => {
  if (!visible) {
    return null
  }
  
  return (
    <div className="flex flex-col bg-black w-56 absolute top-8 py-5 border-2 border-gray-800">
      <div className="flex flex-col gap-4">
        <div className="text-center text-white hover:underline">
          Home
        </div>
        <div className="text-center text-white hover:underline">
          Series
        </div>
        <div className="text-center text-white hover:underline">
          New & Popular
        </div>
        <div className="text-center text-white hover:underline">
          My List
        </div>
        <div className="text-center text-white hover:underline">
          Browse by languages
        </div>
      </div>
    </div>
  )
}

export default MobileMenu