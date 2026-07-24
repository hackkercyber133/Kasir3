import React, { useState } from 'react';
import { auth, db } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Menyimpan/memperbarui profil user ke Firestore
  const simpanProfil = async (user, namaTambahan) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      nama: namaTambahan || user.displayName || user.email,
      email: user.email,
      photoURL: user.photoURL || null,
      lastLogin: serverTimestamp()
    }, { merge: true });
  };

  // Login dengan Google (Gmail)
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await simpanProfil(result.user);
    } catch (err) {
      console.error("Gagal login dengan Google:", err);
      setError(pesanErrorFirebase(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Daftar akun baru pakai email & password
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!nama.trim() || !email.trim() || !password) {
      setError('Nama, email, dan password wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: nama.trim() });
      await simpanProfil(result.user, nama.trim());
    } catch (err) {
      console.error("Gagal mendaftar:", err);
      setError(pesanErrorFirebase(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Login pakai email & password yang sudah terdaftar
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      await simpanProfil(result.user);
    } catch (err) {
      console.error("Gagal login:", err);
      setError(pesanErrorFirebase(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Terjemahkan kode error Firebase ke bahasa Indonesia yang mudah dipahami
  const pesanErrorFirebase = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email ini sudah terdaftar. Coba menu "Masuk" sebagai gantinya.';
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/weak-password':
        return 'Password terlalu lemah, minimal 6 karakter.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Email atau password salah.';
      case 'auth/wrong-password':
        return 'Password salah.';
      case 'auth/popup-closed-by-user':
        return 'Popup Google ditutup sebelum login selesai.';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah. Coba lagi.';
      default:
        return 'Terjadi kesalahan saat proses autentikasi. Coba lagi.';
    }
  };

  const tabButtonStyle = (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    background: active ? '#10b981' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
    transition: 'all 0.2s'
  });

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    outline: 'none',
    fontSize: '13px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '11px',
    opacity: 0.7,
    display: 'block',
    marginBottom: '5px',
    textAlign: 'left'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1e293b',
        padding: '30px',
        borderRadius: '16px',
        border: '1px solid #334155',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '4px', fontSize: '22px', fontWeight: 'bold' }}>AuraPOS Enterprise</h2>
        <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '20px' }}>Masuk atau daftar untuk melanjutkan</p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: '#0f172a', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button style={tabButtonStyle(authMode === 'google')} onClick={() => { setAuthMode('google'); setError(''); }}>Google</button>
          <button style={tabButtonStyle(authMode === 'login')} onClick={() => { setAuthMode('login'); setError(''); }}>Masuk</button>
          <button style={tabButtonStyle(authMode === 'register')} onClick={() => { setAuthMode('register'); setError(''); }}>Daftar</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {/* Mode: Google */}
        {authMode === 'google' && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? 'Memproses...' : 'Masuk dengan Akun Google'}
          </button>
        )}

        {/* Mode: Login manual */}
        {authMode === 'login' && (
          <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" style={inputStyle} autoComplete="email" />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" style={inputStyle} autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        )}

        {/* Mode: Daftar akun baru */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>NAMA LENGKAP</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Anda" style={inputStyle} autoComplete="name" />
            </div>
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" style={inputStyle} autoComplete="email" />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" style={inputStyle} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
              {loading ? 'Memproses...' : 'Daftar Akun Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
