"use client";
import React, { createContext, useContext, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { IconX } from "@tabler/icons-react";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface Card {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

interface BackgroundGradientContextProps {
  onCardClose: (index: number) => void;
  currentIndex: number;
}

export const BackgroundGradientContext = createContext<BackgroundGradientContextProps>({
  onCardClose: () => {},
  currentIndex: 0,
});

interface BackgroundGradientProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  items?: React.ReactNode[];
  cards?: Card[];
}

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  items,
  cards,
}: BackgroundGradientProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  const handleCardClose = (index: number) => {
    setOpen(false);
    setCurrentIndex(index);
  };

  const handleOpen = () => {
    if (cards || items) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useOutsideClick(modalRef as any, () => handleClose());

  return (
    <BackgroundGradientContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className={cn("relative w-[full] p-[4px] group", containerClassName)}>
        <motion.div
          variants={animate ? variants : undefined}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
          transition={
            animate
              ? {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }
              : undefined
          }
          style={{
            backgroundSize: animate ? "400% 400%" : undefined,
          }}
          className={cn(
            "absolute w-[fit-content] inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
            "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
          )}
        />
        <motion.div
          variants={animate ? variants : undefined}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
          transition={
            animate
              ? {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }
              : undefined
          }
          style={{
            backgroundSize: animate ? "400% 400%" : undefined,
          }}
          className={cn(
            "absolute inset-0 rounded-3xl z-[1] will-change-transform",
            "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
          )}
        />

        <div 
          className={cn("relative z-10 cursor-pointer", className)} 
          onClick={handleOpen}
          ref={containerRef}
        >
          {children}
        </div>

        {/* Modal for card details */}
        <AnimatePresence>
          {open && (cards || items) && (
            <div className="fixed inset-0 z-50 h-screen overflow-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                ref={modalRef}
                className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl p-4 font-sans md:p-10 bg-zinc-900"
              >
                <button
                  className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white"
                  onClick={handleClose}
                >
                  <IconX className="h-6 w-6 text-neutral-900" />
                </button>
                
                {cards && cards[currentIndex] && (
                  <>
                    <motion.p
                      className="text-base font-medium text-white"
                    >
                      {cards[currentIndex].category}
                    </motion.p>
                    <motion.p
                      className="mt-4 text-2xl font-semibold md:text-5xl text-white"
                    >
                      {cards[currentIndex].title}
                    </motion.p>
                    <div className="py-10">{cards[currentIndex].content}</div>
                  </>
                )}
                
                {items && items[currentIndex]}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </BackgroundGradientContext.Provider>
  );
};