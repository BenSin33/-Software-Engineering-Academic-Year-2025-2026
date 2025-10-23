'use client'; // Rất quan trọng, phải ở đầu file

import React from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { IconMap } from "./IconMap"; // Import component IconMap

// Định nghĩa kiểu dữ liệu cho một mục trong menu
type NavItem = {
  icon: string; // Tên icon là một chuỗi
  link?: string;
  text: string;
  subModules?: NavItem[]; // subModules cũng là một mảng các NavItem
};

// Định nghĩa props cho component
type NavModuleProps = {
  isActiveModule: boolean;
  item: NavItem;
  setIndex?: () => void; // Sử dụng () => void cho setIndex
  isSubModule?: boolean;
};

export function NavModule({
  isActiveModule,
  item,
  setIndex,
  isSubModule = false,
}: NavModuleProps) {
  const moduleLink = item.link;

  // Component con để render icon và text, tránh lặp code
  const RenderModules = () => (
    <div className={`flex items-center gap-5 ${isSubModule ? "ml-3" : ""}`}>
      <IconMap
        name={item.icon} // Dùng IconMap để render icon từ tên
        className="text-[#FFAC50] group-hover/item:text-white transition-colors duration-200"
        size={isSubModule ? 25 : 30}
      />
      <p className={`${
          isSubModule ? "text-[1rem]" : "text-[1.1rem]"
        } group-hover/item:text-white transition-colors duration-200`}
      >
        {item.text}
      </p>
    </div>
  );

  return (
    <div
      className="group/item flex items-center cursor-pointer gap-2 justify-between 
                 hover:bg-[#FFAC50] transition-colors duration-150 px-3 py-1 pr-5"
      onClick={item.subModules ? setIndex : undefined}
    >
      {/* Nếu không có subModules và có link thì render thẻ Link */}
      {!item.subModules && moduleLink ? (
        <Link href={moduleLink} className="w-full">
          <RenderModules />
        </Link>
      ) : (
        // Ngược lại, render div bình thường
        <RenderModules />
      )}

      {/* Hiển thị mũi tên nếu có subModules */}
      {item.subModules && (
        <HiArrowRight
          className={`text-[#FFAC50] group-hover/item:text-white ${
            isActiveModule ? "rotate-90" : ""
          } transition-transform duration-500`}
          size={25}
        />
      )}
    </div>
  );
}