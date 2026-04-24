import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, LogOut, Loader2, CheckCircle2, Edit3, XCircle } from 'lucide-react';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    image: '', // Primary
    images: [] as string[] // Gallery
  });

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-Filename': encodeURIComponent(file.name)
        },
        body: file 
      });
      
      const data = await res.json();
      if (data.url) {
        setNewItem(prev => ({ 
            ...prev, 
            images: [...prev.images, data.url],
            image: prev.image || data.url
        }));
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
      } else setError('Invalid password');
    } catch (err) { setError('Connection failed'); }
    finally { setLoading(false); }
  };

  const fetchCollections = async () => {
    const res = await fetch('/api/collections');
    const data = await res.json();
    setCollections(data);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.image) return alert("Please upload at least one image.");
    const token = localStorage.getItem('admin_token');
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/collections?id=${editingId}` : '/api/collections';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        setNewItem({ name: '', price: '', description: '', image: '', images: [] });
        setEditingId(null);
        fetchCollections();
      }
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    let gallery = [];
    try {
        gallery = JSON.parse(item.images || "[]");
    } catch(e) {
        gallery = [item.image];
    }
    setNewItem({
        name: item.name,
        price: item.price.replace('৳', ''),
        description: item.description || '',
        image: item.image,
        images: gallery
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewItem({ name: '', price: '', description: '', image: '', images: [] });
  };

  const handleDeleteItem = async (id: number) => {
    const token = localStorage.getItem('admin_token');
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/collections?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });
      if (res.ok) fetchCollections();
    } catch (err) { console.error(err); }
  };

  const removeImage = (urlToRemove: string) => {
      setNewItem(prev => {
          const newImages = prev.images.filter(url => url !== urlToRemove);
          return {
              ...prev,
              images: newImages,
              image: prev.image === urlToRemove ? (newImages[0] || '') : prev.image
          };
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        setPassword(token);
        fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: token }) }).then(res => {
            if (res.ok) { setIsLoggedIn(true); fetchCollections(); }
            else localStorage.removeItem('admin_token');
        });
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 border border-zinc-200 w-full max-w-md">
          <h1 className="font-serif text-2xl mb-6 text-center text-zinc-900">Admin Login</h1>
          <form onSubmit={checkAuth} className="space-y-4">
            <input type="password" placeholder="Admin Password" className="w-full px-4 py-3 border border-zinc-200 focus:outline-none focus:border-black" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-black text-white py-3 hover:bg-zinc-800 transition-colors flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Enter Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-3xl">Dashboard</h1>
            <a href="/" className="text-sm text-zinc-500 hover:text-black transition-colors border-l border-zinc-300 pl-4 ml-2">View Website</a>
          </div>
          <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('admin_token'); }} className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <input placeholder="Item Name" className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">৳</span>
                  <input placeholder="Price (e.g. 2000)" className="w-full pl-8 pr-4 py-2 border border-zinc-200 focus:outline-none focus:border-black" value={newItem.price} onChange={e => { const val = e.target.value.replace(/[^0-9.]/g, ''); setNewItem({...newItem, price: val}); }} required />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 font-medium">Gallery (Primary = Black Border)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {newItem.images.map((url, i) => (
                            <div key={i} className="relative aspect-square group">
                                <img src={url} className={`w-full h-full object-cover border-2 ${newItem.image === url ? 'border-black' : 'border-transparent'}`} />
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <button type="button" onClick={() => setNewItem({...newItem, image: url})} className="text-[10px] text-white uppercase font-bold hover:underline">Front</button>
                                    <button type="button" onClick={() => removeImage(url)} className="text-[10px] text-red-400 uppercase font-bold hover:underline">Delete</button>
                                </div>
                                {newItem.image === url && (
                                    <div className="absolute top-1 right-1 bg-black text-white p-0.5 rounded-full shadow-lg">
                                        <CheckCircle2 size={10} />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="relative aspect-square border-2 border-dashed border-zinc-200 flex items-center justify-center hover:border-black transition-colors cursor-pointer">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            {uploading ? <Loader2 size={16} className="animate-spin text-zinc-900" /> : <Plus size={16} className="text-zinc-400" />}
                        </div>
                    </div>
                </div>

                <textarea placeholder="Description (all details here)" className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black h-32 text-sm leading-relaxed" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                <button disabled={uploading || !newItem.image} className="w-full bg-black text-white py-3 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-300">
                  {editingId ? <Edit3 size={18} /> : <Plus size={18} />} 
                  {uploading ? 'Uploading...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Item</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium text-right pr-12">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {collections.map(item => (
                            <tr key={item.id} className={`hover:bg-zinc-50/50 transition-colors ${editingId === item.id ? 'bg-zinc-100/50' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <img src={item.image} className="w-12 h-16 object-cover bg-zinc-100" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-900">{item.name}</span>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">ID: {item.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 font-medium">৳{item.price.replace('৳', '')}</td>
                                <td className="px-6 py-4 text-right pr-12">
                                    <div className="flex items-center justify-end gap-3">
                                        <button onClick={() => startEdit(item)} className="text-zinc-400 hover:text-black transition-colors">
                                            <Edit3 size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
