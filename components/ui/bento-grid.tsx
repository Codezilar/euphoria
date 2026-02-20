// /components/ui/bento-grid.tsx
"use client";

import { cn } from "@/lib/utils";
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

// Context for modal functionality
const BentoGridContext = createContext<{
  openModal: (item: any, index: number) => void;
  closeModal: () => void;
}>({
  openModal: () => {},
  closeModal: () => {},
});

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = (item: any, index: number) => {
    setModalContent({ ...item, index });
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalContent(null);
    }, 300);
    document.body.style.overflow = "auto";
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <BentoGridContext.Provider value={{ openModal, closeModal }}>
      <div className="relative">
        <div
          className={cn(
            "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[30rem] md:grid-cols-3",
            className,
          )}
        >
          {children}
        </div>

        {/* Modal for expanded view */}
        <AnimatePresence>
          {isModalOpen && modalContent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-lg"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                ref={modalRef}
                className="relative z-[60] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900"
              >
                <button
                  className="sticky top-4 right-4 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors z-50"
                  onClick={closeModal}
                >
                  <IconX className="h-6 w-6 text-neutral-900" />
                </button>

                <div className="p-4 md:p-10 space-y-6">
                  {/* Category */}
                  {modalContent.category && (
                    <span className="text-sm font-medium text-neutral-400">
                      {modalContent.category}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {modalContent.title}
                  </h2>

                  {/* Description */}
                  <p className="text-lg text-neutral-300">
                    {modalContent.description}
                  </p>

                  {/* Expanded Content */}
                  <div className="my-8">
                    {modalContent.expandedContent || (
                      <div className="space-y-6">
                        <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center p-8">
                              <h3 className="text-2xl font-bold text-white mb-4">Detailed View</h3>
                              <p className="text-neutral-300">
                                This is an expanded view of <span className="font-semibold text-white">{modalContent.title}</span>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </BentoGridContext.Provider>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  expandedContent,
  category,
  index = 0,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  expandedContent?: React.ReactNode;
  category?: string;
  index?: number;
}) => {
  const { openModal } = useContext(BentoGridContext);

  const handleClick = () => {
    openModal(
      {
        title,
        description,
        header,
        expandedContent,
        category,
      },
      index
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleClick}
      className={cn(
        "group/bento h-[30rem] row-span-1 flex flex-col justify-between space-y-4 rounded-xl border p-4 transition duration-200 hover:shadow-xl border-white/[0.2] bg-black shadow-none cursor-pointer",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        <div className="mt-2 mb-2 font-sans font-bold text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-300">
          {description}
        </div>
        {category && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-full">
              {category}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};