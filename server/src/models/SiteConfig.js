import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema(
  {
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    tiktokUrl: { type: String, default: '' },
    zaloUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    googleMapsUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('SiteConfig', siteConfigSchema);
