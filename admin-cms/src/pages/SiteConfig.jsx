import { useState, useEffect } from 'react';
import { useSiteConfigStore } from '../store/useSiteConfigStore';
import api from '../services/api';

export default function SiteConfig() {
  const { config, fetchConfig, invalidate } = useSiteConfigStore();
  const [form, setForm] = useState({ facebookUrl: '', instagramUrl: '', tiktokUrl: '', googleMapsUrl: '' });

  useEffect(() => {
    fetchConfig().then((c) => c && setForm({ facebookUrl: c.facebookUrl || '', instagramUrl: c.instagramUrl || '', tiktokUrl: c.tiktokUrl || '', googleMapsUrl: c.googleMapsUrl || '' }));
  }, [fetchConfig]);

  useEffect(() => {
    if (config) setForm({ facebookUrl: config.facebookUrl || '', instagramUrl: config.instagramUrl || '', tiktokUrl: config.tiktokUrl || '', googleMapsUrl: config.googleMapsUrl || '' });
  }, [config]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/site/config', form);
      invalidate();
      fetchConfig();
    } catch (err) {
      alert(err.message);
    }
  };

  const inputCls = 'block w-full px-3 py-2 rounded border border-gray-300 mt-1';
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Cấu hình site</h1>
      <form onSubmit={handleSave} className="max-w-[500px] flex flex-col gap-4">
        <label className="text-gray-700">Facebook URL <input type="url" value={form.facebookUrl} onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))} className={inputCls} /></label>
        <label className="text-gray-700">Instagram URL <input type="url" value={form.instagramUrl} onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))} className={inputCls} /></label>
        <label className="text-gray-700">TikTok URL <input type="url" value={form.tiktokUrl} onChange={(e) => setForm((f) => ({ ...f, tiktokUrl: e.target.value }))} className={inputCls} /></label>
        <label className="text-gray-700">Google Maps URL <input type="url" value={form.googleMapsUrl} onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))} className={inputCls} /></label>
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer font-semibold">Lưu</button>
      </form>
    </div>
  );
}
