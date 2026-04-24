import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, LogOut, Loader2 } from 'lucide-react';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    image: ''
  });

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
        setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.url) {
        setNewItem(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
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
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    const res = await fetch('/api/collections');
    const data = await res.json();
    setCollections(data);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(newItem)
      });
      
      if (res.ok) {
        setNewItem({ name: '', price: '', description: '', image: '' });
        fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        setPassword(token);
        // Silently verify
        fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: token })
          }).then(res => {
              if (res.ok) {
                  setIsLoggedIn(true);
                  fetchCollections();
              } else {
                  localStorage.removeItem('admin_token');
              }
          });
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 border border-zinc-200 w-full max-w-md"
        >
          <h1 className="font-serif text-2xl mb-6 text-center">Admin Login</h1>
          <form onSubmit={checkAuth} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password"
              className="w-full px-4 py-3 border border-zinc-200 focus:outline-none focus:border-black transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              disabled={loading}
              className="w-full bg-black text-white py-3 hover:bg-zinc-800 transition-colors flex items-center justify-center"
            >
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
          {/* Add Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-zinc-200 sticky top-8">
              <h2 className="font-serif text-xl mb-4">Add New Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <input 
                  placeholder="Item Name"
                  className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  required
                />
                <input 
                  placeholder="Price (e.g. $240)"
                  className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black"
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: e.target.value})}
                  required
                />
                
                <div className="space-y-2">
                    <label className="block text-sm text-zinc-500">Product Image</label>
                    <div className="relative border-2 border-dashed border-zinc-200 p-4 hover:border-black transition-colors text-center cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {imagePreview ? (
                            <img src={imagePreview} className="mx-auto h-32 object-cover" />
                        ) : (
                            <div className="py-4">
                                <Plus className="mx-auto mb-2 text-zinc-400" />
                                <span className="text-sm text-zinc-400">Click to upload image</span>
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <Loader2 className="animate-spin text-black" />
                            </div>
                        )}
                    </div>
                </div>

                <textarea 
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2 border border-zinc-200 focus:outline-none focus:border-black h-24"
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                />
                <button 
                    disabled={uploading || !newItem.image}
                    className="w-full bg-black text-white py-2 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-300"
                >
                  <Plus size={18} /> {uploading ? 'Uploading...' : 'Add to Collection'}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-zinc-500 text-sm">Item</th>
                            <th className="px-6 py-4 font-medium text-zinc-500 text-sm">Price</th>
                            <th className="px-6 py-4 font-medium text-zinc-500 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {collections.map(item => (
                            <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <img src={item.image} className="w-12 h-16 object-cover bg-zinc-100" />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-500">{item.price}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
