import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginPage from './login';
import MenuPage from './Menu';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memantau status login user secara real-time
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a', color: '#fff' }}>
        <p>Memuat AuraPOS...</p>
      </div>
    );
  }

  // Jika belum login, tampilkan halaman Login. Jika sudah, tampilkan menu POS.
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      {user ? (
        <div>
          {/* Header Bar dengan Info User & Tombol Keluar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#1e293b', borderBottom: '1px solid #334155', color: '#fff' }}>
            <span style={{ fontSize: '13px' }}>Halo, <b>{user.displayName || user.email}</b></span>
            <button 
              onClick={() => signOut(auth)}
              style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Keluar
            </button>
          </div>
          <MenuPage />
        </div>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}
