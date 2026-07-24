import React, { useState } from 'react';
import { db, storage } from './firebase'; // Sesuaikan jalur file konfigurasi firebase Anda
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function MenuPage() {
  const [namaMenu, setNamaMenu] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [stokAwal, setStokAwal] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengambil file foto dari galeri HP
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Fungsi untuk menyimpan menu baru beserta upload foto ke Firebase Storage
  const handleSimpanMenu = async (e) => {
    e.preventDefault();
    if (!namaMenu || !hargaJual || !imageFile) {
      alert('Mohon isi nama menu, harga jual, dan pilih foto dari galeri!');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload foto galeri ke Firebase Storage
      const storageRef = ref(storage, `menu_images/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Simpan data menu dan URL gambar ke Firestore Database
      await addDoc(collection(db, "menu"), {
        nama: namaMenu,
        hargaBeli: Number(hargaBeli),
        hargaJual: Number(hargaJual),
        stok: Number(stokAwal),
        imageUrl: downloadURL,
        createdAt: new Date()
      });

      alert('Menu berhasil disimpan & diterbitkan ke POS!');
      
      // Reset form setelah berhasil
      setNamaMenu('');
      setHargaBeli('');
      setHargaJual('');
      setStokAwal('');
      setImageFile(null);
    } catch (error) {
      console.error("Gagal menyimpan menu:", error);
      alert('Terjadi kesalahan saat mengunggah foto atau menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#0f172a', minHeight: '100vh', paddingBottom: '100px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Tambah Menu Baru</h2>
      
      <form onSubmit={handleSimpanMenu} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>NAMA MENU</label>
          <input 
            type="text" 
            value={namaMenu} 
            onChange={(e) => setNamaMenu(e.target.value)} 
            placeholder="Contoh: Es Teh Manis"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>HARGA BELI MODAL (RP)</label>
          <input 
            type="number" 
            value={hargaBeli} 
            onChange={(e) => setHargaBeli(e.target.value)} 
            placeholder="25000"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>HARGA JUAL MENU (RP)</label>
          <input 
            type="number" 
            value={hargaJual} 
            onChange={(e) => setHargaJual(e.target.value)} 
            placeholder="35000"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>STOK AWAL</label>
          <input 
            type="number" 
            value={stokAwal} 
            onChange={(e) => setStokAwal(e.target.value)} 
            placeholder="60"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>PILIH FOTO MENU DARI GALERI HP</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', cursor: 'pointer' }}
          />
          {imageFile && (
            <p style={{ fontSize: '11px', color: '#38bdf8', marginTop: '6px' }}>
              File terpilih: {imageFile.name}
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '10px', 
            padding: '14px', 
            borderRadius: '10px', 
            background: '#10b981', 
            color: '#fff', 
            fontWeight: 'bold', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          {loading ? 'Mengunggah & Menyimpan...' : '+ Simpan & Terbitkan Menu ke POS'}
        </button>

      </form>
    </div>
  );
}
