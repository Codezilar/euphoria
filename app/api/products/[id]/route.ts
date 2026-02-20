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

// Helper to parse the ID from the URL
async function getParams(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  return { id };
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Find the product first to get the image URLs
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      try {
        for (const imageUrl of product.images) {
          const publicId = imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`products/${publicId}`);
          }
        }
        console.log('🗑️ Product images deleted from Cloudinary');
      } catch (cloudinaryError) {
        console.warn('⚠️ Could not delete images from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary delete fails
      }
    }

    // Delete from database
    await Product.findByIdAndDelete(id);

    console.log('🗑️ Product deleted from database:', id);

    return NextResponse.json(
      { 
        success: true,
        message: 'Product deleted successfully'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error deleting product:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting product',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const body = await request.json();
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    .populate('categories', 'title image')
    .lean();

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Product updated successfully',
        product: {
          id: updatedProduct._id?.toString(),
          ...updatedProduct
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error updating product:', error);
    
    let errorMessage = 'Error updating product';
    if (error.code === 11000) {
      errorMessage = 'Product with this title already exists';
    } else if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map((err: any) => err.message).join(', ');
    }

    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

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
    const existingImagesJSON = formData.get('existingImages') as string;
    const imageFiles = formData.getAll('images') as File[];

    // Parse existing images
    const existingImages = existingImagesJSON ? JSON.parse(existingImagesJSON) : [];

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Get images to delete (old images not in existingImages)
    const imagesToDelete = existingProduct.images.filter(
      (img: string) => !existingImages.includes(img)
    );

    // Delete old images from Cloudinary
    for (const imageUrl of imagesToDelete) {
      try {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`products/${publicId}`);
        }
      } catch (error) {
        console.warn('Failed to delete image:', error);
      }
    }

    // Upload new images
    const newImageUrls: string[] = [];
    for (const imageFile of imageFiles) {
      if (imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'products',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;

        newImageUrls.push(uploadResult.secure_url);
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];

    // Parse categories
    const categories = categoriesJSON ? JSON.parse(categoriesJSON) : [];

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categories: categories.map((catId: string) => new mongoose.Types.ObjectId(catId)),
        images: allImages,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('categories', 'title image').lean();

    return NextResponse.json(
      { 
        success: true,
        message: 'Product updated successfully',
        product: {
          id: updatedProduct._id?.toString(),
          ...updatedProduct
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error updating product:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating product',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: any) {
  try {
    // Resolve params which may be a Promise in some Next.js typings
    const rawParams = context?.params;
    const params = rawParams && typeof (rawParams as any).then === 'function'
      ? await rawParams
      : rawParams;
    const id = params?.id || new URL(request.url).pathname.split('/').pop();

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Find product by ID
    const product = await Product.findById(id)
      .populate('categories', 'title image')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const transformed = {
      id: product._id.toString(),
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      images: product.images || [],
      categories: product.categories?.map((cat: any) => ({
        id: cat._id.toString(),
        title: cat.title,
        image: cat.image
      })) || [],
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    return NextResponse.json({ success: true, product: transformed }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error fetching product by id:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching product',
        error: error.message
      },
      { status: 500 }
    );
  }
}