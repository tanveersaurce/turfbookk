import React, { useState } from 'react';
import { Image as ImageIcon, Check, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdManager({ ads, handleCreateAd, handleToggleAd }) {
  const [adTitle, setAdTitle] = useState('');
  const [adImage, setAdImage] = useState('');
  const [adLink, setAdLink] = useState('#');
  const [adPlacement, setAdPlacement] = useState('Homepage Top');
  const [adSuccess, setAdSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!adTitle || !adImage) {
      alert('Please fill in required fields.');
      return;
    }
    setSubmitting(true);
    const success = await handleCreateAd({
      title: adTitle,
      imageUrl: adImage,
      linkUrl: adLink,
      placement: adPlacement
    });
    setSubmitting(false);

    if (success) {
      setAdSuccess(true);
      setAdTitle('');
      setAdImage('');
      setAdLink('#');
      setAdPlacement('Homepage Top');
      setTimeout(() => setAdSuccess(false), 3000);
    }
  };

  return (
    <motion.div
      key="ads"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Ad Creation Form */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-[#5D7A00]" />
            <span>Publish Banner Ad</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Post dynamic banners directly onto the home page.</p>
        </div>

        {adSuccess && (
          <div className="p-3 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs flex items-center space-x-2 font-bold animate-bounce">
            <Check className="w-4 h-4" />
            <span>Ad banner published!</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Banner Ad Title</label>
            <input 
              type="text" 
              placeholder="e.g. Monsoon Tournament Open!"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00] placeholder-slate-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Banner Image URL</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/.../ad.jpg"
              value={adImage}
              onChange={(e) => setAdImage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00] placeholder-slate-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ad Target Link</label>
            <input 
              type="text" 
              placeholder="e.g. # or URL link"
              value={adLink}
              onChange={(e) => setAdLink(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Placement Area</label>
            <select 
              value={adPlacement}
              onChange={(e) => setAdPlacement(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs text-slate-850 font-semibold focus:outline-none focus:border-[#5D7A00]"
            >
              <option>Homepage Top</option>
              <option>Homepage Mid Section</option>
              <option>Sidebar</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-[#AAEE00] font-black rounded-2xl text-xs transition-all shadow-[0_4px_12px_rgba(15,23,42,0.15)] uppercase tracking-wider"
          >
            {submitting ? 'Publishing...' : 'Publish Banner Now'}
          </button>
        </form>
      </div>

      {/* Active Ads List */}
      <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Active Ad Banners</h4>
          <p className="text-[10px] text-slate-400 font-medium">Banners currently rotated in placement frames.</p>
        </div>

        <div className="space-y-4">
          {ads.map(ad => (
            <div key={ad._id || ad.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5 min-w-0">
                <img src={ad.imageUrl} className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-800 truncate">{ad.title}</span>
                  <span className="block text-[10px] text-slate-450 font-semibold mt-0.5">Placement: {ad.placement}</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleAd(ad._id || ad.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                  ad.isActive 
                    ? 'bg-green-50 border-green-100 text-[#5D7A00]' 
                    : 'border-slate-200 text-slate-400 hover:text-slate-800'
                }`}
              >
                {ad.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}

          {ads.length === 0 && (
            <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-xs text-slate-400">No ad banners listed yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
