"use client"
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Image from "next/image";
import Link from "next/link";
import { Star, Minus, Plus, Check } from "lucide-react";
import { GiShoppingCart } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { ProductDetailModal } from "@/components/ProductDetailModal";

// Define the item interface to match your data structure
interface Category {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
}

interface Item {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  price?: number;
  stock?: number;
  stockStatus?: string;
  averageRating?: number;
  totalReviews?: number;
  categories?: Category[];
  displayPrice?: string;
  ratingDisplay?: string;
  src?: string;
  image?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  ratings?: {
    userId: string;
    rating: number;
    review?: string;
    createdAt: Date;
  }[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  content?: React.ReactNode;
}

interface BentoGridDemoProps {
  title: string;
  items?: Item[];
}

export function BentoGridDemo({ title, items = [] }: BentoGridDemoProps) {
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Use provided items or fallback to demo data
  const displayItems = items && items.length > 0 ? items : fallbackItems;
  const router = useRouter();

  const handleProductClick = (item: Item) => {
    // Normalize product id fields so ProductDetailModal receives a consistent `_id`
    const normalized: Item = {
      ...item,
      _id: item._id || item.id || item.src || item.link || undefined,
    };
    setSelectedProduct(normalized);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <div className="grider py-20">
      <div className="grider-top mb-12 text-center px-4">
        <span className="theme-gradient">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{title}</h2>
        </span>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Discover our exclusive collection of premium products. Click on any item to explore more details.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className={cn("mx-auto grid grid-cols-1 gap-4 md:auto-rows-[30rem] md:grid-cols-3")}>
          {displayItems.slice(0, 7).map((item, i) => (
            <div
              key={item.id || item._id || item.src || i}
              onClick={() => handleProductClick(item)}
              className={cn(
                i === 3 || i === 6 ? "md:col-span-2" : "",
                "hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              )}
            >
              <BentoGridItem
                title={item.title}
                description={
                  <div className="space-y-2">
                    {item.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2">{item.description}</p>
                    )}
                    {item.displayPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">{item.displayPrice}</span>
                        {item.stockStatus && (
                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              item.stockStatus === 'In Stock'
                                ? 'bg-green-900/50 text-green-300'
                                : item.stockStatus === 'Low Stock'
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-red-900/50 text-red-300'
                            )}
                          >
                            {item.stockStatus}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                }
                header={<ProductHeader src={item.image || item.src || "/placeholder.jpg"} alt={item.title} />}
                category={item.categories?.[0]?.title || "Premium"}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>

      {displayItems.length > 0 && (
        <div className="mt-12 text-center">
          <Link
            href={`/products?category=${encodeURIComponent(title.toLowerCase())}`}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Explore All {title}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      )}

      {/* Shared Product Detail Modal */}
      {isDetailOpen && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

// Product Header Component
const ProductHeader = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative w-full h-full min-h-[20rem] rounded-xl overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-pink-900/30 z-10" />
    <Image
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ objectFit: 'cover' }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
  </div>
);

// Demo content component
const DummyContent = () => (
  <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <p className="text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
      <span className="font-bold text-neutral-200">Premium Quality Products</span> Discover our curated collection of high-quality products designed for your ultimate satisfaction and pleasure.
    </p>
  </div>
);

// Fallback items for demo purposes
const fallbackItems: Item[] = [
  {
    id: "1",
    _id: "1",
    title: "Premium Luxury Vibrator",
    description: "Experience ultimate pleasure with our premium luxury vibrator designed for maximum satisfaction. Features multiple intensity settings and whisper-quiet operation.",
    price: 129.99,
    displayPrice: "$129.99",
    stock: 15,
    stockStatus: "In Stock",
    averageRating: 4.8,
    totalReviews: 142,
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    isActive: true,
    categories: [{ id: "1", title: "Vibrators" }],
    images: [
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=800&auto=format&fit=crop"
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    link: "/product/1"
  },
  {
    id: "2",
    _id: "2",
    title: "Professional Massage Wand",
    description: "Powerful massage wand designed for deep tissue relaxation and intimate pleasure. Cordless operation with adjustable speed settings.",
    price: 89.99,
    displayPrice: "$89.99",
    stock: 8,
    stockStatus: "Low Stock",
    averageRating: 4.6,
    totalReviews: 89,
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=800&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    isActive: true,
    categories: [{ id: "2", title: "Massagers" }],
    images: [
      "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=800&auto=format&fit=crop"
    ],
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T11:20:00Z",
    link: "/product/2"
  },
];
