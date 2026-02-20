"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

type Categories = {
  description: string;
  title: string;
  image: string;
};

export const AnimatedTestimonials = ({
  categories,
  autoplay = false,
  loading,
}: {
  categories: Categories[];
  autoplay?: boolean;
  loading: boolean;
}) => {
  const [active, setActive] = useState(0);

  // ✅ FIXED: Reset active index when categories change
  useEffect(() => {
    setActive(0);
  }, [categories]);

  // ✅ FIXED: Added safety checks for empty categories
  const handleNext = () => {
    if (categories.length === 0) return;
    setActive((prev) => (prev + 1) % categories.length);
  };

  // ✅ FIXED: Added safety checks for empty categories
  const handlePrev = () => {
    if (categories.length === 0) return;
    setActive((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  // ✅ FIXED: Added categories.length dependency
  useEffect(() => {
    if (autoplay && categories.length > 0) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, categories.length]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  // ✅ FIXED: Added null check for categories[active]
  const activeCategory = categories[active];

  return (
    <div className="categories">
      <span className="categories_top">
        <span className="theme-gradient">All Categories</span>
        <p>
          Discover a world of pleasure, comfort, and self-expression. Our
          carefully selected categories help you explore at your own pace,
          offering trusted products that support both solo enjoyment and shared
          intimacy.
        </p>
      </span>

      {loading ? (
        <div className="animate-pulse flex flex-col items-center justify-center space-x-4">
          <div className="bg-gray-200 h-32 w-[70vw] rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-[70vw] mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-[70vw]"></div>
        </div>
      ) : // ✅ FIXED: Added empty state handling
      categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No categories available
        </div>
      ) : (
        <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
          <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
            <div>
              <div className="relative h-80 w-full">
                <AnimatePresence>
                  {categories.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.image}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: randomRotateY(),
                      }}
                      animate={{
                        opacity: isActive(index) ? 1 : 0.7,
                        scale: isActive(index) ? 1 : 0.95,
                        z: isActive(index) ? 0 : -100,
                        rotate: isActive(index) ? 0 : randomRotateY(),
                        zIndex: isActive(index)
                          ? 40
                          : categories.length + 2 - index,
                        y: isActive(index) ? [0, -80, 0] : 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: 100,
                        rotate: randomRotateY(),
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 origin-bottom"
                    >
                      <img
                        src={testimonial.image}
                        alt={testimonial.title}
                        width={500}
                        height={500}
                        draggable={false}
                        className="h-full w-full rounded-3xl object-cover object-center"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex flex-col justify-between py-4">
              <motion.div
                key={active}
                initial={{
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: -20,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                {/* ✅ FIXED: Safe access with activeCategory */}
                <h3 className="text-2xl font-bold text-white">
                  {activeCategory?.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-neutral-500">
                  {/* {activeCategory?.designation} */}
                </p>
                <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
                  {activeCategory?.description.split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{
                        filter: "blur(10px)",
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                        delay: 0.02 * index,
                      }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
              <div className="flex gap-4 pt-12 md:pt-0">
                <button
                  onClick={handlePrev}
                  className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                >
                  <IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
                </button>
                <button
                  onClick={handleNext}
                  className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                >
                  <IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};