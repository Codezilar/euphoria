import mongoose from 'mongoose';

export interface ICart {
  userId: string; // Clerk user ID
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    index: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'carts',
});

// Create a compound unique index to prevent duplicate cart items
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Check if model exists before creating new one (for Next.js hot reload)
const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;