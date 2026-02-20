"use client";
import React, { useState } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { ProductDetailModal } from "@/components/ProductDetailModal";

interface Category {
  _id: string;
  title: string;
  image?: string;
}

interface CardCategory {
  _id: string;
  title: string;
  image?: string;
}

interface CardProduct {
  id: string; 
  title: string;
  description: string;
  price: number;
  stock: number;
  categories: CardCategory[] | string[];
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

interface CardProps {
  products: any[];
}

export function Card({ products }: CardProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // If no products are provided, show a default/placeholder
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BackgroundGradient 
          className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-zinc-900"
          containerClassName="max-w-sm"
        >
          <img
            src={`/placeholder.png`}
            alt="No products"
            height="400"
            width="400"
            className="object-contain opacity-50"
          />
          <p className="text-base sm:text-xl mt-4 mb-2 text-neutral-200">
            No Products Available
          </p>
          <p className="text-sm text-neutral-400">
            There are no products in this category yet
          </p>
        </BackgroundGradient>
      </div>
    );
  }

  const handleProductClick = (product: any) => {
    // Convert to shared product format
    const sharedProduct = {
      _id: product.id,
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      displayPrice: `$${product.price.toFixed(2)}`,
      stock: product.stock,
      stockStatus: product.stock === 0 ? "Out of Stock" 
        : product.stock < 10 ? "Low Stock" 
        : "In Stock",
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      ratingDisplay: product.averageRating?.toFixed(1) || "0.0",
      images: product.images,
      image: product.images?.[0] || '/placeholder.png',
      src: product.images?.[0] || '/placeholder.png',
      categories: product.categories?.map((cat: any) => ({
        _id: cat._id,
        id: cat._id,
        title: cat.title,
        image: cat.image || ''
      })) || [],
      category: product.categories?.[0]?.title || "Uncategorized",
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      link: `/product/${product.id}`,
      ratings: []
    };
    
    setSelectedProduct(sharedProduct);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Our Products
          </h1>
          <p className="text-neutral-400">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      </div>

      {/* Product Detail Modal - Using shared component */}
      {isDetailOpen && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          colorScheme="purple"
        />
      )}
    </>
  );
}

// Individual Product Card Component
  const ProductCard = ({ 
  product, 
  onClick 
}: { 
  product: any;
  onClick: () => void;
}) => {
  const stockStatus = product.stock === 0 ? "Out of Stock" 
    : product.stock < 10 ? "Low Stock" 
    : "In Stock";

  return (
    <div 
      onClick={onClick}
      className="cursor-pointer transform transition-transform hover:scale-[1.02] duration-300"
    >
      <BackgroundGradient 
        className="rounded-[22px] h-full p-4 sm:p-6 bg-zinc-900 flex flex-col"
        containerClassName="h-full"
      >
        {/* Product Image */}
        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl">
          <img
            src={product.images?.[0] || `/2.png`}
            alt={product.title}
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              stockStatus === "In Stock" 
                ? "bg-emerald-600/20 text-emerald-400" 
                : stockStatus === "Low Stock"
                ? "bg-yellow-600/20 text-yellow-400"
                : "bg-red-600/20 text-red-400"
            }`}>
              {stockStatus}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-neutral-500">
                {product.categories[0]?.title || "Uncategorized"}
                {product.categories.length > 1 && ` +${product.categories.length - 1}`}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Rating (if available) */}
          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-4">
              <div className="flex text-yellow-400">
                {"★".repeat(Math.min(5, Math.round(product.averageRating)))}
                {"☆".repeat(Math.max(0, 5 - Math.round(product.averageRating)))}
              </div>
              <span className="text-sm text-neutral-500">
                {product.averageRating.toFixed(1)}
                {product.totalReviews && ` (${product.totalReviews})`}
              </span>
            </div>
          )}

          {/* Price and Stock */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-2xl font-bold text-white">
                ₦{product.price.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-neutral-500">
              {product.stock} in stock
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-neutral-800">
            <div className="text-center">
              <div className="text-xs text-neutral-500">Status</div>
              <div className={`text-sm font-medium ${product.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-500">Featured</div>
              <div className={`text-sm font-medium ${product.isFeatured ? 'text-purple-400' : 'text-neutral-500'}`}>
                {product.isFeatured ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-500">Click</div>
              <div className="text-sm font-medium text-blue-400">
                Details →
              </div>
            </div>
          </div>
        </div>
      </BackgroundGradient>
    </div>
  );
};