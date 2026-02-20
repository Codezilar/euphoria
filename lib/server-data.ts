// /lib/server-data.ts
// This file should ONLY be imported in Server Components

import { connectToDatabase } from './db';
import '@/models/Category';
import ProductModel from '@/models/Product';
import { getFiveProducts as getFiveProductsFromLib } from './products';
import type { Product } from './products';

// Re-export
export { getFiveProducts } from './products';

// Get products for InfiniteMenu - Enhanced with all product details
export async function getInfiniteMenuItems() {
  try {
    await connectToDatabase();
    
    // Fetch more products for better variety in the menu
    const products = await ProductModel.find({ 
      isActive: { $ne: false } 
    })
    .populate('categories')
    .sort({ createdAt: -1 })
    .limit(20) // Get up to 20 products for the menu
    .lean();
    
    if (products.length === 0) {
      return getFallbackInfiniteMenuItems();
    }
    
    return products.map((product: any) => {
      const averageRating = product.ratings && product.ratings.length > 0
        ? product.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / product.ratings.length
        : 0;
      
      const stockStatus = (product.stock ?? 0) === 0 ? "Out of Stock" 
        : (product.stock ?? 0) < 10 ? "Low Stock" 
        : "In Stock";
      
      const categoryTitle = product.categories?.[0]?.title || 'General';
      
      return {
        // Include all original fields
        _id: product._id.toString(),
        id: product._id.toString(),
        productId: product._id.toString(),
        category: categoryTitle,
        title: product.title,
        src: product.images?.[0] || getFallbackImage(categoryTitle),
        price: product.price,
        description: product.description,
        stock: product.stock ?? 0,
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        averageRating: averageRating,
        totalReviews: product.ratings?.length || 0,
        ratings: product.ratings || [],
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        categories: product.categories?.map((cat: any) => ({
          id: cat._id.toString(),
          _id: cat._id.toString(),
          title: cat.title,
          image: cat.image
        })) || [],
        images: product.images || [],
        link: `/product/${product._id}`,
        displayPrice: `$${product.price?.toFixed(2) || '0.00'}`,
        stockStatus: stockStatus,
        ratingDisplay: averageRating > 0 ? averageRating.toFixed(1) : 'No ratings',
        
        // InfiniteMenu specific fields
        image: product.images?.[0] || 'https://picsum.photos/300/300?grayscale',
        details: {
          materials: product.materials || [],
          features: product.features || [],
          care: product.care || []
        }
      };
    });
    
  } catch (error) {
    console.error('Error fetching InfiniteMenu items:', error);
    return getFallbackInfiniteMenuItems();
  }
}

// Get products by category
export async function getProductsByCategoryTitle(categoryTitle: string, limit: number = 6) {
  try {
    await connectToDatabase();
    
    const products = await ProductModel.find({
      isActive: { $ne: false }
    })
    .populate('categories')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
    
    const filteredProducts = products
      .filter(product => 
        product.categories?.some((category: any) => 
          category.title?.toLowerCase().includes(categoryTitle.toLowerCase()) ||
          categoryTitle.toLowerCase().includes(category.title?.toLowerCase() || '')
        )
      )
      .slice(0, limit);
    
    if (filteredProducts.length === 0) {
      return getFallbackData(categoryTitle, limit);
    }
    
    return filteredProducts.map((product: any) => {
      const averageRating = product.ratings && product.ratings.length > 0
        ? product.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / product.ratings.length
        : 0;
      
      const stockStatus = (product.stock ?? 0) === 0 ? "Out of Stock" 
        : (product.stock ?? 0) < 10 ? "Low Stock" 
        : "In Stock";
      
      return {
        _id: product._id.toString(),
        id: product._id.toString(),
        productId: product._id.toString(),
        category: product.categories?.[0]?.title || categoryTitle,
        title: product.title,
        src: product.images?.[0] || getFallbackImage(categoryTitle),
        price: product.price,
        description: product.description,
        stock: product.stock ?? 0,
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        averageRating: averageRating,
        totalReviews: product.ratings?.length || 0,
        ratings: product.ratings || [],
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        categories: product.categories?.map((cat: any) => ({
          id: cat._id.toString(),
          title: cat.title,
          image: cat.image
        })) || [],
        images: product.images || [],
        link: `/product/${product._id}`,
        displayPrice: `$${product.price?.toFixed(2) || '0.00'}`,
        stockStatus: stockStatus,
        ratingDisplay: averageRating > 0 ? averageRating.toFixed(1) : 'No ratings',
      };
    });
    
  } catch (error) {
    console.error(`Error fetching products for category "${categoryTitle}":`, error);
    return getFallbackData(categoryTitle, limit);
  }
}

