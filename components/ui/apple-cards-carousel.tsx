"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: ReactNode[];
  initialScroll?: number;
}

// Updated Card type to include all product data
export interface Card {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
  productId?: string;
  price?: number;
  description?: string;
  stock?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  ratings?: any[];
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  categories?: Array<{ id: string; title: string; image?: string }>;
  images?: string[];
  displayPrice?: string;
  stockStatus?: string;
  ratingDisplay?: string;
}

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384;
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l from-neutral-900 to-transparent",
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "mx-auto max-w-7xl",
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  } as any,
                }}
                key={"card" + index}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Carding = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef as any, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
    setSelectedImageIndex(0);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const handleImageClick = (imgIndex: number) => {
    setSelectedImageIndex(imgIndex);
  };

  // Get all images from card
  const allImages = card.images || [card.src];

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl p-4 font-sans md:p-10 bg-neutral-900"
            >
              <button
                className="sticky top-4 right-4 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors z-50"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-900" />
              </button>
              
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold md:text-4xl text-white"
              >
                {card.title}
              </motion.p>
              
              {/* Image Gallery */}
              <div className="py-6 space-y-6">
                {/* Main Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-800">
                  <img
                    src={allImages[selectedImageIndex]}
                    alt={`${card.title} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                    Image {selectedImageIndex + 1} of {allImages.length}
                  </div>
                </div>
                
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">View all images:</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {allImages.map((img, imgIndex) => (
                        <button
                          key={imgIndex}
                          onClick={() => handleImageClick(imgIndex)}
                          className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === imgIndex 
                              ? 'border-pink-500 ring-2 ring-pink-500/30' 
                              : 'border-transparent hover:border-gray-500'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${card.title} thumbnail ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                            {imgIndex + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="py-6">
                {card.content}
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-neutral-700">
                {/* Left Column */}
                <div className="space-y-4">
                  {card.price && (
                    <div className="bg-neutral-800 p-4 rounded-xl">
                      <h4 className="font-semibold text-white mb-2">Pricing</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">${card.price.toFixed(2)}</span>
                        {card.stockStatus && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            card.stockStatus === 'In Stock' ? 'bg-green-900 text-green-300' :
                            card.stockStatus === 'Low Stock' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {card.stockStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {card.description && (
                    <div className="bg-neutral-800 p-4 rounded-xl">
                      <h4 className="font-semibold text-white mb-2">Description</h4>
                      <p className="text-gray-300 text-sm line-clamp-4">{card.description}</p>
                    </div>
                  )}
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  {card.categories && card.categories.length > 0 && (
                    <div className="bg-neutral-800 p-4 rounded-xl">
                      <h4 className="font-semibold text-white mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {card.categories.map((cat, catIndex) => (
                          <span 
                            key={catIndex} 
                            className="px-2 py-1 bg-neutral-700 text-gray-200 text-xs rounded-full"
                          >
                            {cat.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {card.ratingDisplay && card.ratingDisplay !== 'No ratings' && (
                    <div className="bg-neutral-800 p-4 rounded-xl">
                      <h4 className="font-semibold text-white mb-2">Rating</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{card.ratingDisplay}/5</span>
                        <span className="text-gray-400 text-sm">
                          ({card.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              {card.link && (
                <div className="mt-6 pt-6 border-t border-neutral-700">
                  <a
                    href={card.link}
                    className="inline-flex items-center justify-center w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full transition-colors duration-200"
                  >
                    View Product Details
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl md:h-[40rem] md:w-96 bg-neutral-900 hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-white md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl"
          >
            {card.title}
          </motion.p>
          
          {/* Price on card */}
          {card.displayPrice && (
            <div className="mt-4">
              <span className="text-2xl font-bold text-white">{card.displayPrice}</span>
            </div>
          )}
          
          {/* Stock status on card */}
          {card.stockStatus && (
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                card.stockStatus === 'In Stock' ? 'bg-green-500' : 
                card.stockStatus === 'Low Stock' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} />
              <span className="text-sm text-gray-300">{card.stockStatus}</span>
            </div>
          )}
          
          {/* Rating on card */}
          {card.ratingDisplay && card.ratingDisplay !== 'No ratings' && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-white text-sm">{card.ratingDisplay}</span>
              {card.totalReviews && (
                <span className="text-gray-400 text-sm ml-1">({card.totalReviews})</span>
              )}
            </div>
          )}
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          className="absolute inset-0 z-10 object-cover w-full h-full"
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: any) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <img
      className={cn(
        "h-full w-full transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src as string}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      alt={alt ? alt : "Product image"}
      {...rest}
    />
  );
};

// Export as object
export const AppleCardsCarousel = {
  Carousel,
  Carding,
  BlurImage,
};

// Default export
export default AppleCardsCarousel;