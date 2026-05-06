import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { orders, products } from '../data/mockData';

export function Dashboard() {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
  const totalProducts = products.length;
  const avgOrderValue = totalRevenue / totalOrders;

  const ordersByStatus = [
    { status: 'Chờ xác nhận', count: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { status: 'Đã xác nhận', count: orders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
    { status: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length, color: '#8b5cf6' },
    { status: 'Hoàn thành', count: orders.filter(o => o.status === 'completed').length, color: '#10b981' },
    { status: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
  ];

  const revenueData = [
    { date: '01/05', revenue: 850000 },
    { date: '02/05', revenue: 1200000 },
    { date: '03/05', revenue: 950000 },
    { date: '04/05', revenue: 1400000 },
    { date: '05/05', revenue: 1100000 },
    { date: '06/05', revenue: totalRevenue },
  ];

  const topProducts = [...products]
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Tổng đơn hàng"
          value={totalOrders.toString()}
          color="bg-blue-500"
        />
        <StatCard
          icon={DollarSign}
          label="Tổng doanh thu"
          value={`${totalRevenue.toLocaleString('vi-VN')}đ`}
          color="bg-green-500"
        />
        <StatCard
          icon={Package}
          label="Tổng sản phẩm"
          value={totalProducts.toString()}
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Giá trị TB/đơn"
          value={`${Math.round(avgOrderValue).toLocaleString('vi-VN')}đ`}
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu 6 ngày gần nhất</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('vi-VN')}đ`} />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
            </LineChart>
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
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  </td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.sold_count}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{product.avg_rating}</span>
                      <span className="text-gray-500 text-sm">({product.review_count})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{product.price.toLocaleString('vi-VN')}đ</td>
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
