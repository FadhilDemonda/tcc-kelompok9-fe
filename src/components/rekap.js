import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  LogOut, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Clock,
  MapPin,
  Wrench,
  FileText,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
    Save,
    ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../api/axiosInstance'; // Gunakan axios instance yang sudah ada

const RekapanLaporan = () => {
  const [stats, setStats] = useState({
    total_completed: 0,
    avg_penyelesaian_hari: 0,
    total_biaya: 0,
    laporan_per_bulan: []
  });
  
  const [completedReports, setCompletedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [error, setError] = useState(null);

  // Mock user data
  const [user, setUser] = useState({ nama: '', email: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}, []);

  // Fetch completed reports from API
  const fetchCompletedReports = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        status: 'completed'
      };
      
      if (search) {
        params.search = search;
      }

      // Gunakan axios instance
      const response = await api.get('/laporan-summary', { params });
      
      if (response.data.success) {
        const { laporan, pagination: paginationData } = response.data.data;
        setCompletedReports(laporan || []);
        setPagination(paginationData);
        
        // Calculate stats from the data
        calculateStats(laporan || []);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Gagal memuat data laporan. Silakan coba lagi.');
      setCompletedReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from reports data
  const calculateStats = (reports) => {
    const totalCompleted = reports.length;
    const totalBiaya = reports.reduce((sum, report) => sum + parseFloat(report.biaya || 0), 0);
    const avgPenyelesaian = reports.length > 0 
      ? reports.reduce((sum, report) => sum + (report.lama_penyelesaian_hari || 0), 0) / reports.length 
      : 0;

    // Group by month for trend data
    const monthlyData = reports.reduce((acc, report) => {
      const month = new Date(report.tanggal_lapor).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const laporan_per_bulan = Object.entries(monthlyData).map(([bulan, jumlah]) => ({
      bulan,
      jumlah
    })).sort((a, b) => a.bulan.localeCompare(b.bulan));

    setStats({
      total_completed: totalCompleted,
      avg_penyelesaian_hari: Math.round(avgPenyelesaian * 10) / 10,
      total_biaya: totalBiaya,
      laporan_per_bulan
    });
  };

  // Update report
  const updateReport = async (reportId, updateData) => {
    try {
      const response = await api.put(`/laporan/${reportId}`, updateData);
      if (response.data.success) {
        // Refresh data
        await fetchCompletedReports(currentPage, searchTerm);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Gagal mengupdate laporan');
      return false;
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return;
    }

    try {
      const response = await api.delete(`/laporan/${reportId}`);
      if (response.data.success) {
        // Refresh data
        await fetchCompletedReports(currentPage, searchTerm);
        alert('Laporan berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Gagal menghapus laporan');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCompletedReports(currentPage, searchTerm);
  }, [currentPage]);

  // Search functionality
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchCompletedReports(1, searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': 
      case 'tinggi': return 'priority-high';
      case 'medium': 
      case 'sedang': return 'priority-medium';
      case 'low': 
      case 'rendah': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'Tinggi';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return priority;
    }
  };

  const openDetailModal = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  const closeDetailModal = () => {
    setShowDetail(false);
    setSelectedReport(null);
  };

  const openEditModal = (report) => {
    setEditingReport({ ...report });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingReport(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReport) return;

    const success = await updateReport(editingReport.id, {
      judul: editingReport.judul,
      kategori: editingReport.kategori,
      lokasi: editingReport.lokasi,
      teknisi: editingReport.teknisi,
      prioritas: editingReport.prioritas,
      biaya: parseFloat(editingReport.biaya)
    });

    if (success) {
      closeEditModal();
      alert('Laporan berhasil diupdate');
    }
  };

  const handleEditChange = (field, value) => {
    setEditingReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportData = () => {
    // Simple CSV export
    const headers = ['ID Laporan', 'Judul', 'Kategori', 'Lokasi', 'Teknisi', 'Prioritas', 'Biaya', 'Tanggal Lapor', 'Tanggal Selesai', 'Lama Penyelesaian'];
    const csvContent = [
      headers.join(','),
      ...completedReports.map(report => [
        report.laporan_id,
        `"${report.judul}"`,
        `"${report.kategori}"`,
        `"${report.lokasi}"`,
        `"${report.teknisi}"`,
        getPriorityText(report.prioritas),
        report.biaya,
        formatDate(report.tanggal_lapor),
        formatDate(report.tanggal_selesai),
        report.lama_penyelesaian_hari
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekapan-laporan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && completedReports.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat data rekapan...</p>
      </div>
    );
  }

  return (
    <div className="rekapan-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
                  <div className="header-left">
                  <Link to="/homeadmin" className="back-btn">
  <ArrowLeft size={18} />
  Kembali
</Link>

            <Shield className="header-icon" size={28} />
            <div>
              <h1>Rekapan Laporan Selesai</h1>
              <p>Sistem Pelaporan Kerusakan Sarana Prasarana</p>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <User size={20} />
              <span>{user.nama || user.name || 'User'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card completed">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Selesai</h3>
            <p className="stat-number">{stats.total_completed}</p>
            <span className="stat-label">Laporan</span>
          </div>
        </div>

        <div className="stat-card time">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Rata-rata Penyelesaian</h3>
            <p className="stat-number">{stats.avg_penyelesaian_hari}</p>
            <span className="stat-label">Hari</span>
          </div>
        </div>

        <div className="stat-card cost">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Biaya</h3>
            <p className="stat-number">{formatCurrency(stats.total_biaya)}</p>
            <span className="stat-label">Rupiah</span>
          </div>
        </div>

        <div className="stat-card trend">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Bulan Ini</h3>
            <p className="stat-number">{stats.laporan_per_bulan[stats.laporan_per_bulan.length - 1]?.jumlah || 0}</p>
            <span className="stat-label">Laporan</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Cari berdasarkan judul, teknisi, atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => fetchCompletedReports(currentPage, searchTerm)}>
            <Filter size={18} />
            Refresh
          </button>
          <button className="btn-primary" onClick={exportData}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        {loading && (
          <div className="table-loading">
            <div className="loading-spinner"></div>
            <p>Memuat data...</p>
          </div>
        )}
        
        {!loading && completedReports.length === 0 ? (
          <div className="no-data">
            <FileText size={48} />
            <h3>Tidak ada data</h3>
            <p>Belum ada laporan yang selesai atau sesuai dengan pencarian Anda.</p>
          </div>
        ) : (
          <>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID Laporan</th>
                  <th>Judul</th>
                  <th>Lokasi</th>
                  <th>Teknisi</th>
                  <th>Prioritas</th>
                  <th>Biaya</th>
                  <th>Lama Penyelesaian</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {completedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="report-id">{report.laporan_id}</td>
                    <td className="report-title">{report.judul}</td>
                    <td>
                      <div className="location-info">
                        <MapPin size={14} />
                        {report.lokasi}
                      </div>
                    </td>
                    <td>
                      <div className="technician-info">
                        <Wrench size={14} />
                        {report.teknisi}
                      </div>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityColor(report.prioritas)}`}>
                        {getPriorityText(report.prioritas)}
                      </span>
                    </td>
                    <td className="cost-cell">{formatCurrency(parseFloat(report.biaya))}</td>
                    <td className="duration-cell">{report.lama_penyelesaian_hari} hari</td>
                    <td>
                      <div className="action-buttons-cell">
                        <button 
                          className="btn-view"
                          onClick={() => openDetailModal(report)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn-edit"
                          onClick={() => openEditModal(report)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Sebelumnya
                </button>
                <span className="pagination-info">
                  Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="pagination-btn"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedReport && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Laporan</h2>
              <button className="modal-close" onClick={closeDetailModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID Laporan:</label>
                  <span>{selectedReport.laporan_id}</span>
                </div>
                <div className="detail-item">
                  <label>Judul:</label>
                  <span>{selectedReport.judul}</span>
                </div>
                <div className="detail-item">
                  <label>Kategori:</label>
                  <span>{selectedReport.kategori}</span>
                </div>
                <div className="detail-item">
                  <label>Lokasi:</label>
                  <span>{selectedReport.lokasi}</span>
                </div>
                <div className="detail-item">
                  <label>Pelapor:</label>
                  <span>{selectedReport.pelapor}</span>
                </div>
                <div className="detail-item">
                  <label>Teknisi:</label>
                  <span>{selectedReport.teknisi}</span>
                </div>
                <div className="detail-item">
                  <label>Prioritas:</label>
                  <span className={`priority-badge ${getPriorityColor(selectedReport.prioritas)}`}>
                    {getPriorityText(selectedReport.prioritas)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Biaya:</label>
                  <span>{formatCurrency(parseFloat(selectedReport.biaya))}</span>
                </div>
                <div className="detail-item">
                  <label>Tanggal Lapor:</label>
                  <span>{formatDate(selectedReport.tanggal_lapor)}</span>
                </div>
                <div className="detail-item">
                  <label>Tanggal Selesai:</label>
                  <span>{formatDate(selectedReport.tanggal_selesai)}</span>
                </div>
                <div className="detail-item">
                  <label>Lama Penyelesaian:</label>
                  <span>{selectedReport.lama_penyelesaian_hari} hari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReport && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Laporan</h2>
              <button className="modal-close" onClick={closeEditModal}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Judul:</label>
                  <input
                    type="text"
                    value={editingReport.judul}
                    onChange={(e) => handleEditChange('judul', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kategori:</label>
                  <input
                    type="text"
                    value={editingReport.kategori}
                    onChange={(e) => handleEditChange('kategori', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lokasi:</label>
                  <input
                    type="text"
                    value={editingReport.lokasi}
                    onChange={(e) => handleEditChange('lokasi', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teknisi:</label>
                  <input
                    type="text"
                    value={editingReport.teknisi}
                    onChange={(e) => handleEditChange('teknisi', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prioritas:</label>
                  <select
                    value={editingReport.prioritas}
                    onChange={(e) => handleEditChange('prioritas', e.target.value)}
                    required
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Biaya:</label>
                  <input
                    type="number"
                    value={editingReport.biaya}
                    onChange={(e) => handleEditChange('biaya', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeEditModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          <style jsx>{`
          .back-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #edf2f7;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  color: #2d3748;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: #e2e8f0;
}

      
        .rekapan-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }


        .home-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 8px;
          border-radius: 12px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
        }

        .header-left p {
          margin: 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 25px;
          color: #2d3748;
          font-weight: 500;
        }

        .logout-btn {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn:hover {
          background: #c53030;
          transform: translateY(-2px);
        }

        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #c53030;
          cursor: pointer;
          padding: 0.25rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          padding: 1rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card.completed .stat-icon {
          background: rgba(72, 187, 120, 0.2);
          color: #48bb78;
        }

        .stat-card.time .stat-icon {
          background: rgba(237, 137, 54, 0.2);
          color: #ed8936;
        }

        .stat-card.cost .stat-icon {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .stat-card.trend .stat-icon {
          background: rgba(236, 72, 153, 0.2);
          color: #ec4899;
        }

        .stat-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #718096;
          font-weight: 500;
        }

        .stat-number {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #a0aec0;
        }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem 1rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
          gap: 1rem;
        }

        .search-container {
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s ease;
        }
              .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #2d3748;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
          transform: translateY(-2px);
        }

        .table-container {
          background: white;
          margin: 1rem 2rem 3rem 2rem;
          padding: 1.5rem;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
        }

        .reports-table th, .reports-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #edf2f7;
          text-align: left;
          font-size: 0.95rem;
        }

        .reports-table th {
          background: #f7fafc;
          color: #4a5568;
          font-weight: 600;
        }

        .reports-table td {
          color: #2d3748;
        }

        .priority-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .priority-high {
          background-color: rgba(245, 101, 101, 0.2);
          color: #c53030;
        }

        .priority-medium {
          background-color: rgba(237, 137, 54, 0.2);
          color: #ed8936;
        }

        .priority-low {
          background-color: rgba(72, 187, 120, 0.2);
          color: #38a169;
        }

        .action-buttons-cell button {
          background: none;
          border: none;
          cursor: pointer;
          margin: 0 4px;
          padding: 0.4rem;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .btn-view:hover {
          background-color: #ebf8ff;
          color: #3182ce;
        }

        .btn-edit:hover {
          background-color: #faf089;
          color: #d69e2e;
        }

        .btn-delete:hover {
          background-color: #fed7d7;
          color: #c53030;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1rem;
          gap: 1rem;
        }

        .pagination-btn {
          padding: 0.5rem 1rem;
          background: #e2e8f0;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .pagination-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .pagination-info {
          color: white;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .detail-grid, .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item, .form-group {
          display: flex;
          flex-direction: column;
        }

        .detail-item label, .form-group label {
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: #4a5568;
        }

        .detail-item span, .form-group input, .form-group select {
          font-size: 0.95rem;
          color: #2d3748;
        }

        .form-group input, .form-group select {
          padding: 0.5rem;
          border-radius: 10px;
          border: 1px solid #cbd5e0;
          outline: none;
          background-color: #edf2f7;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .no-data {
          text-align: center;
          padding: 3rem;
          color: #4a5568;
        }

        .loading-container, .table-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
        }

        .loading-spinner {
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default RekapanLaporan;
