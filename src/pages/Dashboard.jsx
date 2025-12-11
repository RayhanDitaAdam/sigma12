import React, { useState, useEffect } from 'react';
import useAuth from "../context/useAuth.js";
import axios from 'axios';
import AttendanceTable from '../components/AttendanceTable';
import UserManagement from '../components/UserManagement';
import FilterBar from '../components/FilterBar';
import StatsCard from '../components/StatsCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    kelas: '',
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('absensi');
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    sakit: 0,
    izin: 0
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.kelas) params.append('kelas', filters.kelas);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`/api/sheets/absensi?${params}`);
      setAttendanceData(response.data.data);
      
      // Calculate stats
      const statsData = {
        total: response.data.data.length,
        hadir: response.data.data.filter(d => d.status === 'Hadir').length,
        sakit: response.data.data.filter(d => d.status === 'Sakit').length,
        izin: response.data.data.filter(d => d.status === 'Izin').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (record) => {
    try {
      await axios.post('/api/sheets/absensi', record);
      fetchAttendanceData();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Gagal menambahkan data' 
      };
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const getRoleName = (role) => {
    const roleNames = {
      'guru': 'Guru BK',
      'siswa': 'Siswa',
      'sekertaris': 'Sekertaris',
      'guru_wali_murid': 'Guru Wali Murid'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">Dashboard Absensi BK</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleName(user?.role)} {user?.kelas && `• ${user.kelas}`}
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Absensi"
            value={stats.total}
            color="blue"
            icon="📊"
          />
          <StatsCard
            title="Hadir"
            value={stats.hadir}
            color="green"
            icon="✅"
          />
          <StatsCard
            title="Sakit"
            value={stats.sakit}
            color="yellow"
            icon="🤒"
          />
          <StatsCard
            title="Izin"
            value={stats.izin}
            color="purple"
            icon="📝"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('absensi')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'absensi'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Data Absensi
              </button>
              
              {user?.role === 'guru' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manajemen User
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          userRole={user?.role}
          userKelas={user?.kelas}
          onFilterChange={handleFilterChange}
        />

        {/* Content */}
        <div className="mt-8">
          {activeTab === 'absensi' ? (
            <AttendanceTable
              data={attendanceData}
              loading={loading}
              userRole={user?.role}
              userKelas={user?.kelas}
              onAddRecord={handleAddRecord}
              onRefresh={fetchAttendanceData}
            />
          ) : (
            user?.role === 'guru' && <UserManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;