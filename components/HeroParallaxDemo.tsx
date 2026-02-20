"use client";
import React, { useState } from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import type { Product } from "@/lib/products";
import { ProductDetailModal } from "@/components/ProductDetailModal"; // Import shared component

interface Category {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
}

interface ProductModal {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  price?: number;
  stock?: number;
  averageRating?: number;
  totalReviews?: number;
  categories?: Category[];
  images?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  ratings?: {
    userId: string;
    rating: number;
    review?: string;
    createdAt: Date;
  }[];
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  thumbnail?: string;
  src?: string;
  displayPrice?: string;
  stockStatus?: string;
  ratingDisplay?: string;
}

interface HeroParallaxDemoProps {
  products?: Product[]; // Make products optional
}

export function HeroParallaxDemo({ products = [] }: HeroParallaxDemoProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductModal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Transform products to HeroParallax format with full product data
  const heroProducts = (products || []).map(product => ({
    title: product.title || "Untitled Product",
    link: `/product/${product.id || 'demo'}`,
    thumbnail: product.images?.[0] || 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1000&auto=format&fit=crop',
    // Include full product data for modal
    fullProduct: product
  }));

  // If no products, use fallback
  const displayProducts = heroProducts.length > 0 ? heroProducts : defaultProducts;

  const handleProductClick = (product: any) => {
    // Use fullProduct if available, otherwise create a basic product object
    const fullProduct: ProductModal = product.fullProduct || {
      id: product.title?.toLowerCase()?.replace(/ /g, '-') || 'demo-product',
      _id: product.title?.toLowerCase()?.replace(/ /g, '-') || 'demo-product',
      title: product.title || "Untitled Product",
      description: "Premium quality product for ultimate pleasure and satisfaction. Designed with body-safe materials and advanced technology for enhanced user experience.",
      price: 99.99,
      displayPrice: "$99.99",
      stock: 10,
      stockStatus: "In Stock",
      averageRating: 4.5,
      totalReviews: 123,
      ratingDisplay: "4.5",
      images: [product.thumbnail],
      thumbnail: product.thumbnail,
      src: product.thumbnail,
      categories: [{ id: "1", title: "Premium", image: "" }],
      isFeatured: true,
      isActive: true,
      ratings: [],
      link: product.link,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedProduct(fullProduct);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <>
      <HeroParallax 
        products={displayProducts} 
        onProductClick={handleProductClick}
      />
      
      {/* Product Detail Modal - Using shared component */}
      {isDetailOpen && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          colorScheme="pink" // Using pink theme for HeroParallax
        />
      )}
    </>
  );
}

// Default products if none are provided
const defaultProducts = [
  {
    title: "Premium Luxury Vibrator",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Advanced Massage Wand",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Realistic Silicone Dildo",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "BDSM Exploration Kit",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Men's Pleasure Device",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Rechargeable Massager",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Body-Safe Collection",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Premium Accessories",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop",
  },
  {
    title: "Luxury Gift Set",
    link: "/products",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
  },
];