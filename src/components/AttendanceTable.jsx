import React, { useState } from 'react';
// import axios from 'axios';

const AttendanceTable = ({ data, loading, userRole, userKelas, onAddRecord, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nama: '',
    kelas: userKelas || '',
    status: 'Hadir',
    keterangan: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await onAddRecord(newRecord);
    
    if (result.success) {
      setShowAddForm(false);
      setNewRecord({
        tanggal: new Date().toISOString().split('T')[0],
        nama: '',
        kelas: userKelas || '',
        status: 'Hadir',
        keterangan: ''
      });
    } else {
      alert(result.message);
    }
    
    setSubmitting(false);
  };

  const handleEdit = async (index) => {
    try {
      // Note: This would require an API call to update
      // For now, we'll show an alert
      alert(`Edit data pada index ${index}. Endpoint update perlu diimplementasikan.`);
      // await axios.put(`/api/sheets/absensi/${index}`, editData);
      // onRefresh();
      // setEditingIndex(null);
    } catch (error) {
      console.error('Error updating:', error);
      alert('Gagal mengupdate data');
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      // Note: This would require an API call to delete
      alert(`Hapus data pada index ${index}. Endpoint delete perlu diimplementasikan.`);
      // await axios.delete(`/api/sheets/absensi/${index}`);
      // onRefresh();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data');
    }
  };

  const canEdit = ['guru', 'sekertaris'].includes(userRole);
  const canDelete = userRole === 'guru'; // Hanya guru yang bisa delete

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Data Absensi ({data.length} records)
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
          >
            🔄 Refresh
          </button>
          
          {canEdit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              {showAddForm ? 'Batal' : '+ Tambah Data'}
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-6 py-4 bg-blue-50 border-b">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={newRecord.tanggal}
                  onChange={(e) => setNewRecord({...newRecord, tanggal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama *
                </label>
                <input
                  type="text"
                  value={newRecord.nama}
                  onChange={(e) => setNewRecord({...newRecord, nama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nama siswa"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas *
                </label>
                <input
                  type="text"
                  value={newRecord.kelas}
                  onChange={(e) => setNewRecord({...newRecord, kelas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: X IPA 1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={newRecord.status}
                  onChange={(e) => setNewRecord({...newRecord, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={newRecord.keterangan}
                  onChange={(e) => setNewRecord({...newRecord, keterangan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Keterangan (opsional)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keterangan
              </th>
              {(canEdit || canDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.tanggal}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.kelas}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                    item.status === 'Sakit' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'Izin' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.keterangan || '-'}
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingIndex(index + 2); // +2 karena row 1 adalah header
                            setEditData(item);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(index + 2)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-500 mb-2">Tidak ada data absensi</p>
          <p className="text-sm text-gray-400">
            {canEdit ? 'Mulai dengan menambahkan data baru' : 'Data akan muncul setelah ditambahkan oleh guru'}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingIndex && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Edit Data Absensi</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Edit data pada index {editingIndex}
              </p>
              {/* Form edit bisa ditambahkan di sini */}
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit(editingIndex)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;