import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Layers, 
  Boxes, 
  Cpu, 
  Trash2, 
  Plus, 
  Minus,
  ShoppingBag,
  Info,
  X,
  Check,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Catalog({ token, role }) {
  const [activeSubTab, setActiveSubTab] = useState('companies');
  const [loading, setLoading] = useState(true);

  // Lists
  const [companies, setCompanies] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modals, setModals] = useState([]);
  const [products, setProducts] = useState([]);

  // Setup forms
  const [newCompany, setNewCompany] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const [newModal, setNewModal] = useState({ modal_name: '', company_id: '', manufacturer_id: '', price: '', stock: '15' });
  const [newProduct, setNewProduct] = useState({ product_name: '', product_company: '', product_price: '', product_category: '', stock: '15' });

  // Inline editor states (Super Admin)
  const [editingItemId, setEditingItemId] = useState(null); // id of row being edited
  const [editingType, setEditingType] = useState(''); // 'modal' or 'product'
  const [editingFields, setEditingFields] = useState({});

  // Slide-over Drawer states (User ordering)
  const [selectedOrderItem, setSelectedOrderItem] = useState(null); // { type, item }
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isOrderingLoading, setIsOrderingLoading] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');
  const [orderErrorMsg, setOrderErrorMsg] = useState('');

  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isUser = role === 'user';

  // Load catalog lists
  const loadCatalogData = async () => {
    setLoading(true);
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };

      const compRes = await fetch('/api/catalog/companies', { headers: authHeader });
      const mfcRes = await fetch('/api/catalog/manufacturers', { headers: authHeader });
      const catRes = await fetch('/api/catalog/categories', { headers: authHeader });
      const modalRes = await fetch('/api/catalog/modals', { headers: authHeader });
      const prodRes = await fetch('/api/catalog/products', { headers: authHeader });

      if (compRes.ok) setCompanies(await compRes.json());
      if (mfcRes.ok) setManufacturers(await mfcRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (modalRes.ok) setModals(await modalRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error('Error loading catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, [token]);

  // Handle Tab Mapping for Users (Standard users only see Displays & Products)
  useEffect(() => {
    if (isUser) {
      setActiveSubTab('modals');
    } else {
      setActiveSubTab('companies');
    }
  }, [role]);

  // Default select boxes
  useEffect(() => {
    if (companies.length > 0 && manufacturers.length > 0) {
      setNewModal(prev => ({
        ...prev,
        company_id: companies[0].id.toString(),
        manufacturer_id: manufacturers[0].id.toString()
      }));
    }
    if (categories.length > 0 && companies.length > 0) {
      setNewProduct(prev => ({
        ...prev,
        product_category: categories[0].category_name,
        product_company: companies[0].name
      }));
    }
  }, [companies, manufacturers, categories]);

  // Submissions
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany) return;
    try {
      const response = await fetch('/api/catalog/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCompany })
      });
      if (response.ok) {
        setNewCompany('');
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManufacturer = async (e) => {
    e.preventDefault();
    if (!newManufacturer) return;
    try {
      const response = await fetch('/api/catalog/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ manufacturer_name: newManufacturer })
      });
      if (response.ok) {
        setNewManufacturer('');
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;
    try {
      const response = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ category_name: newCategory })
      });
      if (response.ok) {
        setNewCategory('');
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModal = async (e) => {
    e.preventDefault();
    if (!newModal.modal_name) return;
    try {
      const response = await fetch('/api/catalog/modals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...newModal,
          price: parseFloat(newModal.price || 0),
          stock: parseInt(newModal.stock || 0, 10)
        })
      });
      if (response.ok) {
        setNewModal(prev => ({ ...prev, modal_name: '', price: '', stock: '15' }));
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product_name) return;
    try {
      const response = await fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...newProduct,
          product_price: parseFloat(newProduct.product_price || 0),
          stock: parseInt(newProduct.stock || 0, 10)
        })
      });
      if (response.ok) {
        setNewProduct(prev => ({ ...prev, product_name: '', product_price: '', stock: '15' }));
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inline editor save
  const handleSaveInlineEdit = async (id, type) => {
    try {
      const endpoint = type === 'modal' ? `/api/catalog/modals/${id}` : `/api/catalog/products/${id}`;
      const payload = type === 'modal' 
        ? {
            modal_name: editingFields.modal_name,
            company_id: parseInt(editingFields.company_id, 10),
            manufacturer_id: parseInt(editingFields.manufacturer_id, 10),
            price: parseFloat(editingFields.price || 0),
            stock: parseInt(editingFields.stock || 0, 10)
          }
        : {
            product_name: editingFields.product_name,
            product_company: editingFields.product_company,
            product_price: parseFloat(editingFields.product_price || 0),
            product_category: editingFields.product_category,
            stock: parseInt(editingFields.stock || 0, 10)
          };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditingItemId(null);
        loadCatalogData();
      }
    } catch (err) {
      console.error('Error saving inline edit:', err);
    }
  };

  // Inline Edit Trigger
  const startInlineEdit = (item, type) => {
    setEditingItemId(item.id);
    setEditingType(type);
    setEditingFields(item);
  };

  // Increment / Decrement Stock In-place (Super Admin)
  const adjustStockCount = async (item, type, delta) => {
    try {
      const endpoint = type === 'modal' ? `/api/catalog/modals/${item.id}` : `/api/catalog/products/${item.id}`;
      const newStock = Math.max(0, (item.stock || 0) + delta);
      const payload = type === 'modal'
        ? { ...item, stock: newStock }
        : { ...item, stock: newStock };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deletions
  const handleDeleteItem = async (subUrl, id) => {
    if (!window.confirm('Are you sure you want to delete this catalog item?')) return;
    try {
      const response = await fetch(`/api/catalog/${subUrl}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadCatalogData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrderItem) return;

    setIsOrderingLoading(true);
    setOrderSuccessMsg('');
    setOrderErrorMsg('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          product_type: selectedOrderItem.type,
          product_id: selectedOrderItem.item.id,
          quantity: orderQuantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOrderSuccessMsg(`Successfully placed order for ${orderQuantity}x ${selectedOrderItem.item.modal_name || selectedOrderItem.item.product_name}!`);
        setOrderQuantity(1);
        setTimeout(() => {
          setSelectedOrderItem(null);
          setOrderSuccessMsg('');
        }, 2200);
        // Refresh catalog quantities (virtual strings)
        loadCatalogData();
      } else {
        setOrderErrorMsg(data.error || 'Failed to submit order. Please check availability.');
      }
    } catch (err) {
      console.error(err);
      setOrderErrorMsg('Connection failure. Verify the backend is running.');
    } finally {
      setIsOrderingLoading(false);
    }
  };

  // Define tabs depending on role
  const subTabs = isUser 
    ? [
        { id: 'modals', label: 'Mobile Display Panels', icon: Layers },
        { id: 'products', label: 'Store Products', icon: ShoppingBag }
      ]
    : [
        { id: 'companies', label: 'Display Brands', icon: Smartphone },
        { id: 'modals', label: 'Display Modals', icon: Layers },
        { id: 'manufacturers', label: 'Manufacturers', icon: Cpu },
        { id: 'categories', label: 'Product Categories', icon: Boxes },
        { id: 'products', label: 'Other Products', icon: ShoppingBag },
      ];

  return (
    <div className="space-y-8 relative">
      
      {/* 1. Navigation pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.04] dark:border-white/[0.04] light:border-black/[0.04]">
        <div className="flex flex-wrap items-center gap-3">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 relative ${
                  isActive
                    ? 'bg-brand-accent/15 text-brand-accentLight border border-brand-accent/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-accentLight' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Role Badge Indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-inner text-[10px] uppercase font-black tracking-widest text-slate-400">
          <span className={`w-2 h-2 rounded-full ${
            isSuperAdmin ? 'bg-brand-violet' : isUser ? 'bg-brand-emerald' : 'bg-brand-amber'
          }`} style={{ boxShadow: `0 0 8px ${isSuperAdmin ? '#8B5CF6' : isUser ? '#10B981' : '#F59E0B'}` }}></span>
          <span>Role: {role}</span>
        </div>
      </div>

      {/* Role permission info */}
      {!isSuperAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] dark:border-white/[0.05] light:border-black/[0.05] flex items-center gap-3 text-xs text-slate-400"
        >
          <Info className="w-4 h-4 text-brand-accent shrink-0" />
          <span>
            {isUser 
              ? "Welcome to AS Store. Search display models or accessories and click 'Order Item' to place an operational inventory dispatch request."
              : "Role View-Only: You can see the full catalog and exact stocks, but catalog modifications require Super Admin level credentials."
            }
          </span>
        </motion.div>
      )}

      {/* 2. Content Tabs Grid */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-brand-accent !border-l-transparent"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Add Forms Column (Super Admin only) */}
          {isSuperAdmin && (
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 premium-card p-6 rounded-3xl border border-white/5 shadow-md flex flex-col"
            >
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-5 tracking-widest uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-accent" />
                Add {subTabs.find(t => t.id === activeSubTab)?.label.slice(0, -1) || 'Item'}
              </h4>

              {/* Form A: Display Brands */}
              {activeSubTab === 'companies' && (
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apple"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-premium py-3 font-bold uppercase tracking-widest text-[10px]">
                    Save Brand
                  </button>
                </form>
              )}

              {/* Form B: Display Modals */}
              {activeSubTab === 'modals' && (
                <form onSubmit={handleAddModal} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Modal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15 Pro Max"
                      value={newModal.modal_name}
                      onChange={(e) => setNewModal(prev => ({ ...prev, modal_name: e.target.value }))}
                      className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Display Company</label>
                    <select
                      value={newModal.company_id}
                      onChange={(e) => setNewModal(prev => ({ ...prev, company_id: e.target.value }))}
                      className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                    >
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Manufacturer</label>
                    <select
                      value={newModal.manufacturer_id}
                      onChange={(e) => setNewModal(prev => ({ ...prev, manufacturer_id: e.target.value }))}
                      className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                    >
                      {manufacturers.map(m => <option key={m.id} value={m.id}>{m.manufacturer_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Price ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={newModal.price}
                        onChange={(e) => setNewModal(prev => ({ ...prev, price: e.target.value }))}
                        className="premium-input text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Stock</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={newModal.stock}
                        onChange={(e) => setNewModal(prev => ({ ...prev, stock: e.target.value }))}
                        className="premium-input text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-premium py-3 font-bold uppercase tracking-widest text-[10px]">
                    Save Modal
                  </button>
                </form>
              )}

              {/* Form C: Manufacturers */}
              {activeSubTab === 'manufacturers' && (
                <form onSubmit={handleAddManufacturer} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Manufacturer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Foxconn Displays"
                      value={newManufacturer}
                      onChange={(e) => setNewManufacturer(e.target.value)}
                      className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-premium py-3 font-bold uppercase tracking-widest text-[10px]">
                    Save Manufacturer
                  </button>
                </form>
              )}

              {/* Form D: Product Categories */}
              {activeSubTab === 'categories' && (
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. OLED Assemblies"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-premium py-3 font-bold uppercase tracking-widest text-[10px]">
                    Save Category
                  </button>
                </form>
              )}

              {/* Form E: Other Products */}
              {activeSubTab === 'products' && (
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. OCA Glue Film"
                      value={newProduct.product_name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                      className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Company / Sourced</label>
                    <select
                      value={newProduct.product_company}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_company: e.target.value }))}
                      className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                    >
                      {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Product Category</label>
                    <select
                      value={newProduct.product_category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_category: e.target.value }))}
                      className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                    >
                      {categories.map(c => <option key={c.id} value={c.category_name}>{c.category_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Price ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={newProduct.product_price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, product_price: e.target.value }))}
                        className="premium-input text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Stock</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                        className="premium-input text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-premium py-3 font-bold uppercase tracking-widest text-[10px]">
                    Save Product
                  </button>
                </form>
              )}

            </motion.div>
          )}

          {/* Listings Table Column */}
          <div className={`${isSuperAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} glass-panel rounded-[24px] overflow-hidden shadow-premium border border-white/5`}>
            
            {activeSubTab === 'companies' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="premium-th">ID</th>
                      <th className="premium-th">Brand Name</th>
                      {isSuperAdmin && <th className="premium-th text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {companies.map((c, idx) => (
                      <tr key={c.id} className="premium-tr group">
                        <td className="py-4 px-6 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{c.name}</td>
                        {isSuperAdmin && (
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => handleDeleteItem('companies', c.id)} className="p-1.5 rounded-lg hover:bg-brand-rose/10 text-slate-400 hover:text-brand-rose transition-all">
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === 'modals' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="premium-th">Display Modal</th>
                      <th className="premium-th">Brand</th>
                      <th className="premium-th">Manufacturer</th>
                      
                      {/* Pricing masked for users */}
                      {!isUser && <th className="premium-th">Unit Price</th>}
                      
                      <th className="premium-th">Availability</th>
                      
                      {/* Inline modification action column */}
                      {isAdmin && <th className="premium-th text-center">Actions</th>}
                      {isUser && <th className="premium-th text-center">Buy</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {modals.map((m) => {
                      const isEditing = editingItemId === m.id && editingType === 'modal';
                      return (
                        <tr key={m.id} className="premium-tr group transition-colors duration-250">
                          
                          {/* Modal Name / Input */}
                          <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editingFields.modal_name}
                                onChange={(e) => setEditingFields({ ...editingFields, modal_name: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100"
                              />
                            ) : (
                              m.modal_name
                            )}
                          </td>
                          
                          {/* Company Dropdown / Text */}
                          <td className="py-4 px-6 text-slate-500 font-medium">
                            {isEditing ? (
                              <select
                                value={editingFields.company_id}
                                onChange={(e) => setEditingFields({ ...editingFields, company_id: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                              >
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            ) : (
                              m.company_name
                            )}
                          </td>

                          {/* Manufacturer Dropdown / Text */}
                          <td className="py-4 px-6 text-slate-500 font-medium">
                            {isEditing ? (
                              <select
                                value={editingFields.manufacturer_id}
                                onChange={(e) => setEditingFields({ ...editingFields, manufacturer_id: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                              >
                                {manufacturers.map(mfc => <option key={mfc.id} value={mfc.id}>{mfc.manufacturer_name}</option>)}
                              </select>
                            ) : (
                              m.manufacturer_name
                            )}
                          </td>

                          {/* Price Input / Masked for users */}
                          {!isUser && (
                            <td className="py-4 px-6 font-bold text-brand-emerald">
                              {isEditing ? (
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={editingFields.price}
                                  onChange={(e) => setEditingFields({ ...editingFields, price: e.target.value })}
                                  className="premium-input py-1 text-slate-800 dark:text-slate-100 w-24"
                                />
                              ) : (
                                `$${(m.price || 0).toFixed(2)}`
                              )}
                            </td>
                          )}

                          {/* Stock (Super Admin can change directly / Admin can see exact / User sees anonymized badge) */}
                          <td className="py-4 px-6">
                            {isEditing ? (
                              <input 
                                type="number"
                                value={editingFields.stock}
                                onChange={(e) => setEditingFields({ ...editingFields, stock: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100 w-16"
                              />
                            ) : isUser ? (
                              /* Anonymized Pulse Badges for User role */
                              <div className="flex items-center">
                                {!m.inStock ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-brand-rose/10 text-brand-rose border border-brand-rose/15 shadow-sm shadow-brand-rose/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-rose" />
                                    Out of Stock
                                  </span>
                                ) : m.isLowStock ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-brand-amber/10 text-brand-amber border border-brand-amber/15 shadow-sm shadow-brand-amber/5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/15 shadow-sm shadow-brand-emerald/5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                                    In Stock
                                  </span>
                                )}
                              </div>
                            ) : (
                              /* Admin & Superadmin see exact counts + Quick Modifiers */
                              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => adjustStockCount(m, 'modal', -1)}
                                    className="p-1 rounded bg-white/5 border border-white/10 hover:bg-brand-rose/10 hover:text-brand-rose hover:border-brand-rose/20 text-slate-400 active:scale-90"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                )}
                                <span className={`px-2 py-0.5 text-xs rounded-lg ${
                                  (m.stock || 0) <= 5 ? 'text-brand-amber bg-brand-amber/10' : 'text-brand-emerald bg-brand-emerald/10'
                                }`}>
                                  {m.stock || 0} Units
                                </span>
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => adjustStockCount(m, 'modal', 1)}
                                    className="p-1 rounded bg-white/5 border border-white/10 hover:bg-brand-emerald/10 hover:text-brand-emerald hover:border-brand-emerald/20 text-slate-400 active:scale-90"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions Column */}
                          {isAdmin && (
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button 
                                      onClick={() => handleSaveInlineEdit(m.id, 'modal')}
                                      className="p-1.5 rounded-lg hover:bg-brand-emerald/15 text-slate-400 hover:text-brand-emerald transition-all"
                                      title="Save Row"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => setEditingItemId(null)}
                                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {isSuperAdmin && (
                                      <button 
                                        onClick={() => startInlineEdit(m, 'modal')}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-brand-accent transition-all"
                                        title="Inline Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {isSuperAdmin && (
                                      <button 
                                        onClick={() => handleDeleteItem('modals', m.id)}
                                        className="p-1.5 rounded-lg hover:bg-brand-rose/10 text-slate-400 hover:text-brand-rose transition-all"
                                        title="Delete Row"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {!isSuperAdmin && <span className="text-[10px] uppercase font-extrabold text-slate-600">No Permissions</span>}
                                  </>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Customer ordering trigger column */}
                          {isUser && (
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => { setSelectedOrderItem({ type: 'display', item: m }); setOrderQuantity(1); }}
                                disabled={!m.inStock}
                                className={`w-full text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all duration-300 ${
                                  m.inStock
                                    ? 'bg-brand-accent text-white hover:bg-brand-accentLight active:scale-95 shadow shadow-brand-accent/25'
                                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                }`}
                              >
                                {m.inStock ? 'Order Item' : 'Sold Out'}
                              </button>
                            </td>
                          )}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === 'manufacturers' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="premium-th">ID</th>
                      <th className="premium-th">Manufacturer Name</th>
                      {isSuperAdmin && <th className="premium-th text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {manufacturers.map((m, idx) => (
                      <tr key={m.id} className="premium-tr group">
                        <td className="py-4 px-6 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{m.manufacturer_name}</td>
                        {isSuperAdmin && (
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => handleDeleteItem('manufacturers', m.id)} className="p-1.5 rounded-lg hover:bg-brand-rose/10 text-slate-400 hover:text-brand-rose transition-all">
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === 'categories' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="premium-th">ID</th>
                      <th className="premium-th">Category Name</th>
                      {isSuperAdmin && <th className="premium-th text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {categories.map((cat, idx) => (
                      <tr key={cat.id} className="premium-tr group">
                        <td className="py-4 px-6 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{cat.category_name}</td>
                        {isSuperAdmin && (
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => handleDeleteItem('categories', cat.id)} className="p-1.5 rounded-lg hover:bg-brand-rose/10 text-slate-400 hover:text-brand-rose transition-all">
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === 'products' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="premium-th">Product Name</th>
                      <th className="premium-th">Sourced Brand</th>
                      <th className="premium-th">Category</th>
                      
                      {/* Hide pricing from users */}
                      {!isUser && <th className="premium-th">Retail Price</th>}
                      
                      <th className="premium-th">Availability</th>
                      
                      {isAdmin && <th className="premium-th text-center">Actions</th>}
                      {isUser && <th className="premium-th text-center">Buy</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {products.map((p) => {
                      const isEditing = editingItemId === p.id && editingType === 'product';
                      return (
                        <tr key={p.id} className="premium-tr group transition-colors duration-250">
                          
                          {/* Name / Input */}
                          <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editingFields.product_name}
                                onChange={(e) => setEditingFields({ ...editingFields, product_name: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100"
                              />
                            ) : (
                              p.product_name
                            )}
                          </td>

                          {/* Brand / Input */}
                          <td className="py-4 px-6 text-slate-500 font-medium">
                            {isEditing ? (
                              <select
                                value={editingFields.product_company}
                                onChange={(e) => setEditingFields({ ...editingFields, product_company: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                              >
                                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                            ) : (
                              p.product_company
                            )}
                          </td>

                          {/* Category / Input */}
                          <td className="py-4 px-6 text-slate-500 font-medium">
                            {isEditing ? (
                              <select
                                value={editingFields.product_category}
                                onChange={(e) => setEditingFields({ ...editingFields, product_category: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                              >
                                {categories.map(c => <option key={c.id} value={c.category_name}>{c.category_name}</option>)}
                              </select>
                            ) : (
                              p.product_category
                            )}
                          </td>

                          {/* Price / Hide for users */}
                          {!isUser && (
                            <td className="py-4 px-6 font-bold text-brand-emerald">
                              {isEditing ? (
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={editingFields.product_price}
                                  onChange={(e) => setEditingFields({ ...editingFields, product_price: e.target.value })}
                                  className="premium-input py-1 text-slate-800 dark:text-slate-100 w-24"
                                />
                              ) : (
                                `$${(p.product_price || 0).toFixed(2)}`
                              )}
                            </td>
                          )}

                          {/* Stock (Superadmin adjusts / Admin sees exact / User sees anonymized badge) */}
                          <td className="py-4 px-6">
                            {isEditing ? (
                              <input 
                                type="number"
                                value={editingFields.stock}
                                onChange={(e) => setEditingFields({ ...editingFields, stock: e.target.value })}
                                className="premium-input py-1 text-slate-800 dark:text-slate-100 w-16"
                              />
                            ) : isUser ? (
                              /* Anonymized Pulse Badges for User role */
                              <div className="flex items-center">
                                {!p.inStock ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-brand-rose/10 text-brand-rose border border-brand-rose/15 shadow-sm shadow-brand-rose/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-rose" />
                                    Out of Stock
                                  </span>
                                ) : p.isLowStock ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-brand-amber/10 text-brand-amber border border-brand-amber/15 shadow-sm shadow-brand-amber/5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/15 shadow-sm shadow-brand-emerald/5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                                    In Stock
                                  </span>
                                )}
                              </div>
                            ) : (
                              /* Admin & Superadmin see exact counts + Quick Modifiers */
                              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => adjustStockCount(p, 'product', -1)}
                                    className="p-1 rounded bg-white/5 border border-white/10 hover:bg-brand-rose/10 hover:text-brand-rose hover:border-brand-rose/20 text-slate-400 active:scale-90"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                )}
                                <span className={`px-2 py-0.5 text-xs rounded-lg ${
                                  (p.stock || 0) <= 5 ? 'text-brand-amber bg-brand-amber/10' : 'text-brand-emerald bg-brand-emerald/10'
                                }`}>
                                  {p.stock || 0} Units
                                </span>
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => adjustStockCount(p, 'product', 1)}
                                    className="p-1 rounded bg-white/5 border border-white/10 hover:bg-brand-emerald/10 hover:text-brand-emerald hover:border-brand-emerald/20 text-slate-400 active:scale-90"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions Column */}
                          {isAdmin && (
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button 
                                      onClick={() => handleSaveInlineEdit(p.id, 'product')}
                                      className="p-1.5 rounded-lg hover:bg-brand-emerald/15 text-slate-400 hover:text-brand-emerald transition-all"
                                      title="Save Row"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => setEditingItemId(null)}
                                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {isSuperAdmin && (
                                      <button 
                                        onClick={() => startInlineEdit(p, 'product')}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-brand-accent transition-all"
                                        title="Inline Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {isSuperAdmin && (
                                      <button 
                                        onClick={() => handleDeleteItem('products', p.id)}
                                        className="p-1.5 rounded-lg hover:bg-brand-rose/10 text-slate-400 hover:text-brand-rose transition-all"
                                        title="Delete Row"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {!isSuperAdmin && <span className="text-[10px] uppercase font-extrabold text-slate-600">No Permissions</span>}
                                  </>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Customer ordering trigger column */}
                          {isUser && (
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => { setSelectedOrderItem({ type: 'general', item: p }); setOrderQuantity(1); }}
                                disabled={!p.inStock}
                                className={`w-full text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all duration-300 ${
                                  p.inStock
                                    ? 'bg-brand-accent text-white hover:bg-brand-accentLight active:scale-95 shadow shadow-brand-accent/25'
                                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                }`}
                              >
                                {p.inStock ? 'Order Item' : 'Sold Out'}
                              </button>
                            </td>
                          )}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* PREMIUM SLIDE-OVER DRAWER (USER INVENTORY ORDERING PANEL) */}
      <AnimatePresence>
        {selectedOrderItem && (
          <>
            {/* Backdrop Glow Glass blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderItem(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            ></motion.div>

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass-panel shadow-premium border-l border-white/10 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-accent/20 border border-brand-accent/35 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-brand-accent" />
                    </div>
                    <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Submit Stock Request
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrderItem(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-6">
                  {/* Alert notification panels */}
                  {orderErrorMsg && (
                    <motion.div 
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-xl bg-brand-rose/10 border border-brand-rose/25 text-brand-rose text-xs font-semibold flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{orderErrorMsg}</span>
                    </motion.div>
                  )}

                  {orderSuccessMsg && (
                    <motion.div 
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald text-xs font-semibold flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{orderSuccessMsg}</span>
                    </motion.div>
                  )}

                  {/* Summary card */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3 shadow-inner">
                    <span className="text-[8px] font-black uppercase text-brand-accent tracking-widest bg-brand-accent/10 border border-brand-accent/25 px-2 py-0.5 rounded">
                      {selectedOrderItem.type === 'display' ? 'Premium Display Panel' : 'Store Inventory'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white pt-1">
                      {selectedOrderItem.item.modal_name || selectedOrderItem.item.product_name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-[11px] pt-2 border-t border-white/5 text-slate-400">
                      <div>
                        <p className="uppercase text-[8px] font-bold text-slate-500 tracking-wider">Manufacturer / Category</p>
                        <p className="font-semibold text-slate-300 mt-0.5">
                          {selectedOrderItem.item.manufacturer_name || selectedOrderItem.item.product_category || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="uppercase text-[8px] font-bold text-slate-500 tracking-wider">Brand Partner</p>
                        <p className="font-semibold text-slate-300 mt-0.5">
                          {selectedOrderItem.item.company_name || selectedOrderItem.item.product_company || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-2">
                    <label className="block text-[9px] uppercase font-black text-slate-400 pl-1 tracking-widest">
                      Requested Dispatch Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(q => Math.max(1, q - 1))}
                        className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 flex items-center justify-center active:scale-95 transition-all text-lg font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value || 1, 10)))}
                        className="premium-input w-full text-center text-sm font-bold py-2.5 text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(q => q + 1)}
                        className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 flex items-center justify-center active:scale-95 transition-all text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit footer */}
              <div className="p-6 border-t border-white/[0.06] bg-white/[0.01]">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isOrderingLoading || orderSuccessMsg}
                  className="w-full btn-premium py-4 text-xs font-black tracking-widest shadow-md shadow-brand-accent/25 hover:shadow-brand-accent/40"
                >
                  {isOrderingLoading ? (
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white !border-l-transparent"></span>
                  ) : (
                    'SUBMIT DISPATCH REQUEST'
                  )}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Catalog;
