import React from 'react';
import { Smartphone, LayoutGrid, Send, Search } from 'lucide-react';
import ProductPagination from '../shared/ProductPagination';
import SearchFilter from '../shared/SearchFilter';

export default function StockPage({
  role,
  shopId,
  session,
  forms,
  setForms,
  data,
  saving,
  needsSpecificShop,
  ownerInventoryQuantity,
  myInventoryQuantity,
  updateStock,
  addInventoryBatch,
  setTransferDrawerOpen,
  openStockCategoriesHub,
  shopkeeperStockSearch,
  setShopkeeperStockSearch,
  stockFilters,
  setStockFilters,
  shopkeeperStockItems,
  stockWithOwnership,
  stockPager,
  pageLoading,
  setStockPager,
  setSelectedProductDetails,
  productName,
  fullModelList,
  priceLabel,
  FormPanel,
  Input,
  Select,
  Empty,
}) {
  const stockList = role === 'shopkeeper' ? shopkeeperStockItems : stockWithOwnership;

  return (
    <section className="space">
      <section className="stock-workspace-intro">
        <div className="stock-workspace-copy">
          <span className="stock-eyebrow">Inventory workspace</span>
          <h2>
            {role === 'shopkeeper' 
              ? 'Manage your stock without mixing it with main warehouse stock' 
              : 'Keep daily stock work simple'}
          </h2>
          <p>
            {role === 'shopkeeper'
              ? 'Main warehouse stock remains available for sales. Quantity updates here are saved as your personal shopkeeper inventory.'
              : 'Update quantities, receive purchase batches, and transfer stock here. Browse categories, filter inventory, and export reports on the dedicated categories page.'}
          </p>
        </div>
        <button className="stock-category-link" type="button" onClick={openStockCategoriesHub}>
          <span className="stock-category-link-icon"><LayoutGrid size={22} /></span>
          <span>
            <b>Open Stock Categories</b>
            <small>Browse, filter, and export inventory</small>
          </span>
        </button>
      </section>

      {role === 'shopkeeper' && (
        <section className="inventory-ownership-summary compact-summary">
          <article className="ownership-summary-card owner">
            <span>Main warehouse stock available</span>
            <strong>{ownerInventoryQuantity}</strong>
            <small>Shared stock you can sell</small>
          </article>
          <article className="ownership-summary-card mine">
            <span>My shopkeeper stock</span>
            <strong>{myInventoryQuantity}</strong>
            <small>Stock added and controlled by you</small>
          </article>
        </section>
      )}

      <FormPanel 
        title={role === 'shopkeeper' ? 'Set my stock quantity' : 'Set available stock quantity'} 
        action="Save quantity" 
        onSubmit={updateStock}
      >
        <Select 
          label="Product" 
          className="md:col-span-3" 
          value={forms.stock.product_id} 
          onChange={(v) => setForms((prev) => ({ ...prev, stock: { ...prev.stock, product_id: v } }))} 
          options={data.products.map((p) => [p.id, `${productName(p)} · ${priceLabel(p.sale_price)}`])} 
        />
        <Input 
          label={role === 'shopkeeper' ? 'My quantity' : 'Available quantity'} 
          type="number" 
          className="md:col-span-1" 
          value={forms.stock.quantity} 
          onChange={(v) => setForms((prev) => ({ ...prev, stock: { ...prev.stock, quantity: v } }))} 
        />
      </FormPanel>

      {role === 'superadmin' && (
        <FormPanel 
          title="Add purchase-price batch" 
          action={saving ? 'Saving...' : 'Add batch'} 
          onSubmit={addInventoryBatch} 
          disabled={saving || needsSpecificShop}
        >
          <Select 
            label="Product" 
            className="md:col-span-3" 
            value={forms.batch.product_id} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, product_id: v } }))} 
            options={data.products.map((p) => [p.id, productName(p)])} 
          />
          <Input 
            label="Quantity received" 
            type="number" 
            className="md:col-span-1" 
            value={forms.batch.quantity} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, quantity: v } }))} 
          />
          <Input 
            label="Purchase price" 
            type="number" 
            className="md:col-span-1" 
            value={forms.batch.purchase_price} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, purchase_price: v } }))} 
          />
          <Input 
            label="Wholesale price" 
            type="number" 
            className="md:col-span-1" 
            value={forms.batch.wholesale_price} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, wholesale_price: v } }))} 
          />
          <Select 
            label="Colour" 
            className="md:col-span-1" 
            value={forms.batch.colour} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, colour: v } }))} 
            options={data.reference.colours.map((item) => [item.name, item.name])} 
          />
          <Input 
            label="Received date" 
            type="date" 
            className="md:col-span-1" 
            value={forms.batch.received_date} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, received_date: v } }))} 
          />
          <Select 
            label="Assign to shopkeeper (optional)" 
            className="md:col-span-2" 
            value={forms.batch.assigned_user_id} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, assigned_user_id: v } }))} 
            options={data.shopkeepers.filter((user) => String(user.shop_id) === String(shopId)).map((user) => [user.id, user.name])} 
          />
          <Input 
            label="Batch notes" 
            className="md:col-span-4" 
            value={forms.batch.notes} 
            onChange={(v) => setForms((prev) => ({ ...prev, batch: { ...prev.batch, notes: v } }))} 
          />
        </FormPanel>
      )}

      {role === 'superadmin' && (
        <section className="panel transfer-launch">
          <div>
            <h2>Branch stock transfer</h2>
            <p>Move available inventory between branches without leaving the stock workspace.</p>
          </div>
          <button className="primary" type="button" onClick={() => setTransferDrawerOpen(true)}>
            <Send size={17} /> Transfer stock
          </button>
        </section>
      )}

      <div className="stock-section-heading">
        <div>
          <span className="stock-eyebrow">Live inventory</span>
          <h2>Current stock overview</h2>
          {role === 'shopkeeper' && <p>{stockList.length} matching models</p>}
        </div>
        <div className="stock-overview-actions">
          <SearchFilter
            placeholder="Search product, model, brand, or shop"
            value={role === 'shopkeeper' ? shopkeeperStockSearch : stockFilters.search}
            onChange={(value) => {
              if (role === 'shopkeeper') setShopkeeperStockSearch(value);
              else setStockFilters((prev) => ({ ...prev, search: value }));
            }}
          />
          <button className="soft" type="button" onClick={openStockCategoriesHub}>
            <LayoutGrid size={16} /> View categories
          </button>
        </div>
      </div>

      {stockList.length ? (
        <div className="table panel inventory-stock-table">
          {stockList.map((item) => (
            <div className="row" key={item.id}>
              <div className="inventory-primary">
                <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
                  <Smartphone size={18} />
                </div>
                <span>
                  <b>{productName(item)}</b>
                  <small>{joinUniqueText([item.brand, !shopId ? item.shop_name : ''], 'No brand')}</small>
                  {role === 'shopkeeper' && (
                    <span className="stock-compatible-models">
                      <small title={fullModelList(item)}>
                        <b>Compatible:</b> {fullModelList(item) || 'No compatible models listed'}
                      </small>
                      {fullModelList(item) && (
                        <button type="button" onClick={() => setSelectedProductDetails(item)}>
                          View all
                        </button>
                      )}
                    </span>
                  )}
                </span>
              </div>
              <span className="inventory-metric">
                <small>Category</small>
                <span className="status-badge stock-ok">{item.category || 'Mobile'}</span>
              </span>
              <span className="inventory-metric">
                <small>Price</small>
                <strong>{priceLabel(item.sale_price)}</strong>
              </span>
              <div className="inventory-balance">
                <small>Total available: <b>{item.quantity} pcs</b></small>
                <div className="inventory-owner-badges">
                  <span className="owner-stock-chip">Main warehouse <b>{item.owner_quantity}</b></span>
                  <span className="my-stock-chip">
                    {role === 'shopkeeper' ? 'My stock' : 'Shopkeepers'} <b>{role === 'shopkeeper' ? item.my_quantity : item.shopkeeper_quantity}</b>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty title={role === 'shopkeeper' && shopkeeperStockSearch.trim() ? 'No models match your search' : 'No stock records found'} />
      )}

      <ProductPagination 
        meta={stockPager} 
        loading={pageLoading.stock} 
        onPageChange={(page) => setStockPager((prev) => ({ ...prev, page }))} 
      />
    </section>
  );
}

const joinUniqueText = (values = [], fallback = '') => {
  const seen = new Set();
  const unique = values.filter((value) => {
    const key = String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.join(' · ') || fallback;
};
