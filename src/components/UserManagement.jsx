import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'siswa',
    kelas: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sheets/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/sheets/users', newUser);
      
      if (response.data.success) {
        alert('User berhasil ditambahkan');
        setShowAddForm(false);
        setNewUser({
          username: '',
          password: '',
          role: 'siswa',
          kelas: ''
        });
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.error || 'Gagal menambahkan user');
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    try {
      // Note: This would require a DELETE endpoint in your API
      // For now, we'll just show a message
      alert('Fitur hapus user akan ditambahkan setelah endpoint DELETE dibuat.');
      // await axios.delete(`/api/sheets/users/${username}`);
      // fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter users berdasarkan search dan role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const colors = {
      guru: 'bg-purple-100 text-purple-800',
      siswa: 'bg-blue-100 text-blue-800',
      sekertaris: 'bg-green-100 text-green-800',
      guru_wali_murid: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role) => {
    const names = {
      guru: 'Guru BK',
      siswa: 'Siswa',
      sekertaris: 'Sekertaris',
      guru_wali_murid: 'Guru Wali Murid'
    };
    return names[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Manajemen User ({users.length} users)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Kelola akun pengguna sistem absensi
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            {showAddForm ? 'Batal' : '+ Tambah User'}
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="px-6 py-4 bg-blue-50 border-b">
          <form onSubmit={handleAddUser} className="space-y-4">
            <h3 className="font-medium text-gray-800">Tambah User Baru</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="minimal 6 karakter"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru BK</option>
                  <option value="sekertaris">Sekertaris</option>
                  <option value="guru_wali_murid">Guru Wali Murid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas (Opsional)
                </label>
                <input
                  type="text"
                  name="kelas"
                  value={newUser.kelas}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: X IPA 1"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
              >
                Simpan User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari username atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Role</option>
              <option value="guru">Guru BK</option>
              <option value="siswa">Siswa</option>
              <option value="sekertaris">Sekertaris</option>
              <option value="guru_wali_murid">Guru Wali</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.kelas || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteUser(user.username)}
                      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                    >
                      Hapus
                    </button>
                    <button
                      className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                      onClick={() => {
                        setNewUser({
                          username: user.username,
                          password: '', // Password tidak ditampilkan untuk keamanan
                          role: user.role,
                          kelas: user.kelas || ''
                        });
                        setShowAddForm(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">👤</div>
          <p className="text-gray-500 mb-2">Tidak ada user ditemukan</p>
          {searchTerm && (
            <p className="text-sm text-gray-400">
              Coba dengan kata kunci lain
            </p>
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="text-sm">
            <span className="text-gray-600">Total: </span>
            <span className="font-medium">{users.length} users</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Guru: </span>
            <span className="font-medium">{users.filter(u => u.role === 'guru').length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Siswa: </span>
            <span className="font-medium">{users.filter(u => u.role === 'siswa').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;