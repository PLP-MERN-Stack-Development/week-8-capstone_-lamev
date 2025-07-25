import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || quantity === '' || threshold === '') return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity: Number(quantity), threshold: Number(threshold) })
      });
      if (!res.ok) throw new Error('Failed to add product');
      setName('');
      setQuantity('');
      setThreshold('');
      fetchProducts();
    } catch (err) {
      setError('Failed to add product');
    }
  };

  return (
    <div className="App">
      <h1>Stock Management Dashboard</h1>
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
        <button type="submit">Add Product</button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className={product.quantity <= product.threshold ? 'low-stock' : ''}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{product.threshold}</td>
                <td>{product.quantity <= product.threshold ? 'Low Stock' : 'OK'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
