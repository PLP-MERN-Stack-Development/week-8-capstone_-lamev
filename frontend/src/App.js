import React, { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';

const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/products` : 'http://localhost:5000/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [threshold, setThreshold] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const authUrl = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth/me` : 'http://localhost:5000/api/auth/me';
      fetch(authUrl, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || quantity === '' || threshold === '' || !category) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, quantity: Number(quantity), threshold: Number(threshold), category })
      });
      if (!res.ok) throw new Error('Failed to add product');
      
      // Add to recent activity
      setRecentActivity(prev => [{
        type: 'add',
        product: name,
        timestamp: new Date().toLocaleString(),
        user: user.username
      }, ...prev.slice(0, 4)]);
      
      setName('');
      setQuantity('');
      setThreshold('');
      setCategory('');
      fetchProducts();
    } catch (err) {
      setError('Failed to add product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setEditName(product.name);
    setEditQuantity(product.quantity);
    setEditThreshold(product.threshold);
    setEditCategory(product.category || '');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, quantity: Number(editQuantity), threshold: Number(editThreshold), category: editCategory })
      });
      if (!res.ok) throw new Error('Failed to update product');
      
      // Add to recent activity
      setRecentActivity(prev => [{
        type: 'edit',
        product: editName,
        timestamp: new Date().toLocaleString(),
        user: user.username
      }, ...prev.slice(0, 4)]);
      
      setEditId(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const productToDelete = products.find(p => p._id === id);
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      
      // Add to recent activity
      setRecentActivity(prev => [{
        type: 'delete',
        product: productToDelete?.name || 'Unknown Product',
        timestamp: new Date().toLocaleString(),
        user: user.username
      }, ...prev.slice(0, 4)]);
      
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'addSample':
        setName('Sample Product');
        setQuantity('10');
        setThreshold('5');
        setCategory('General');
        break;
      case 'exportData':
        const headers = ['Name', 'Quantity', 'Threshold', 'Category', 'Status'];
        const rows = filteredProducts.map(product => [
          product.name,
          product.quantity,
          product.threshold,
          product.category,
          product.quantity <= product.threshold ? 'Low Stock' : 'OK'
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        break;
      case 'refreshData':
        fetchProducts();
        break;
      default:
        break;
    }
  };

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  const lowStockCount = products.filter(product => product.quantity <= product.threshold).length;
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.quantity * 10), 0);
  const categories = [...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !showLowStock || product.quantity <= product.threshold;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesLowStock && matchesCategory;
  });

  return (
    <div className="App">
      {/* Site Header with Branding */}
      <div className="site-header">
        <div className="brand-section">
          <div className="logo">
            <span className="logo-icon">📦</span>
            <div className="brand-text">
              <h1 className="site-title">StockMaster Pro</h1>
              <p className="site-subtitle">Smart Inventory Management System</p>
            </div>
          </div>
        </div>
        <div className="header-info">
          <div className="current-time">
            <span className="time-icon">🕒</span>
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </div>
          <div className="user-info">
            <div className="user-profile">
              <span className="welcome-text">Welcome, {user.username}!</span>
              <small className="user-email">{user.email}</small>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Stock Management</span>
      </div>
      
      {lowStockCount > 0 && (
        <div className="alert alert-warning">
          ⚠️ {lowStockCount} product{lowStockCount > 1 ? 's' : ''} {lowStockCount > 1 ? 'are' : 'is'} low on stock!
        </div>
      )}
      
      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="quick-action-btn" onClick={() => handleQuickAction('addSample')}>
            <span className="action-icon">➕</span>
            Add Sample Product
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('exportData')}>
            <span className="action-icon">📊</span>
            Export Report
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('refreshData')}>
            <span className="action-icon">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Statistics Section */}
      {showStats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <h3>Total Products</h3>
            <p className="stat-number">{totalProducts}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">⚠️</div>
            <h3>Low Stock Items</h3>
            <p className="stat-number warning">{lowStockCount}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <h3>Categories</h3>
            <p className="stat-number">{categories.length}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <h3>Total Value</h3>
            <p className="stat-number">${totalValue.toLocaleString()}</p>
          </div>
        </div>
      )}
      
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={e => setShowLowStock(e.target.checked)}
          />
          Show only low stock
        </label>
        <button className="export-btn" onClick={() => {
          const headers = ['Name', 'Quantity', 'Threshold', 'Category', 'Status'];
          const rows = filteredProducts.map(product => [
            product.name,
            product.quantity,
            product.threshold,
            product.category,
            product.quantity <= product.threshold ? 'Low Stock' : 'OK'
          ]);
          const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'products.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        }}>
          Export to CSV
        </button>
        <button 
          className="toggle-btn" 
          onClick={() => setShowStats(!showStats)}
          style={{background: 'none', border: 'none', color: '#667eea', cursor: 'pointer'}}
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="main-content">
          <form onSubmit={handleAddProduct} className="add-form">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min="0"
              required
            />
            <input
              type="number"
              placeholder="Low Stock Threshold"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              min="0"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            />
            <button type="submit">Add Product</button>
          </form>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product._id} className={product.quantity <= product.threshold ? 'low-stock' : ''}>
                    <td>
                      {editId === product._id ? (
                        <input value={editName} onChange={e => setEditName(e.target.value)} />
                      ) : product.name}
                    </td>
                    <td>
                      {editId === product._id ? (
                        <input type="number" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} />
                      ) : product.quantity}
                    </td>
                    <td>
                      {editId === product._id ? (
                        <input type="number" value={editThreshold} onChange={e => setEditThreshold(e.target.value)} />
                      ) : product.threshold}
                    </td>
                    <td>
                      {editId === product._id ? (
                        <input value={editCategory} onChange={e => setEditCategory(e.target.value)} />
                      ) : product.category}
                    </td>
                    <td>
                      <span className={`status-badge ${product.quantity <= product.threshold ? 'status-low' : 'status-ok'}`}>
                        {product.quantity <= product.threshold ? 'Low Stock' : 'OK'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editId === product._id ? (
                          <>
                            <button className="btn btn-save" onClick={handleUpdateProduct}>Save</button>
                            <button className="btn btn-cancel" onClick={() => setEditId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                            <button className="btn btn-delete" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Recent Activity Sidebar */}
        <div className="sidebar">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="no-activity">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'add' && '➕'}
                    {activity.type === 'edit' && '✏️'}
                    {activity.type === 'delete' && '🗑️'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      {activity.type === 'add' && `Added ${activity.product}`}
                      {activity.type === 'edit' && `Updated ${activity.product}`}
                      {activity.type === 'delete' && `Deleted ${activity.product}`}
                    </p>
                    <small className="activity-time">{activity.timestamp}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
