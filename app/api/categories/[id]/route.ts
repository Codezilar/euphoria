import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;

    console.log('📨 Category update received:', { id, title, description, hasNewImage: !!imageFile });

    // Validation for required fields
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Title and description are required' 
        },
        { status: 400 }
      );
    }

    // Find existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Category not found' 
        },
        { status: 404 }
      );
    }

    let imageUrl = existingCategory.image;
    
    // If a new image is provided, upload it to Cloudinary
    if (imageFile && imageFile.size > 0) {
      try {
        console.log('☁️ Uploading new image to Cloudinary...');
        
        // Convert File to buffer
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Delete old image from Cloudinary if it exists
        if (existingCategory.image) {
          try {
            const oldImageUrl = existingCategory.image;
            const publicId = oldImageUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
              await cloudinary.uploader.destroy(`categories/${publicId}`);
              console.log('🗑️ Old image deleted from Cloudinary');
            }
          } catch (deleteError) {
            console.warn('⚠️ Could not delete old image from Cloudinary:', deleteError);
            // Continue with upload even if delete fails
          }
        }
        
        // Upload new image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'categories',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;

        imageUrl = uploadResult.secure_url;
        console.log('✅ New image uploaded to Cloudinary:', imageUrl);
        
      } catch (uploadError: any) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to upload image to Cloudinary',
            error: uploadError.message 
          },
          { status: 500 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      title: title.trim(),
      description: description.trim(),
      image: imageUrl,
      updatedAt: new Date()
    };

    // Update category in database
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('title description image createdAt updatedAt').lean();

    console.log('💾 Category updated in database:', id);

    return NextResponse.json(
      { 
        success: true,
        message: imageFile ? 'Category updated with new image' : 'Category updated successfully',
        category: {
          id: updatedCategory._id?.toString(),
          ...updatedCategory
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error updating category:', error);
    
    let errorMessage = 'Error updating category';
    if (error.code === 11000) {
      errorMessage = 'Category with this title already exists';
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

// Also update your GET handler to match
export async function GET(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    // Get single category
    const category = await Category.findById(id)
      .select('title description image createdAt updatedAt')
      .lean();
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Transform data
    const transformedCategory = {
      id: category._id?.toString(),
      _id: category._id?.toString(),
      title: category.title,
      description: category.description,
      image: category.image,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(
      { 
        success: true,
        category: transformedCategory
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching category',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Find the category first to get the image URL
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it exists
    if (category.image) {
      try {
        const imageUrl = category.image;
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`categories/${publicId}`);
          console.log('🗑️ Image deleted from Cloudinary');
        }
      } catch (cloudinaryError) {
        console.warn('⚠️ Could not delete image from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary delete fails
      }
    }

    // Delete from database
    await Category.findByIdAndDelete(id);

    console.log('🗑️ Category deleted from database:', id);

    return NextResponse.json(
      { 
        success: true,
        message: 'Category deleted successfully'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error deleting category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting category',
        error: error.message 
      },
      { status: 500 }
    );
  }
}