'use client';
import React from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import type { ComponentType } from "react";
import { IconMap } from "./IconMap";

type NavModuleItem = {
  icon: ComponentType<{ className?: string; size?: number }>;
  link?: string;
  subModules?: NavModuleItem[];
  text: string;
};

interface NavModuleProps {
  isActiveModule: boolean;
  item: NavModuleItem;
  setIndex?: () => void;
  isSubModule?: boolean;
}

export function NavModule({ isActiveModule, item, setIndex, isSubModule = false }: NavModuleProps) {
  // ❌ We no longer need this line: const Icon = item.icon;
  const moduleLink = item.link;

  const RenderModules = () => (
    <div className={`flex items-center gap-5 ${isSubModule ? "ml-3" : ""}`}>
      {/* ✅ Use the IconMap component here */}
      <IconMap
        name={item.icon} // Pass the string name
        className={`text-[#FFAC50] group-hover/item:text-white transition-colors duration-200`}
        size={isSubModule ? 25 : 30}
      />
      <p
        className={`${
          isSubModule ? "text-[1rem]" : "text-[1.1rem]"
        } group-hover/item:text-white transition-colors duration-200`}
      >
        {item.text}
      </p>
    </div>
  );

  // ... (rest of your component logic remains the same)
  return (
    <div
      className="group/item flex items-center cursor-pointer gap-2 justify-between
                 hover:bg-[#FFAC50] transition-colors duration-150 px-3 py-1 pr-5"
      onClick={item.subModules ? setIndex : undefined}
    >
      {!item.subModules && moduleLink ? (
        <Link href={moduleLink} className="w-full">
          <RenderModules />
        </Link>
      ) : (
        <RenderModules />
      )}

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