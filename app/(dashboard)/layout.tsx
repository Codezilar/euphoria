"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { links } from "@/data";
import Image from "next/image";
import "./admin.css"
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

const RootLayout = ({children}: Readonly<{ children: React.ReactNode;}>) => {
  
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;

  return (
    <div
      className={cn(
        "mx-auto h-full flex w-full flex-1 flex-col overflow-hidden rounded-md border  md:flex-row border-neutral-700 bg-neutral-800",
        "h-[100vh]", // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: `${fullName}`,
                href: "#",
                icon: (
                  <UserButton />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border p-2 md:p-10 border-neutral-700 bg-neutral-900 overflow-y-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="/admin"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image src={'/logo.png'} height={50} width={50} alt="logo" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-white"
      >

        EUPHORIA
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="/admin"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image src={'/logo.png'} height={50} width={50} alt="logo" />
    </a>
  );
};

// Dummy dashboard component with content


export default RootLayout