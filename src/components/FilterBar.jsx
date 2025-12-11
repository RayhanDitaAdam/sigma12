import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterBar = ({ userRole, userKelas, onFilterChange }) => {
  const [kelasList, setKelasList] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    kelas: '',
    startDate: '',
    endDate: ''
  });

useEffect(() => {
  const fetchKelasList = async () => {
    try {
      const response = await axios.get('/api/sheets/kelas');
      setKelasList(response.data.kelas);
    } catch (error) {
      console.error('Error fetching kelas list:', error);
    }
  };

  fetchKelasList();
}, []);


  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Apply filter setelah semua field diisi atau ketika tombol tertekan
    if (key === 'kelas') {
      onFilterChange({ [key]: value });
    }
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      kelas: '',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // Untuk siswa, sekertaris, dan guru wali - hanya bisa melihat kelas mereka sendiri
  const filteredKelasList = userRole === 'guru' 
    ? kelasList 
    : userKelas 
      ? [userKelas]
      : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
        
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Terapkan Filter
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filter Kelas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kelas
          </label>
          <select
            value={localFilters.kelas}
            onChange={(e) => handleFilterChange('kelas', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={filteredKelasList.length === 0}
          >
            <option value="">Semua Kelas</option>
            {filteredKelasList.map((kelas, index) => (
              <option key={index} value={kelas}>
                {kelas}
              </option>
            ))}
          </select>
          {userRole !== 'guru' && userKelas && (
            <p className="text-xs text-gray-500 mt-1">
              Hanya dapat melihat kelas: {userKelas}
            </p>
          )}
        </div>

        {/* Filter Tanggal Mulai */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter Tanggal Akhir */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Active filters display */}
      {(localFilters.kelas || localFilters.startDate || localFilters.endDate) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Filter Aktif:</p>
          <div className="flex flex-wrap gap-2">
            {localFilters.kelas && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Kelas: {localFilters.kelas}
              </span>
            )}
            {localFilters.startDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Mulai: {new Date(localFilters.startDate).toLocaleDateString('id-ID')}
              </span>
            )}
            {localFilters.endDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Akhir: {new Date(localFilters.endDate).toLocaleDateString('id-ID')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;