import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Upload,
  Image as ImageIcon,
  Check,
  Star,
  Eye,
  EyeOff,
  Percent,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category } from '../../types';

export const AdminMenuPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(1000);
  const [costPercentage, setCostPercentage] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        authFetch('/api/admin/products'),
        authFetch('/api/categories'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0 && !category) {
          setCategory(catData[0].name);
        }
      }
    } catch (e) {
      console.error('Failed to load menu products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculated Real-time Metrics in Form
  const calculatedBuyingCost = Math.round(price * (costPercentage / 100));
  const calculatedProfitPerUnit = price - calculatedBuyingCost;
  const calculatedMargin = price > 0 ? ((calculatedProfitPerUnit / price) * 100).toFixed(1) : '50.0';

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory(categories[0]?.name || 'Karahi & Handi');
    setPrice(1200);
    setCostPercentage(50);
    setImageUrl('');
    setImagePreview(null);
    setAvailable(true);
    setFeatured(false);
    setDisplayOrder(products.length + 1);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setModalMode('edit');
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category);
    setPrice(p.price);
    setCostPercentage(p.costPercentage ?? 50);
    setImageUrl(p.imageUrl || '');
    setImagePreview(p.imageUrl || null);
    setAvailable(p.available);
    setFeatured(p.featured || false);
    setDisplayOrder(p.displayOrder || 0);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const payload = {
        name: `${p.name} (Copy)`,
        description: p.description,
        category: p.category,
        price: p.price,
        costPercentage: p.costPercentage ?? 50,
        imageUrl: p.imageUrl,
        available: p.available,
        featured: false,
        displayOrder: products.length + 1,
      };

      const res = await authFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newProduct = await res.json();
        setProducts((prev) => [newProduct, ...prev]);
      }
    } catch (e) {
      console.error('Failed to duplicate product', e);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}" from the menu?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete product', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image size exceeds 5MB limit.');
      return;
    }

    setUploadingImage(true);
    setModalError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await authFetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.imageUrl);
        setImagePreview(data.imageUrl);
      } else {
        setModalError('Image upload failed. Supported formats: JPG, PNG, WEBP.');
      }
    } catch {
      setModalError('Network error while uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Product name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category || 'General',
      price: Number(price),
      costPercentage: Number(costPercentage),
      imageUrl: imageUrl.trim(),
      available,
      featured,
      displayOrder: Number(displayOrder),
    };

    try {
      let res: Response;
      if (modalMode === 'create') {
        res = await authFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`/api/admin/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const savedProduct = await res.json();
        if (modalMode === 'create') {
          setProducts((prev) => [savedProduct, ...prev]);
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? savedProduct : p))
          );
        }
        setIsModalOpen(false);
      } else {
        const errData = await res.json();
        setModalError(errData.error || 'Failed to save product.');
      }
    } catch {
      setModalError('Connection error while saving product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            MENU & PRODUCTS CATALOG
          </h1>
          <p className="text-xs text-zinc-400">
            Configure dishes, upload pictures, and manage 50/50 cost & profit system
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          id="add-new-product-btn"
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Dish
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800 text-[10px]">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-right">Cost %</th>
                <th className="p-4 text-right">Buying Cost</th>
                <th className="p-4 text-right">Profit / Unit</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const bCost = prod.buyingCost ?? Math.round(prod.price * 0.5);
                  const pUnit = prod.profitPerUnit ?? prod.price - bCost;
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={
                            prod.imageUrl ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={prod.name}
                          className="w-11 h-11 rounded-xl object-cover bg-zinc-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {prod.name}
                            {prod.featured && (
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            )}
                          </div>
                          <div className="text-zinc-500 text-[10px] line-clamp-1 max-w-xs">
                            {prod.description}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-4 text-right font-black text-amber-400 text-sm">
                        Rs. {prod.price.toLocaleString()}
                      </td>

                      <td className="p-4 text-right font-mono text-zinc-400">
                        {prod.costPercentage ?? 50}%
                      </td>

                      <td className="p-4 text-right font-mono text-rose-400">
                        Rs. {bCost.toLocaleString()}
                      </td>

                      <td className="p-4 text-right font-black text-emerald-400">
                        Rs. {pUnit.toLocaleString()}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prod.available
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-950/70 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {prod.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          title="Edit"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(prod)}
                          title="Duplicate"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          title="Delete"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            {/* Modal Top */}
            <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {modalMode === 'create' ? 'Add New Menu Item' : 'Edit Menu Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 p-4 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dish Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chicken Seekh Kabab"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Selling Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    step={10}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 50/50 Cost Percentage */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-500" /> Cost Percentage (Default 50%)
                    </label>
                    <span className="font-black text-amber-400">{costPercentage}% Cost</span>
                  </div>

                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={5}
                    value={costPercentage}
                    onChange={(e) => setCostPercentage(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  {/* Real-time calculated live preview */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center">
                    <div className="p-2 rounded-xl bg-zinc-900">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">
                        Calculated Buying Cost
                      </span>
                      <strong className="text-rose-400 text-xs">
                        Rs. {calculatedBuyingCost.toLocaleString()}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">
                        Profit Per Unit
                      </span>
                      <strong className="text-emerald-400 text-xs">
                        Rs. {calculatedProfitPerUnit.toLocaleString()}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">
                        Profit Margin
                      </span>
                      <strong className="text-amber-400 text-xs">{calculatedMargin}%</strong>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of taste, ingredients, or preparation style"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Product Image System (Upload & URL) */}
                <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Product Picture
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Image Preview Box */}
                    <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-zinc-700" />
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                        </button>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageUrl('');
                            }}
                            className="px-3 py-2 bg-rose-950 text-rose-400 hover:bg-rose-900 rounded-xl font-bold text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="text-[11px] text-zinc-500">
                        Or enter direct image URL:
                      </div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="font-bold text-zinc-300">Available to Order</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Featured on Homepage
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  {modalMode === 'create' ? 'Create Dish' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
