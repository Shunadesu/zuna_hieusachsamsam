import mongoose from 'mongoose';

const sellRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookInfo: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'viewed', 'contacted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('SellRequest', sellRequestSchema);
