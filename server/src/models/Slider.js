import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    link: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Slider', sliderSchema);
