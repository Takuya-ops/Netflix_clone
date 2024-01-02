import React from "react";

interface NavBarItemProps {
  label: string
} 

const NavBarItem: React.FC<NavBarItemProps> = ({label}) => {
  return (
    <div className="flex text-white cursor-pointer hover:text-gray-300 transition">
      {label}
    </div>
  )
}

export default NavBarItem;