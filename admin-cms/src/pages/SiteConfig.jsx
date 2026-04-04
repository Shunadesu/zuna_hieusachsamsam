import { useState, useEffect } from 'react';
import {
  FiSave, FiCheck, FiFacebook, FiInstagram, FiPhone,
  FiMapPin, FiMessageCircle, FiMusic, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import { useSiteConfigStore } from '../store/useSiteConfigStore';
import api from '../services/api';

const BASE_INPUT =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition';

const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

const SOCIALS = [
  {
    key: 'facebookUrl',
    label: 'Facebook',
    placeholder: 'https://facebook.com/yourpage',
    Icon: FiFacebook,
    color: 'bg-[#1877f2]',
  },
  {
    key: 'instagramUrl',
    label: 'Instagram',
    placeholder: 'https://instagram.com/yourusername',
    Icon: FiInstagram,
    color: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]',
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@yourusername',
    Icon: FiMusic,
    color: 'bg-black',
  },
  {
    key: 'zaloUrl',
    label: 'Zalo',
    placeholder: 'https://zalo.me/yourid hoặc số Zalo',
    Icon: FiMessageCircle,
    color: 'bg-[#0068ff]',
  },
];

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

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig().then((c) => {
      if (c) {
        setForm({
          facebookUrl: c.facebookUrl || '',
          instagramUrl: c.instagramUrl || '',
          tiktokUrl: c.tiktokUrl || '',
          zaloUrl: c.zaloUrl || '',
          phone: c.phone || '',
          googleMapsUrl: c.googleMapsUrl || '',
        });
      }
    });
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

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.put('/api/site/config', form);
      invalidate();
      await fetchConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (!err?.silentAuthRedirect) setError(err.message || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[900px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Cấu hình site</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin liên hệ và mạng xã hội hiển thị trên trang chủ
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Social links */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-700">
            Mạng xã hội
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {SOCIALS.map(({ key, label, placeholder, Icon, color }) => (
              <label key={key} className={LABEL}>
                <span className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </span>
                <input
                  type="url"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  className={BASE_INPUT}
                  placeholder={placeholder}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-700">
            Liên hệ
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className={LABEL}>
              <span className="flex items-center gap-2 mb-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FiPhone className="h-3.5 w-3.5" />
                </span>
                Số điện thoại liên hệ
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className={BASE_INPUT}
                placeholder="0985 017 828"
              />
            </label>

            <label className={`${LABEL} sm:col-span-2`}>
              <span className="flex items-center gap-2 mb-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FiMapPin className="h-3.5 w-3.5" />
                </span>
                Google Maps (liên kết nhúng)
              </span>
              <input
                type="url"
                value={form.googleMapsUrl}
                onChange={(e) => setField('googleMapsUrl', e.target.value)}
                className={BASE_INPUT}
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="mt-1 text-xs text-slate-400">
                Dán URL nhúng iframe từ Google Maps để hiển thị bản đồ trên trang liên hệ
              </p>
            </label>
          </div>
        </div>

        {/* Preview summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tóm tắt cấu hình
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Facebook', value: form.facebookUrl, has: Boolean(form.facebookUrl) },
              { label: 'Instagram', value: form.instagramUrl, has: Boolean(form.instagramUrl) },
              { label: 'TikTok', value: form.tiktokUrl, has: Boolean(form.tiktokUrl) },
              { label: 'Zalo', value: form.zaloUrl, has: Boolean(form.zaloUrl) },
              { label: 'SĐT liên hệ', value: form.phone, has: Boolean(form.phone) },
              { label: 'Google Maps', value: form.googleMapsUrl, has: Boolean(form.googleMapsUrl) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.has ? (
                  <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <FiAlertCircle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                )}
                <span className={`text-xs ${item.has ? 'text-slate-700' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <FiCheck className="h-4 w-4" />
              Đã lưu
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
    </div>
  );
}
