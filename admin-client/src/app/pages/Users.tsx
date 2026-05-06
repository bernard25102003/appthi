import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { users, UserStatus } from '../data/mockData';
import { toast } from 'sonner';

export function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = (userId: string, currentStatus: UserStatus) => {
    const newStatus: UserStatus = currentStatus === 'active' ? 'locked' : 'active';
    const action = newStatus === 'locked' ? 'khóa' : 'mở khóa';

    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      const index = users.findIndex(u => u.id === userId);
      if (index > -1) {
        users[index].status = newStatus;
        toast.success(`Đã ${action} tài khoản thành công`);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Tên</th>
                <th className="text-left py-3 px-4 text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-gray-600">Số điện thoại</th>
                <th className="text-left py-3 px-4 text-gray-600">Địa chỉ</th>
                <th className="text-left py-3 px-4 text-gray-600">Vai trò</th>
                <th className="text-left py-3 px-4 text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.phone}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{user.address}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`flex items-center gap-1 px-3 py-1 rounded ${
                            user.status === 'active'
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <>
                              <Lock size={14} />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock size={14} />
                              Mở khóa
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
