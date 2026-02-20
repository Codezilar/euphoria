"use client";

import React, { useState } from "react";
import { Carousel, Carding } from "@/components/ui/apple-cards-carousel";
import Link from "next/link";
import { ProductDetailModal } from "@/components/ProductDetailModal"; 

interface Category {
  _id?: string;
  id: string;
  title: string;
  image?: string;
}

interface CardData {
  _id?: string;
  id?: string;
  category: string;
  title: string;
  src: string;
  content?: React.ReactNode;
  productId?: string;
  price?: number;
  description?: string;
  stock?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  categories?: Category[];
  images?: string[];
  displayPrice?: string;
  stockStatus?: string;
  ratingDisplay?: string;
  ratings?: {
    userId: string;
    rating: number;
    review?: string;
    createdAt: Date;
  }[];
}

interface AppleCardsCarouselDemoProps {
  title: string;
  items?: CardData[];
}

export function AppleCardsCarouselDemo({ title, items }: AppleCardsCarouselDemoProps) {
  const [selectedProduct, setSelectedProduct] = useState<CardData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Use provided items or fallback to demo data
  const displayItems = items && items.length > 0 ? items : data;
  
  const handleProductClick = (product: CardData) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <>
      <div className="w-full h-full py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-5xl font-bold text-neutral-200 font-sans mb-8">
            {title}
          </h2>
          {displayItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 text-lg">
                No products found in this category. Check back soon!
              </p>
            </div>
          ) : (
            <div className="relative">
              <Carousel 
                items={displayItems.map((item, index) => (
                  <EnhancedCarding 
                    key={item._id || item.id || item.productId || item.src || index} 
                    card={{ ...item, content: item.content ?? <DummyContent /> }} 
                    index={index}
                    onClick={() => handleProductClick(item)}
                  />
                ))} 
              />
            </div>
          )}
          {displayItems.length > 0 && (
            <div className="mt-12 text-center">
              <Link 
                href={`/products?category=${encodeURIComponent(title.toLowerCase())}`}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                View All {title}
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal - Now using shared component */}
      {isDetailOpen && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          colorScheme="pink"
        />
      )}
    </>
  );
}

// Enhanced Carding component (keep as is)
const EnhancedCarding = ({ 
  card, 
  index,
  onClick 
}: { 
  card: CardData;
  index: number;
  onClick: () => void;
}) => {
  return (
    <div onClick={onClick} className="cursor-pointer transform transition-transform hover:scale-[1.02] duration-300">
      <Carding 
        card={{ ...card, content: card.content ?? <DummyContent /> }} 
        index={index}
        layout={false}
      />
    </div>
  );
};

// Demo content component (keep as is)
const DummyContent = () => {
  return (
    <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-200">
          Premium Quality Products
        </span>{" "}
        Discover our curated collection of high-quality products designed for your ultimate satisfaction and pleasure. Each item is carefully selected to ensure premium performance and exceptional user experience.
      </p>
    </div>
  );
};

// Fallback demo data (keep as is)
const data: CardData[] = [
  {
    category: "Accessories",
    title: "Premium Lubricant",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=800&auto=format&fit=crop",
    content: <DummyContent />,
    productId: "demo-5",
    price: 24.99,
    description: "Water-based premium lubricant, safe for all toy materials. Long-lasting, non-sticky formula for enhanced comfort.",
    stock: 0,
    isFeatured: false,
    isActive: true,
    averageRating: 4.9,
    totalReviews: 203,
    link: "/products/demo-5",
    images: [
      "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=800&auto=format&fit=crop"
    ],
    displayPrice: "$24.99",
    stockStatus: "Out of Stock",
    ratingDisplay: "4.9",
    categories: [
      { id: "9", title: "Accessories", image: "" },
      { id: "10", title: "Lubricants", image: "" }
    ]
  },
];