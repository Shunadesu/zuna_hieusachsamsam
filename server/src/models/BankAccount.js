import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    accountHolder: { type: String, required: true, trim: true },
    qrImage: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('BankAccount', bankAccountSchema);
