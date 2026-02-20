// /models/Product.ts
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  ratings: [{
    userId: String,
    rating: Number,
    review: String,
    createdAt: Date,
  }],
}, {
  timestamps: true,
});

// Virtual for average rating
ProductSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + (curr.rating ?? 0), 0);
  return sum / this.ratings.length;
});

// Virtual for total reviews
ProductSchema.virtual('totalReviews').get(function() {
  return this.ratings?.length || 0;
});

// Ensure virtuals are included when converting to JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);