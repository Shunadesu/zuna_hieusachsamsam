import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  title: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestInfo: {
      name: String,
      phone: String,
      email: String,
      address: String,
    },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'paid', 'shipping', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cod', 'direct'],
      default: 'bank_transfer',
    },
    paymentConfirmedAt: Date,
    paymentNote: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
