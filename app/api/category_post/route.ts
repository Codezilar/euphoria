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

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB directly
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;

    console.log('📨 Category submission received:', { title, description });

    // Validation
    if (!title || !description || !image) {
      return NextResponse.json(
        { message: 'Title, description, and image are required' },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
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

    console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);

    // Save to database
    const categoryData = {
      title: title.trim(),
      description: description.trim(),
      image: uploadResult.secure_url,
    };

    const result = await Category.create(categoryData);
    
    console.log('💾 Category saved to database:', result._id);

    return NextResponse.json(
      { 
        message: 'Category created successfully',
        category: result 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        message: 'Error creating category',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}