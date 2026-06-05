import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  User, 
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Orders({ token, role }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeRippleOrderId, setActiveRippleOrderId] = useState(null);

  const isUser = role === 'user';
  const isAdmin = role === 'admin' || role === 'superadmin';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setOrders(await response.json());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'completed') {
      setActiveRippleOrderId(orderId);
    }
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        // Smooth transition wait for approval animation
        setTimeout(() => {
          fetchOrders();
          setActiveRippleOrderId(null);
        }, 800);
      } else {
        alert(data.error || 'Failed to update order status.');
        setActiveRippleOrderId(null);
      }
    } catch (err) {
      console.error(err);
      setActiveRippleOrderId(null);
    }
  };

  // Compute stats for Admin Bento Grid
  const getBentoStats = () => {
    const stats = { pending: 0, completed: 0, cancelled: 0, total: 0 };
    orders.forEach(o => {
      stats.total++;
      if (o.status === 'pending') stats.pending++;
      else if (o.status === 'completed') stats.completed++;
      else if (o.status === 'cancelled') stats.cancelled++;
    });
    return stats;
  };

  const bentoStats = getBentoStats();

  // Helper for timeline step highlight in User view
  const getTimelineStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'completed': return 4; // Complete
      case 'cancelled': return 0;
      default: return 2;
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* 1. Header Hero Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-accent" />
            {isUser ? 'My Orders Pipeline' : 'Inventory Dispatch Operations'}
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
            {isUser ? 'Track your store inventory requests' : 'Admin Operations Control center'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-brand-accent !border-l-transparent"></span>
        </div>
      ) : (
        <>
          {/* ==================== ADMIN & SUPER ADMIN VIEW ==================== */}
          {isAdmin && (
            <div className="space-y-8">
              {/* Bento Box Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bento Card 1: Pending Queue */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-white/[0.04] bg-gradient-to-br from-amber-500/5 to-transparent flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">Awaiting Approval</span>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3">{bentoStats.pending}</h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-2">Requires stock validation and conditional decrementing approval.</p>
                </motion.div>

                {/* Bento Card 2: Successful Dispatches */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-white/[0.04] bg-gradient-to-br from-emerald-500/5 to-transparent flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase text-brand-emerald tracking-widest bg-brand-emerald/10 px-2 py-0.5 rounded">Completed Requests</span>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3">{bentoStats.completed}</h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-2">Deducted correctly under atomic database conditional limits.</p>
                </motion.div>

                {/* Bento Card 3: Aggregate Activity */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-white/[0.04] bg-gradient-to-br from-brand-accent/5 to-transparent flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase text-brand-accent tracking-widest bg-brand-accent/10 px-2 py-0.5 rounded">Aggregate Orders</span>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3">{bentoStats.total}</h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-2">Lifetime client and service center order tracking statistics.</p>
                </motion.div>

              </div>

              {/* High-Fidelity Orders List */}
              <div className="glass-panel rounded-[24px] overflow-hidden border border-white/5 shadow-premium">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.01]">
                        <th className="premium-th">ID</th>
                        <th className="premium-th">User / Client</th>
                        <th className="premium-th">Inventory Item</th>
                        <th className="premium-th text-center">Qty</th>
                        <th className="premium-th">snapshot cost</th>
                        <th className="premium-th">Date</th>
                        <th className="premium-th text-center">Status</th>
                        <th className="premium-th text-center">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-400 font-semibold">
                            No dispatch orders registered in database.
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => {
                          const isPending = o.status === 'pending';
                          const isCompleted = o.status === 'completed';
                          const isCancelled = o.status === 'cancelled';
                          const isRippling = activeRippleOrderId === o.id;

                          return (
                            <tr key={o.id} className="premium-tr group">
                              <td className="py-4 px-6 text-slate-500 font-black">#{o.id}</td>
                              
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <User className="w-3 h-3 text-slate-400" />
                                  </div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{o.username}</span>
                                </div>
                              </td>

                              <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{o.product_name}</td>
                              
                              <td className="py-4 px-6 text-center font-bold text-slate-500">
                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{o.quantity}</span>
                              </td>

                              <td className="py-4 px-6 font-bold text-brand-accent">${(o.price_at_purchase * o.quantity).toFixed(2)}</td>
                              
                              <td className="py-4 px-6 text-slate-500 text-xs">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  {o.order_date}
                                </span>
                              </td>

                              {/* Status Badge with Smooth Morphing Anim */}
                              <td className="py-4 px-6 text-center">
                                <div className="relative inline-block">
                                  {isRippling && (
                                    <span className="absolute inset-0 rounded bg-brand-emerald animate-ping opacity-60"></span>
                                  )}
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider relative z-10 transition-all duration-500 ${
                                    isPending ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                    isCompleted ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/20 shadow-sm shadow-brand-emerald/5' :
                                    'bg-brand-rose/15 text-brand-rose border border-brand-rose/20'
                                  }`}>
                                    {o.status}
                                  </span>
                                </div>
                              </td>

                              {/* Instant Approval buttons */}
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {isPending ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(o.id, 'completed')}
                                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-brand-emerald/15 hover:bg-brand-emerald text-brand-emerald hover:text-white border border-brand-emerald/25 transition-all duration-300 active:scale-95 flex items-center gap-1"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-brand-rose/15 hover:bg-brand-rose text-brand-rose hover:text-white border border-brand-rose/25 transition-all duration-300 active:scale-95 flex items-center gap-1"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Archived</span>
                                  )}
                                </div>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== USER (CUSTOMER) VIEW ==================== */}
          {isUser && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border border-white/5 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider">No Orders Filed</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Browse our display catalog or General products and submit a stock request to place your first dispatch!</p>
                </div>
              ) : (
                orders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const currentStep = getTimelineStep(o.status);
                  const isCancelled = o.status === 'cancelled';

                  return (
                    <div 
                      key={o.id} 
                      className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                    >
                      {/* Summary Row */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                        className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Order Ref: #{o.id}</span>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{o.product_name}</h4>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold uppercase pt-1">
                            <span>Qty: {o.quantity}</span>
                            <span>•</span>
                            <span className="text-slate-500">Placed on {o.order_date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                            o.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            o.status === 'completed' ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' :
                            'bg-brand-rose/10 text-brand-rose border border-brand-rose/20'
                          }`}>
                            {o.status}
                          </span>
                          
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {/* Expandable Attributes & Progress Timeline */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="border-t border-white/[0.04] bg-white/[0.005] overflow-hidden"
                          >
                            <div className="p-6 space-y-6">
                              {/* Step progress timeline */}
                              {!isCancelled ? (
                                <div className="space-y-4">
                                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest pl-1">Order Dispatch Tracking</p>
                                  <div className="relative flex justify-between items-center w-full max-w-lg mx-auto pt-4 pb-2">
                                    
                                    {/* Progression Connector Line */}
                                    <div className="absolute top-[21px] left-5 right-5 h-0.5 bg-white/[0.04] z-0">
                                      <motion.div 
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${(currentStep - 1) * 33.33}%` }}
                                        className="h-full bg-brand-accent shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                        transition={{ duration: 0.8 }}
                                      />
                                    </div>

                                    {/* Step 1: Placed */}
                                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                                        currentStep >= 1 ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-slate-900 border-white/10 text-slate-400'
                                      }`}>
                                        {currentStep >= 1 ? '✓' : '1'}
                                      </div>
                                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Placed</span>
                                    </div>

                                    {/* Step 2: Processing */}
                                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                                        currentStep >= 2 ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-slate-900 border-white/10 text-slate-400'
                                      }`}>
                                        {currentStep >= 2 ? '✓' : '2'}
                                      </div>
                                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Processing</span>
                                    </div>

                                    {/* Step 3: Shipped */}
                                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                                        currentStep >= 3 ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-slate-900 border-white/10 text-slate-400'
                                      }`}>
                                        {currentStep >= 3 ? '✓' : '3'}
                                      </div>
                                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Shipped</span>
                                    </div>

                                    {/* Step 4: Complete */}
                                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                                        currentStep >= 4 ? 'bg-brand-emerald text-white border-brand-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-900 border-white/10 text-slate-400'
                                      }`}>
                                        {currentStep >= 4 ? '✓' : '4'}
                                      </div>
                                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Complete</span>
                                    </div>

                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 rounded-xl bg-brand-rose/10 border border-brand-rose/25 text-brand-rose text-xs font-semibold flex items-center gap-2 max-w-md">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>Order cancelled. Please submit a new stock request.</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default Orders;
