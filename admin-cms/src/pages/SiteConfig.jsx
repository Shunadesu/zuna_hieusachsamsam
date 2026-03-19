import { useState, useEffect } from 'react';
import { useSiteConfigStore } from '../store/useSiteConfigStore';
import api from '../services/api';

const inputCls = 'block w-full px-3 py-2 rounded border border-gray-300 mt-1 text-sm';

export default function SiteConfig() {
  const { config, fetchConfig, invalidate } = useSiteConfigStore();
  const [form, setForm] = useState({
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    zaloUrl: '',
    phone: '',
    googleMapsUrl: '',
  });

  useEffect(() => {
    fetchConfig().then(
      (c) =>
        c &&
        setForm({
          facebookUrl: c.facebookUrl || '',
          instagramUrl: c.instagramUrl || '',
          tiktokUrl: c.tiktokUrl || '',
          zaloUrl: c.zaloUrl || '',
          phone: c.phone || '',
          googleMapsUrl: c.googleMapsUrl || '',
        }),
    );
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setForm({
        facebookUrl: config.facebookUrl || '',
        instagramUrl: config.instagramUrl || '',
        tiktokUrl: config.tiktokUrl || '',
        zaloUrl: config.zaloUrl || '',
        phone: config.phone || '',
        googleMapsUrl: config.googleMapsUrl || '',
      });
    }
  }, [config]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/site/config', form);
      invalidate();
      fetchConfig();
      alert('Đã lưu cấu hình.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Cấu hình site</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="text-gray-700">
            Facebook
            <input
              type="url"
              value={form.facebookUrl}
              onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://facebook.com/..."
            />
          </label>
          <label className="text-gray-700">
            Instagram
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://instagram.com/..."
            />
          </label>
          <label className="text-gray-700">
            TikTok
            <input
              type="url"
              value={form.tiktokUrl}
              onChange={(e) => setForm((f) => ({ ...f, tiktokUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://www.tiktok.com/@..."
            />
          </label>
          <label className="text-gray-700">
            Zalo
            <input
              type="text"
              value={form.zaloUrl}
              onChange={(e) => setForm((f) => ({ ...f, zaloUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://zalo.me/... hoặc 098xxxxxxx"
            />
          </label>
          <label className="text-gray-700">
            Liên hệ ngay (Phone)
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputCls}
              placeholder="0985017828"
            />
          </label>
          <label className="text-gray-700 md:col-span-2">
            Google Maps
            <input
              type="url"
              value={form.googleMapsUrl}
              onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))}
              className={inputCls}
              placeholder="URL nhúng Google Maps"
            />
          </label>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer font-semibold hover:bg-gray-600"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