// Get featured products
export async function getFeaturedProducts(limit: number = 15) {
  try {
    await connectToDatabase();
    
    let products = await ProductModel.find({ 
      isFeatured: true,
      isActive: { $ne: false }
    })
    .populate('categories')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
    if (products.length === 0) {
      products = await ProductModel.find({ isActive: { $ne: false } })
        .populate('categories')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }
    
    return products.map((product: any) => {
      const averageRating = product.ratings && product.ratings.length > 0
        ? product.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / product.ratings.length
        : 0;
      
      const stockStatus = (product.stock ?? 0) === 0 ? "Out of Stock" 
        : (product.stock ?? 0) < 10 ? "Low Stock" 
        : "In Stock";
      
      return {
        _id: product._id.toString(),
        id: product._id.toString(),
        productId: product._id.toString(),
        category: product.categories?.[0]?.title || 'Featured',
        title: product.title,
        src: product.images?.[0] || getFallbackImage('general'),
        price: product.price,
        description: product.description,
        stock: product.stock,
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        averageRating: averageRating,
        totalReviews: product.ratings?.length || 0,
        ratings: product.ratings || [],
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        categories: product.categories?.map((cat: any) => ({
          id: cat._id.toString(),
          title: cat.title,
          image: cat.image
        })) || [],
        images: product.images || [],
        link: `/product/${product._id}`,
        displayPrice: `$${product.price?.toFixed(2) || '0.00'}`,
        stockStatus: stockStatus,
        ratingDisplay: averageRating > 0 ? averageRating.toFixed(1) : 'No ratings',
      };
    });
    
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return getFallbackData('Featured', limit);
  }
}

// Helper function for InfiniteMenu fallback data
function getFallbackInfiniteMenuItems() {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564677320117-51b460312e8c?q=80&w=3387&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=3387&auto=format&fit=crop',
  ];
  
  const titles = [
    'Premium Lace Collection',
    'Silk Nightwear Set',
    'Luxury Bodysuit',
    'Elegant Lingerie',
    'Satin Kimono Robe',
    'Mesh Babydoll'
  ];
  
  const categories = ['Lingerie', 'Nightwear', 'Bodysuits', 'Lingerie', 'Robes', 'Babydolls'];
  
  return Array.from({ length: 6 }).map((_, index) => {
    const price = 99.99 + (index * 10);
    const averageRating = 4.5 + (index * 0.1);
    const stock = 15 - index;
    
    return {
      _id: `fallback-${index}`,
      id: `fallback-${index}`,
      productId: `fallback-${index}`,
      category: categories[index],
      title: titles[index],
      src: fallbackImages[index],
      price: price,
      description: `Premium quality ${categories[index].toLowerCase()} product for ultimate comfort and style.`,
      stock: stock,
      isFeatured: index < 3,
      isActive: true,
      averageRating: averageRating,
      totalReviews: 100 + (index * 20),
      ratings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: [{ id: `cat-${index}`, title: categories[index] }],
      images: [fallbackImages[index]],
      link: `/product/fallback-${index}`,
      displayPrice: `$${price.toFixed(2)}`,
      stockStatus: stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock",
      ratingDisplay: averageRating.toFixed(1),
      
      // InfiniteMenu specific fields
      image: fallbackImages[index],
      details: {
        materials: ["Premium fabric", "Stretch lace", "Silk lining"],
        features: ["Adjustable straps", "Convertible design", "Comfort fit"],
        care: ["Hand wash only", "Lay flat to dry", "Do not bleach"]
      }
    };
  });
}

// Helper functions (unchanged)
function getFallbackImage(categoryTitle: string): string {
  const categoryImages: Record<string, string> = {
    'vibrators': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop',
    'massagers': 'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop',
    'dildos': 'https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop',
    'bdsm': 'https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop',
    'lingerie': 'https://images.unsplash.com/photo-1564677320117-51b460312e8c?q=80&w=3387&auto=format&fit=crop',
    'lubricants': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=3387&auto=format&fit=crop',
    'couples': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=3387&auto=format&fit=crop',
    'general': 'https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop'
  };
  
  const lowerTitle = categoryTitle.toLowerCase();
  for (const [key, image] of Object.entries(categoryImages)) {
    if (lowerTitle.includes(key)) {
      return image;
    }
  }
  return 'https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop';
}

function getFallbackData(categoryTitle: string, limit: number) {
  const fallbackImages = [
    getFallbackImage(categoryTitle),
    'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop',
  ];
  
  const titles = [
    'Premium Luxury Edition',
    'Professional Series',
    'Ultimate Comfort Design',
    'Advanced Technology Model',
    'Elite Collection',
    'Signature Edition'
  ];
  
  return Array.from({ length: Math.min(limit, 6) }).map((_, index) => {
    const price = 99.99 + (index * 10);
    const stock = [15, 8, 25, 12, 0, 18][index];
    const averageRating = [4.7, 4.5, 4.8, 4.6, 4.9, 4.4][index];
    const totalReviews = [128, 89, 156, 72, 203, 45][index];
    const stockStatus = stock === 0 ? "Out of Stock" 
      : stock < 10 ? "Low Stock" 
      : "In Stock";
    const currentDate = new Date();
    
    return {
      _id: `fallback-${index}`,
      id: `fallback-${index}`,
      productId: `fallback-${index}`,
      category: categoryTitle,
      title: `${categoryTitle} ${titles[index % titles.length]}`,
      src: fallbackImages[index % fallbackImages.length],
      price: price,
      description: `Premium ${categoryTitle.toLowerCase()} product for ultimate pleasure and satisfaction.`,
      stock: stock,
      isFeatured: index % 2 === 0,
      isActive: true,
      averageRating: averageRating,
      totalReviews: totalReviews,
      ratings: [],
      createdAt: currentDate.toISOString(),
      updatedAt: currentDate.toISOString(),
      categories: [{ id: `cat-${index}`, title: categoryTitle }],
      images: [fallbackImages[index % fallbackImages.length]],
      link: `/products/fallback-${index}`,
      displayPrice: `$${price.toFixed(2)}`,
      stockStatus: stockStatus,
      ratingDisplay: averageRating.toFixed(1),
    };
  });
}