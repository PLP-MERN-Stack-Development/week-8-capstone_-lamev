import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth';

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body = isLogin
        ? { email, password }
        : { username, email, password };
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (isLogin && data.token) {
        localStorage.setItem('token', data.token);
        onAuth && onAuth(data.user);
      }
      if (!isLogin) {
        setIsLogin(true);
        setUsername('');
        setEmail('');
        setPassword('');
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}</button>
      </form>
      <button className="toggle-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
} 