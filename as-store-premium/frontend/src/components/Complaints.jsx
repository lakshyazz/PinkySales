import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Eye, 
  Edit3, 
  X, 
  FileSpreadsheet, 
  UserPlus, 
  Tag, 
  Barcode,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Complaints({ token, role }) {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modals, setModals] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  // Dynamic Toast State for User intake
  const [toast, setToast] = useState({ show: false, message: '', type: 'info', loading: false });

  // Form Fields
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    contact: '',
    alternate_contact: '',
    area: '1',
    map_location: '',
    address: '',
    zipcode: '',
    service_type: 'Repair',
    product_category: '',
    dealer_name: '',
    description: '',
    barcode: '',
    warranty: 1,
    technician: '',
    product_serial_no: '',
    product_model: ''
  });

  const isUser = role === 'user';
  const isAdmin = role === 'admin' || role === 'superadmin';

  const loadData = async () => {
    try {
      const compRes = await fetch('/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (compRes.ok) {
        setComplaints(await compRes.json());
      }

      const catRes = await fetch('/api/catalog/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (catRes.ok) {
        setCategories(await catRes.json());
      }

      const modalRes = await fetch('/api/catalog/modals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (modalRes.ok) {
        setModals(await modalRes.json());
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    if (categories.length > 0 && !formData.product_category) {
      setFormData(prev => ({ ...prev, product_category: categories[0].category_name }));
    }
  }, [categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fname || !formData.contact) return;

    if (isUser) {
      setToast({ show: true, message: 'Processing complaint routing to operations...', type: 'info', loading: true });
    }

    try {
      const url = selectedRecord 
        ? `/api/complaints/${selectedRecord.id}` 
        : '/api/complaints';
      
      const method = selectedRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (selectedRecord && selectedRecord.complaint_no) {
          await fetch(`/api/allocation/${selectedRecord.complaint_no}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              technician: formData.technician,
              status: formData.status || 'allocated',
              product_serial_no: formData.product_serial_no,
              product_model: formData.product_model
            })
          });
        }
        
        if (isUser) {
          setToast({ 
            show: true, 
            message: `Support ticket filed successfully! Ref: ${data.complaint_no || 'COMP-OK'}`, 
            type: 'success', 
            loading: false 
          });
          
          setTimeout(() => {
            setToast({ show: false, message: '', type: 'info', loading: false });
          }, 3500);
        }

        setShowDrawer(false);
        setSelectedRecord(null);
        resetForm();
        loadData();
      } else {
        if (isUser) {
          setToast({ show: true, message: data.error || 'Failed to file complaint.', type: 'error', loading: false });
        }
      }
    } catch (err) {
      console.error(err);
      if (isUser) {
        setToast({ show: true, message: 'Connection failure. Verify server status.', type: 'error', loading: false });
      }
    }
  };

  // Assign Technician directly (Quick Assign)
  const handleQuickAssignTechnician = async (item, tech) => {
    try {
      const response = await fetch(`/api/allocation/${item.complaint_no}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          technician: tech,
          status: tech ? 'allocated' : 'new'
        })
      });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Quick assign error:', err);
    }
  };

  const handleDelete = async (id, no) => {
    if (!window.confirm(`Are you sure you want to delete Call Ref: ${no}?`)) return;

    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClick = () => {
    setViewOnly(false);
    setSelectedRecord(null);
    resetForm();
    setShowDrawer(true);
  };

  const handleEditClick = (record) => {
    setViewOnly(false);
    setSelectedRecord(record);
    setFormData({
      fname: record.fname || '',
      lname: record.lname || '',
      email: record.email || '',
      contact: record.contact || '',
      alternate_contact: record.alternate_contact || '',
      area: record.area || '1',
      map_location: record.map_location || '',
      address: record.address || '',
      zipcode: record.zipcode || '',
      service_type: record.service_type || 'Repair',
      product_category: record.product_category || '',
      dealer_name: record.dealer_name || '',
      description: record.description || '',
      barcode: record.barcode || '',
      warranty: record.warranty || 1,
      technician: record.technician || '',
      product_serial_no: record.product_serial_no || '',
      product_model: record.product_model || '',
      status: record.status || 'new'
    });
    setShowDrawer(true);
  };

  const handleViewClick = (record) => {
    setViewOnly(true);
    setSelectedRecord(record);
    setFormData({
      fname: record.fname || '',
      lname: record.lname || '',
      email: record.email || '',
      contact: record.contact || '',
      alternate_contact: record.alternate_contact || '',
      area: record.area || '1',
      map_location: record.map_location || '',
      address: record.address || '',
      zipcode: record.zipcode || '',
      service_type: record.service_type || 'Repair',
      product_category: record.product_category || '',
      dealer_name: record.dealer_name || '',
      description: record.description || '',
      barcode: record.barcode || '',
      warranty: record.warranty || 1,
      technician: record.technician || '',
      product_serial_no: record.product_serial_no || '',
      product_model: record.product_model || '',
      status: record.status || 'new'
    });
    setShowDrawer(true);
  };

  const resetForm = () => {
    setFormData({
      fname: '',
      lname: '',
      email: '',
      contact: '',
      alternate_contact: '',
      area: '1',
      map_location: '',
      address: '',
      zipcode: '',
      service_type: 'Repair',
      product_category: categories[0]?.category_name || '',
      dealer_name: '',
      description: '',
      barcode: '',
      warranty: 1,
      technician: '',
      product_serial_no: '',
      product_model: ''
    });
  };

  const handleExportCSV = () => {
    const headers = ['Sr.No,Complaint No,Customer Name,Contact,Pincode,Service Type,Product Category,Warranty,Status,Date'];
    const rows = complaints.map((row, idx) => {
      return `${idx + 1},${row.complaint_no},${row.fname} ${row.lname || ''},${row.contact},${row.zipcode || ''},${row.service_type || ''},${row.product_category || ''},${row.warranty === 1 ? 'In-Warranty' : 'Out-of-Warranty'},${row.status || 'new'},${row.date || ''}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaints_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredComplaints = complaints.filter(item => {
    const searchString = search.toLowerCase();
    return (
      (item.complaint_no || '').toLowerCase().includes(searchString) ||
      (item.fname || '').toLowerCase().includes(searchString) ||
      (item.lname || '').toLowerCase().includes(searchString) ||
      (item.contact || '').toLowerCase().includes(searchString) ||
      (item.zipcode || '').toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Dynamic Intake toast notification for User */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 w-80 p-4 rounded-2xl glass-panel border shadow-premium flex items-start gap-3.5 ${
              toast.type === 'success' ? 'border-brand-emerald/25 bg-brand-emerald/10 text-slate-100' :
              toast.type === 'error' ? 'border-brand-rose/25 bg-brand-rose/10 text-slate-100' :
              'border-brand-accent/25 bg-brand-accent/10 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-emerald" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-brand-rose" />}
              {toast.type === 'info' && <Tag className="w-5 h-5 text-brand-accent animate-pulse" />}
            </div>
            
            <div className="flex-1 space-y-1 relative">
              <h5 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400">
                {toast.type === 'success' ? 'Intake Successful' : toast.type === 'error' ? 'Operational Failure' : 'Operations Intake'}
              </h5>
              <p className="text-xs font-semibold text-slate-200 leading-snug">{toast.message}</p>
              
              {/* Dynamic Loading Progress Line */}
              {toast.loading && (
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-3 relative">
                  <motion.div 
                    initial={{ left: '-100%' }}
                    animate={{ left: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="absolute top-0 bottom-0 w-[40%] bg-brand-accent rounded-full"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== USER INTAKE SCREEN ==================== */}
      {isUser && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-premium"
        >
          <div className="text-center mb-8 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-wider uppercase">File Operational Ticket</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Fill out the diagnostic request parameters. Your ticket will route to system operations instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">First Name *</label>
                <input
                  type="text"
                  name="fname"
                  value={formData.fname}
                  onChange={handleInputChange}
                  className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                  placeholder="Enter First Name"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Last Name</label>
                <input
                  type="text"
                  name="lname"
                  value={formData.lname}
                  onChange={handleInputChange}
                  className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                  placeholder="Enter Last Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Contact Phone *</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                  placeholder="Enter Mobile Phone"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                  placeholder="e.g. client@domain.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Diagnostic Model</label>
                <select
                  name="product_model"
                  value={formData.product_model}
                  onChange={handleInputChange}
                  className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                >
                  <option value="">Select LCD / Product Model</option>
                  {modals.map(m => (
                    <option key={m.id} value={m.modal_name}>{m.modal_name} - {m.company_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Product Serial / IMEI</label>
                <input
                  type="text"
                  name="product_serial_no"
                  value={formData.product_serial_no}
                  onChange={handleInputChange}
                  className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                  placeholder="Serial / IMEI Code"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Physical Address Details</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                placeholder="Enter complete shipping or residential address details..."
                className="premium-input text-slate-800 dark:text-slate-100"
              ></textarea>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-black text-slate-400 mb-1.5 pl-1 tracking-widest">Granular Problem Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Detail the problems, troubleshooting steps, or general requests..."
                className="premium-input text-slate-800 dark:text-slate-100"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full btn-premium py-4 text-xs font-black tracking-widest uppercase shadow-md shadow-brand-accent/25 hover:shadow-brand-accent/40"
            >
              SUBMIT SUPPORT TICKET
            </button>
          </form>
        </motion.div>
      )}

      {/* ==================== ADMINISTRATIVE MANAGEMENT DASHBOARD ==================== */}
      {isAdmin && (
        <>
          {/* Header Toolbar Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search complaint, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="premium-input !pl-10 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] dark:border-white/[0.05] light:border-black/[0.05] hover:bg-white/[0.05] text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-brand-emerald" />
                CSV Export
              </button>
              
              <button
                onClick={handleAddClick}
                className="flex-1 sm:flex-initial btn-premium"
              >
                <Plus className="w-4 h-4" />
                Add Complaint
              </button>
            </div>
          </div>

          {/* Grid Table Board */}
          <div className="glass-panel rounded-[24px] overflow-hidden shadow-premium border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="premium-th">Ref</th>
                    <th className="premium-th">Customer Name</th>
                    <th className="premium-th">Contact</th>
                    <th className="premium-th">Product Model</th>
                    <th className="premium-th text-center">Priority / Warranty</th>
                    <th className="premium-th">Quick Assign</th>
                    <th className="premium-th">Call Status</th>
                    <th className="premium-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                        No active support tickets found.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((item) => (
                      <tr key={item.id} className="premium-tr group">
                        <td className="py-4 px-6 text-brand-accent font-semibold tracking-wider">{item.complaint_no}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {item.fname} {item.lname}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800 dark:text-slate-300">{item.contact}</p>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{item.zipcode || 'No ZIP'}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-300">
                          {item.product_model || 'No model specified'}
                        </td>
                        
                        {/* Warranty tag with color priority indicators */}
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-black tracking-widest border ${
                            item.warranty === 1 
                              ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' 
                              : 'bg-brand-rose/10 text-brand-rose border-brand-rose/20'
                          }`}>
                            {item.warranty === 1 ? 'In Warranty (Normal)' : 'Out Warranty (High)'}
                          </span>
                        </td>

                        {/* Quick technician assign */}
                        <td className="py-4 px-6">
                          <input 
                            type="text"
                            defaultValue={item.technician}
                            placeholder="Type & Enter tech"
                            onBlur={(e) => handleQuickAssignTechnician(item, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleQuickAssignTechnician(item, e.target.value);
                                e.target.blur();
                              }
                            }}
                            className="bg-white/5 border border-white/5 rounded-lg py-1 px-2.5 text-[10px] text-slate-200 outline-none hover:border-white/10 focus:border-brand-accent transition-all w-32"
                          />
                        </td>

                        {/* Status tag */}
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            item.status === 'new' ? 'bg-brand-accent/15 text-brand-accent' :
                            item.status === 'allocated' ? 'bg-brand-violet/15 text-brand-violet' :
                            item.status === 'pending' ? 'bg-brand-amber/15 text-brand-amber' :
                            item.status === 'closed' ? 'bg-brand-emerald/15 text-brand-emerald' :
                            'bg-brand-rose/15 text-brand-rose'
                          }`}>
                            {item.status || 'New'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => handleViewClick(item)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors" title="View details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditClick(item)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-brand-emerald transition-colors" title="Assign / Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {role === 'superadmin' && (
                              <button onClick={() => handleDelete(item.id, item.complaint_no)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-brand-rose transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Sliding Drawer Panel (Admin operations) */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDrawer(false); setSelectedRecord(null); }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl glass-panel shadow-premium border-l border-white/5 flex flex-col"
            >
              {/* Slide Drawer Header */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-accent/20 border border-brand-accent/35 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-brand-accent" />
                  </div>
                  <span className="font-bold text-base text-slate-800 dark:text-slate-100">
                    {viewOnly ? 'View Record details' : selectedRecord ? 'Update Record Allocation' : 'File Customer Complaint'}
                  </span>
                </div>
                <button
                  onClick={() => { setShowDrawer(false); setSelectedRecord(null); }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Client info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider border-b border-white/5 pb-1 flex items-center gap-1.5 pl-1">
                    <Tag className="w-3.5 h-3.5" /> Client Registrant Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">First Name *</label>
                      <input
                        type="text"
                        name="fname"
                        value={formData.fname}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Last Name</label>
                      <input
                        type="text"
                        name="lname"
                        value={formData.lname}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Contact Number *</label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Pincode</label>
                      <input
                        type="text"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Warranty Setup</label>
                      <select
                        name="warranty"
                        value={formData.warranty}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                      >
                        <option value={1}>In Warranty</option>
                        <option value={4}>Out of Warranty</option>
                        <option value={3}>N/A</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Physical Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={viewOnly}
                      rows="2"
                      className="premium-input text-slate-800 dark:text-slate-100"
                    ></textarea>
                  </div>
                </div>

                {/* Service allocations */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-bold text-brand-violet uppercase tracking-wider border-b border-white/5 pb-1 flex items-center gap-1.5 pl-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Service Allocations
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Product Category</label>
                      <select
                        name="product_category"
                        value={formData.product_category}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.category_name}>{c.category_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Product Model</label>
                      <select
                        name="product_model"
                        value={formData.product_model}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                      >
                        <option value="">Select LCD Model</option>
                        {modals.map(m => (
                          <option key={m.id} value={m.modal_name}>{m.modal_name} - {m.company_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Product Serial / IMEI</label>
                      <input
                        type="text"
                        name="product_serial_no"
                        value={formData.product_serial_no}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Product Barcode</label>
                      <input
                        type="text"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        className="premium-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Assign Technician</label>
                      <input
                        type="text"
                        name="technician"
                        value={formData.technician}
                        onChange={handleInputChange}
                        disabled={viewOnly}
                        placeholder="e.g., Alex Johnson"
                        className="premium-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    {selectedRecord && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Call Repair Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          disabled={viewOnly}
                          className="premium-input text-slate-800 dark:text-slate-100 dark:bg-[#10162A]"
                        >
                          <option value="new">New Call</option>
                          <option value="allocated">Allocated Call</option>
                          <option value="pending">Pending Repair</option>
                          <option value="closed">Closed / Completed</option>
                          <option value="cancelled">Cancelled Call</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 pl-1 tracking-wider">Diagnostics Notes</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={viewOnly}
                      rows="3"
                      placeholder="Symptoms, repair requests, details..."
                      className="premium-input text-slate-800 dark:text-slate-100"
                    ></textarea>
                  </div>
                </div>

                {!viewOnly && (
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full btn-premium py-3.5 text-sm"
                    >
                      {selectedRecord ? 'UPDATE ALLOCATION' : 'REGISTER COMPLAINT'}
                    </button>
                  </div>
                )}

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Complaints;
