import React, { useState } from 'react';
import { FileText, Type, Building, ArrowLeft, Send, AlertTriangle, CheckCircle, Camera, Hash } from "lucide-react";

function Input() {
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        kategori: '', // Changed from kategori_id to kategori
        lokasi: '',   // Changed from lokasi_id to lokasi
        prioritas: 'sedang',
        foto: null
    });

    const [submitState, setSubmitState] = useState({
        isSubmitting: false,
        error: null,
        success: false
    });

    const [previewImages, setPreviewImages] = useState([]);

    // Static categories and locations - adjusted for string values
    const kategoris = [
        { id: 'elektronik_listrik', nama: 'Elektronik & Listrik' },
        { id: 'furniture_perabotan', nama: 'Furniture & Perabotan' },
        { id: 'bangunan_struktur', nama: 'Bangunan & Struktur' },
        { id: 'sanitasi_air', nama: 'Sanitasi & Air' },
        { id: 'ac_ventilasi', nama: 'AC & Ventilasi' },
        { id: 'teknologi_it', nama: 'Teknologi & IT' }
    ];

    const lokasis = [
        { id: 'ruang_kelas_101_lantai_1_gedung_a', nama: 'Ruang Kelas 101 - Lantai 1, Gedung A' },
        { id: 'ruang_kelas_102_lantai_1_gedung_a', nama: 'Ruang Kelas 102 - Lantai 1, Gedung A' },
        { id: 'ruang_kelas_201_lantai_2_gedung_a', nama: 'Ruang Kelas 201 - Lantai 2, Gedung A' },
        { id: 'ruang_kelas_202_lantai_2_gedung_a', nama: 'Ruang Kelas 202 - Lantai 2, Gedung A' },
        { id: 'laboratorium_komputer_lantai_1_gedung_b', nama: 'Laboratorium Komputer - Lantai 1, Gedung B' },
        { id: 'perpustakaan_lantai_2_gedung_b', nama: 'Perpustakaan - Lantai 2, Gedung B' },
        { id: 'kantin_lantai_1_gedung_c', nama: 'Kantin - Lantai 1, Gedung C' },
        { id: 'aula_lantai_1_gedung_c', nama: 'Aula - Lantai 1, Gedung C' },
        { id: 'toilet_lantai_1_gedung_a', nama: 'Toilet Lantai 1 - Gedung A' },
        { id: 'toilet_lantai_2_gedung_a', nama: 'Toilet Lantai 2 - Gedung A' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 0) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const file = files[0];
            
            if (!allowedTypes.includes(file.type)) {
                setSubmitState({
                    isSubmitting: false,
                    error: 'Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.',
                    success: false
                });
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setSubmitState({
                    isSubmitting: false,
                    error: 'Ukuran file terlalu besar. Maksimal 5MB.',
                    success: false
                });
                return;
            }

            setFormData(prev => ({
                ...prev,
                foto: file
            }));

            const previews = files.map(file => ({
                file,
                url: URL.createObjectURL(file),
                name: file.name
            }));
            
            setPreviewImages(previews);
        }
    };

    const removePreviewImage = (index) => {
        setPreviewImages(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index].url);
            return newPreviews;
        });
        
        if (previewImages.length === 1) {
            setFormData(prev => ({ ...prev, foto: null }));
        }
    };

    const validateForm = () => {
    const errors = [];

    console.log("Form Data:", formData); // Debug log

    // Pastikan bahwa judul dan deskripsi tidak kosong setelah trim
    if (!formData.judul || !formData.judul.trim()) {
        errors.push('Judul laporan harus diisi');
    }

    if (!formData.deskripsi || !formData.deskripsi.trim()) {
        errors.push('Deskripsi kerusakan harus diisi');
    }

    if (!formData.kategori) {
        errors.push('Kategori harus dipilih');
    }

    if (!formData.lokasi) {
        errors.push('Lokasi harus dipilih');
    }

    return errors;
};

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
        setSubmitState({
            isSubmitting: false,
            error: validationErrors.join(', '),
            success: false
        });
        return;
    }

    setSubmitState({ isSubmitting: true, error: null, success: false });

    try {
        // Option 1: Send as JSON (recommended if backend expects JSON)
        const submitData = {
            judul: formData.judul.trim(),
            deskripsi: formData.deskripsi.trim(),
            prioritas: formData.prioritas,
            kategori: formData.kategori,
            lokasi: formData.lokasi,
            // foto: formData.foto // Handle file separately if needed
        };

        console.log('Data being sent:', submitData);

        const response = await fetch('https://tcc-kelompok9-be-995193249744.us-central1.run.app/laporan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submitData),
        });

        const result = await response.json();

        if (response.ok) {
            setSubmitState({ 
                isSubmitting: false, 
                error: null, 
                success: true 
            });

            console.log('Laporan berhasil dibuat:', result);

            // Reset form and redirect after successful submission
            setTimeout(() => {
                setFormData({
                    judul: '',
                    deskripsi: '',
                    kategori: '',
                    lokasi: '',
                    prioritas: 'sedang',
                    foto: null
                });
                setPreviewImages([]);
                setSubmitState({ isSubmitting: false, error: null, success: false });
                
                // Redirect to home page
                window.location.href = '/home'; // atau '/home' sesuai route Anda
            }, 2000);
        } else {
            // Handle non-200 response
            throw new Error(result.message || `HTTP Error: ${response.status}`);
        }

    } catch (error) {
        console.error('Error submitting form:', error);
        
        setSubmitState({
            isSubmitting: false,
            error: error.message || 'Terjadi kesalahan saat mengirim laporan',
            success: false
        });
    }
};


    const handleCancel = () => {
        if (window.confirm('Apakah Anda yakin ingin membatalkan? Data yang telah diisi akan hilang.')) {
            setFormData({
                judul: '',
                deskripsi: '',
                kategori: '',
                lokasi: '',
                prioritas: 'sedang',
                foto: null
            });
            setPreviewImages([]);
            setSubmitState({ isSubmitting: false, error: null, success: false });
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#764ba2',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '1rem 0'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1rem'
                }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}>
                        <ArrowLeft size={20} />
                        <span>Kembali ke Dashboard</span>
                    </button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <FileText size={24} color="#3b82f6" />
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#1e293b'
                        }}>Buat Laporan Baru</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                maxWidth: '800px',
                margin: '2rem auto',
                padding: '0 1rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '2rem'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1e293b'
                        }}>Form Pelaporan Kerusakan</h2>
                        <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '0.875rem'
                        }}>Lengkapi form di bawah ini untuk membuat laporan kerusakan sarana prasarana</p>
                    </div>

                    {/* Success Message */}
                    {submitState.success && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}>
                            <CheckCircle size={20} />
                            <span>Laporan berhasil dibuat!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {submitState.error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}>
                            <AlertTriangle size={20} />
                            <span>{submitState.error}</span>
                        </div>
                    )}

                    <div>
                        <form onSubmit={handleSubmit}>
                            {/* Judul */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    Judul Laporan *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Type style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af'
                                    }} size={18} />
                                    <input
                                        type="text"
                                        name="judul"
                                        value={formData.judul}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan judul laporan (contoh: Kerusakan AC Ruang Kelas 101)"
                                        required
                                        disabled={submitState.isSubmitting}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Kategori */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    Kategori Kerusakan *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Hash style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af'
                                    }} size={18} />
                                    <select
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleInputChange}
                                        required
                                        disabled={submitState.isSubmitting}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {kategoris.map(kategori => (
                                            <option key={kategori.id} value={kategori.nama}>
                                                {kategori.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Lokasi */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    Lokasi Kerusakan *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Building style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af'
                                    }} size={18} />
                                    <select
                                        name="lokasi"
                                        value={formData.lokasi}
                                        onChange={handleInputChange}
                                        required
                                        disabled={submitState.isSubmitting}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="">Pilih Lokasi</option>
                                        {lokasis.map(lokasi => (
                                            <option key={lokasi.id} value={lokasi.nama}>
                                                {lokasi.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Prioritas */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    Tingkat Prioritas
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <AlertTriangle style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af'
                                    }} size={18} />
                                    <select
                                        name="prioritas"
                                        value={formData.prioritas}
                                        onChange={handleInputChange}
                                        disabled={submitState.isSubmitting}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="rendah">Rendah</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="tinggi">Tinggi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    Deskripsi Kerusakan *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FileText style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '0.75rem',
                                        color: '#9ca3af'
                                    }} size={18} />
                                    <textarea
                                        name="deskripsi"
                                        rows="4"
                                        value={formData.deskripsi}
                                        onChange={handleInputChange}
                                        placeholder="Jelaskan secara detail kerusakan yang ditemukan..."
                                        required
                                        disabled={submitState.isSubmitting}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            resize: 'vertical',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    disabled={submitState.isSubmitting}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitState.isSubmitting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        cursor: submitState.isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {submitState.isSubmitting ? (
                                        <>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #ffffff',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            Mengirim Laporan...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Kirim Laporan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default Input;
