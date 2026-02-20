import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const stock = formData.get('stock') as string;
    const categoriesJSON = formData.get('categories') as string;
    const imageFiles = formData.getAll('images') as File[];

    console.log('📨 Product submission received:', { 
      title, 
      description, 
      price,
      stock,
      categoriesCount: categoriesJSON ? JSON.parse(categoriesJSON).length : 0,
      imagesCount: imageFiles.length 
    });

    // Validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Title and description are required' 
        },
        { status: 400 }
      );
    }

    if (!price || parseFloat(price) <= 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Valid price is required (must be greater than 0)' 
        },
        { status: 400 }
      );
    }

    if (!categoriesJSON) {
      return NextResponse.json(
        { 
          success: false,
          message: 'At least one category is required' 
        },
        { status: 400 }
      );
    }

    const categories = JSON.parse(categoriesJSON);
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'At least one category is required' 
        },
        { status: 400 }
      );
    }

    // Validate that all category IDs exist
    const validCategories = await Category.find({ 
      _id: { $in: categories.map((id: string) => new mongoose.Types.ObjectId(id)) } 
    });
    
    if (validCategories.length !== categories.length) {
      return NextResponse.json(
        { 
          success: false,
          message: 'One or more selected categories are invalid' 
        },
        { status: 400 }
      );
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'At least one product image is required' 
        },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    
    for (const imageFile of imageFiles) {
      try {
        // Skip if file size is 0 (might be our dummy file from client)
        if (imageFile.size === 0) continue;
        
        console.log(`☁️ Uploading image ${imageUrls.length + 1} to Cloudinary...`);
        
        // Convert File to buffer
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'products',
              resource_type: 'auto',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;

        imageUrls.push(uploadResult.secure_url);
        console.log(`✅ Image uploaded: ${uploadResult.secure_url}`);
        
      } catch (uploadError: any) {
        console.error('❌ Cloudinary upload error:', uploadError);
        
        // Clean up any successfully uploaded images
        if (imageUrls.length > 0) {
          console.log('🧹 Cleaning up uploaded images due to error...');
          for (const imageUrl of imageUrls) {
            try {
              const publicId = imageUrl.split('/').pop()?.split('.')[0];
              if (publicId) {
                await cloudinary.uploader.destroy(`product_list/${publicId}`);
              }
            } catch (cleanupError) {
              console.warn('⚠️ Could not delete image during cleanup:', cleanupError);
            }
          }
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to upload product images',
            error: uploadError.message 
          },
          { status: 500 }
        );
      }
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No valid images were uploaded' 
        },
        { status: 400 }
      );
    }

    // Create product data
    const productData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categories: categories.map((id: string) => new mongoose.Types.ObjectId(id)),
      images: imageUrls,
      isActive: true,
      isFeatured: false,
    };

    console.log('💾 Creating product in database...', productData);

    // Save to database
    const result = await Product.create(productData);
    
    console.log('✅ Product saved to database:', result._id);

    // Populate category details for response
    const populatedProduct = await Product.findById(result._id)
      .populate('categories', 'title image')
      .lean();

    return NextResponse.json(
      { 
        success: true,
        message: 'Product created successfully',
        product: {
          id: populatedProduct._id?.toString(),
          ...populatedProduct
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Error creating product:', error);
    
    let errorMessage = 'Error creating product';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map((err: any) => err.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'Product with this title already exists';
    }

    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Get Product model
    const Product = (await import('@/models/Product')).default;
    const Category = (await import('@/models/Category')).default;

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const featured = url.searchParams.get('featured') === 'true';

    // Build query
    let query: any = { isActive: true };
    
    if (featured) {
      query.isFeatured = true;
    }

    // Fetch products - sort by newest first (most recent)
    const products = await Product.find(query)
      .populate('categories', 'title image')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .lean();

    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      categories: product.categories,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching products',
      products: []
    }, { status: 200 });
  }
}
