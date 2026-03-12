import SiteConfig from '../models/SiteConfig.js';

async function getOrCreateConfig() {
  let config = await SiteConfig.findOne();
  if (!config) config = await SiteConfig.create({});
  return config;
}

export async function getConfig(req, res) {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateConfig(req, res) {
  try {
    const config = await getOrCreateConfig();
    const { facebookUrl, instagramUrl, tiktokUrl, googleMapsUrl } = req.body;
    if (facebookUrl !== undefined) config.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) config.instagramUrl = instagramUrl;
    if (tiktokUrl !== undefined) config.tiktokUrl = tiktokUrl;
    if (googleMapsUrl !== undefined) config.googleMapsUrl = googleMapsUrl;
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
