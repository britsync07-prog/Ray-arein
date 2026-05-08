import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, LogOut, Loader2, CheckCircle2, Edit3, XCircle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';

// Safe price formatter — handles number OR pre-formatted string from DB
const formatPrice = (price: any): string => {
  if (typeof price === 'string' && price.includes('৳')) return price;
  const num = Number(price);
  return isNaN(num) ? String(price) : `৳${num.toLocaleString()}`;
};

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyItem = {
    name: '',
    price: '',
    description: '',
    image: '',
    images: [] as string[],
    style: [] as string[],
    fabrics: [] as string[],
    type: '',
    stitchType: ''
  };

  const [newItem, setNewItem] = useState({ ...emptyItem });
  const [uploading, setUploading] = useState(false);

  /* ─── API helpers ─── */
  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : MOCK_PRODUCTS);
    } catch {
      setCollections(MOCK_PRODUCTS);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'X-Filename': encodeURIComponent(file.name) },
        body: file
      });
      const data = await res.json();
      if (data.url) {
        setNewItem(prev => ({
          ...prev,
          images: [...prev.images, data.url],
          image: prev.image || data.url
        }));
      } else {
        alert('Upload failed: no URL returned');
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const checkAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsLoggedIn(true);
        localStorage.setItem('admin_token', password);
        fetchCollections();
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection failed — check your network');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.image) return alert('Please upload at least one image.');
    const token = localStorage.getItem('admin_token') || '';
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/collections?id=${editingId}` : '/api/collections';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        setNewItem({ ...emptyItem });
        setEditingId(null);
        fetchCollections();
      } else {
        alert('Save failed — check the API response');
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(`/api/collections?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) fetchCollections();
      else alert('Delete failed');
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    // Safely parse price — strip currency symbol
    const rawPrice = String(item.price).replace(/[৳,\s]/g, '');
    // Safely parse images — handle both array and JSON string
    let gallery: string[] = [];
    if (Array.isArray(item.images)) gallery = item.images;
    else if (typeof item.images === 'string') {
      try { gallery = JSON.parse(item.images); } catch { gallery = [item.image]; }
    } else {
      gallery = item.image ? [item.image] : [];
    }
    setNewItem({
      name: item.name || '',
      price: rawPrice,
      description: item.description || '',
      image: item.image || '',
      images: gallery,
      style: Array.isArray(item.style) ? item.style : [],
      fabrics: Array.isArray(item.fabrics) ? item.fabrics : [],
      type: item.type || '',
      stitchType: item.stitchType || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewItem({ ...emptyItem });
  };

  const removeImage = (urlToRemove: string) => {
    setNewItem(prev => {
      const newImages = prev.images.filter(u => u !== urlToRemove);
      return {
        ...prev,
        images: newImages,
        image: prev.image === urlToRemove ? (newImages[0] || '') : prev.image
      };
    });
  };

  /* ─── Auto-login from saved token ─── */
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setPassword(token);
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: token })
      })
        .then(res => {
          if (res.ok) { setIsLoggedIn(true); fetchCollections(); }
          else localStorage.removeItem('admin_token');
        })
        .catch(() => localStorage.removeItem('admin_token'));
    }
  }, []);

  /* ─── Login screen ─── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 border border-zinc-200 w-full max-w-md"
        >
          <h1 className="font-serif text-2xl mb-6 text-center text-zinc-900">Admin Login</h1>
          <form onSubmit={checkAuth} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full px-4 py-3 border border-zinc-200 focus:outline-none focus:border-black"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 hover:bg-zinc-800 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enter Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-3xl">Dashboard</h1>
            <a
              href="/"
              className="text-sm text-zinc-500 hover:text-black transition-colors border-l border-zinc-300 pl-4 ml-2"
            >
              View Website
            </a>
          </div>
          <button
            onClick={() => { setIsLoggedIn(false); localStorage.removeItem('admin_token'); }}
            className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Add / Edit Form ── */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-zinc-200 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl">{editingId ? 'Edit Product' : 'Add New Item'}</h2>
                {editingId && (
                  <button onClick={cancelEdit} className="text-zinc-400 hover:text-black transition-colors">
                    <XCircle size={20} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {/* Name */}
                <input
                  placeholder="Item Name"
                  className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />

                {/* Price */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">৳</span>
                  <input
                    placeholder="Price (e.g. 13500)"
                    className="w-full pl-8 pr-4 py-2 border border-zinc-200 focus:outline-none focus:border-black"
                    value={newItem.price}
                    onChange={e => setNewItem({ ...newItem, price: e.target.value.replace(/[^0-9.]/g, '') })}
                    required
                  />
                </div>

                {/* Image Gallery */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Gallery (Primary = Black Border)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {newItem.images.map((url, i) => (
                      <div key={i} className="relative aspect-square group">
                        <img
                          src={url}
                          className={`w-full h-full object-cover border-2 ${newItem.image === url ? 'border-black' : 'border-transparent'}`}
                          alt={`img-${i}`}
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                          <button type="button" onClick={() => setNewItem({ ...newItem, image: url })} className="text-[10px] text-white uppercase font-bold hover:underline">
                            Front
                          </button>
                          <button type="button" onClick={() => removeImage(url)} className="text-[10px] text-red-400 uppercase font-bold hover:underline">
                            Delete
                          </button>
                        </div>
                        {newItem.image === url && (
                          <div className="absolute top-1 right-1 bg-black text-white p-0.5 rounded-full">
                            <CheckCircle2 size={10} />
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="relative aspect-square border-2 border-dashed border-zinc-200 flex items-center justify-center hover:border-black transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {uploading ? <Loader2 size={16} className="animate-spin text-zinc-900" /> : <Plus size={16} className="text-zinc-400" />}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <textarea
                  placeholder="Description"
                  className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black h-28 text-sm leading-relaxed"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                />

                {/* Categories */}
                <div className="space-y-4 pt-2 border-t border-zinc-100">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Style */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Style</label>
                      {['Original Pakistani', 'Inspired Pakistani'].map(s => (
                        <label key={s} className="flex items-center gap-2 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={newItem.style.includes(s)}
                            onChange={() => {
                              const next = newItem.style.includes(s)
                                ? newItem.style.filter(v => v !== s)
                                : [...newItem.style, s];
                              setNewItem({ ...newItem, style: next });
                            }}
                          />
                          <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${newItem.style.includes(s) ? 'bg-black border-black' : 'border-zinc-200 group-hover:border-black'}`}>
                            {newItem.style.includes(s) && <Plus size={10} className="text-white rotate-45" />}
                          </div>
                          <span className="text-zinc-600 group-hover:text-black transition-colors">{s}</span>
                        </label>
                      ))}
                    </div>

                    {/* Fabric */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Fabric</label>
                      {['Organza', 'Chiffon', 'Cotton'].map(f => (
                        <label key={f} className="flex items-center gap-2 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={newItem.fabrics.includes(f)}
                            onChange={() => {
                              const next = newItem.fabrics.includes(f)
                                ? newItem.fabrics.filter(v => v !== f)
                                : [...newItem.fabrics, f];
                              setNewItem({ ...newItem, fabrics: next });
                            }}
                          />
                          <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${newItem.fabrics.includes(f) ? 'bg-black border-black' : 'border-zinc-200 group-hover:border-black'}`}>
                            {newItem.fabrics.includes(f) && <Plus size={10} className="text-white rotate-45" />}
                          </div>
                          <span className="text-zinc-600 group-hover:text-black transition-colors">{f}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Type */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Type</label>
                      <select
                        className="w-full px-3 py-2 border border-zinc-200 text-sm focus:outline-none focus:border-black bg-white"
                        value={newItem.type}
                        onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                      >
                        <option value="">Select Type</option>
                        <option value="Gown">Gown</option>
                        <option value="Kamiz">Kamiz</option>
                      </select>
                    </div>

                    {/* Stitch */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Stitch</label>
                      <select
                        className="w-full px-3 py-2 border border-zinc-200 text-sm focus:outline-none focus:border-black bg-white"
                        value={newItem.stitchType}
                        onChange={e => setNewItem({ ...newItem, stitchType: e.target.value })}
                      >
                        <option value="">Select Stitch</option>
                        <option value="Ready Made">Ready Made</option>
                        <option value="Unstitched">Unstitched</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  disabled={uploading || !newItem.image}
                  className="w-full bg-black text-white py-3 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                  {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                  {uploading ? 'Uploading...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </div>
          </div>

          {/* ── Product Table ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 overflow-hidden">
              {collections.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 font-serif text-lg">No products found</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Item</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Categories</th>
                      <th className="px-6 py-4 font-medium text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {collections.map(item => (
                      <tr
                        key={item.id}
                        className={`hover:bg-zinc-50/50 transition-colors ${editingId === item.id ? 'bg-amber-50/50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image}
                              className="w-10 h-14 object-cover bg-zinc-100 flex-shrink-0"
                              alt={item.name}
                            />
                            <div>
                              <p className="font-medium text-zinc-900 text-sm">{item.name}</p>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-tighter mt-0.5">ID: {item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 font-medium text-sm">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(item.fabrics) && item.fabrics.map((f: string) => (
                              <span key={f} className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] uppercase tracking-wider rounded">{f}</span>
                            ))}
                            {item.type && (
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] uppercase tracking-wider rounded">{item.type}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => startEdit(item)}
                              title="Edit"
                              className="text-zinc-400 hover:text-black transition-colors"
                            >
                              <Edit3 size={17} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete"
                              className="text-zinc-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
