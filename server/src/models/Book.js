import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    image: { type: String, default: '' },
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    quantityType: { type: String, enum: ['book', 'set'], default: 'book' },
    status: { type: String, enum: ['available', 'out_of_stock', 'sold'], default: 'available' },
    isHot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);
