import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Package, Users } from 'lucide-react';
import { dashboardApi, type DashboardStats, type Product } from '../services/api';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    dashboardApi.getStats().then(data => setStats(data || null)).catch(() => setStats(null));
    dashboardApi.getOrdersByStatus().then((data) => {
      const statusLabels: Record<string, string> = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        SHIPPING: 'Đang giao',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
      };
      setOrdersByStatus((data || []).map((d: any) => ({ status: statusLabels[d.status] ?? d.status, count: d._count })));
    }).catch(() => setOrdersByStatus([]));
    dashboardApi.getTopProducts().then(data => setTopProducts(data || [])).catch(() => setTopProducts([]));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Tổng đơn hàng"
          value={stats ? stats.totalOrders.toString() : '—'}
          color="bg-blue-500"
        />
        <StatCard
          icon={DollarSign}
          label="Tổng doanh thu"
          value={stats ? `${parseFloat(String(stats.totalRevenue)).toLocaleString('vi-VN')}đ` : '—'}
          color="bg-green-500"
        />
        <StatCard
          icon={Package}
          label="Tổng sản phẩm"
          value={stats ? stats.totalProducts.toString() : '—'}
          color="bg-purple-500"
        />
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={stats ? stats.totalUsers.toString() : '—'}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Thống kê đơn hàng theo trạng thái</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top sản phẩm bán chạy</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(topProducts || []).map(p => ({ name: p.name.slice(0, 15) + '...', sold: p.soldCount }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sold" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 sản phẩm bán chạy</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Hình ảnh</th>
                <th className="text-left py-3 px-4 text-gray-600">Tên sản phẩm</th>
                <th className="text-left py-3 px-4 text-gray-600">Đã bán</th>
                <th className="text-left py-3 px-4 text-gray-600">Đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Giá</th>
              </tr>
            </thead>
            <tbody>
              {(topProducts || []).map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {product.images?.[0] ? (
                      <img
                        src={product.images?.[0]?.thumbnailUrl ?? product.images?.[0]?.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.soldCount}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{parseFloat(product.avgRating).toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({product.reviewCount})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{parseFloat(product.price).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}
