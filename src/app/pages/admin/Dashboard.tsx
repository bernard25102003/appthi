import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingBag, Package, Users } from "lucide-react";
import { orders, products } from "../../data/mockData";

export function AdminDashboard() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = 125;

  const revenueData = [
    { name: "T1", revenue: 4200000 },
    { name: "T2", revenue: 3800000 },
    { name: "T3", revenue: 5100000 },
    { name: "T4", revenue: 4600000 },
    { name: "T5", revenue: 6200000 },
  ];

  const topProducts = products
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      sales: p.reviews,
    }));

  const ordersByStatus = [
    { status: "Đã giao", count: orders.filter((o) => o.status === "delivered").length },
    { status: "Đang giao", count: orders.filter((o) => o.status === "processing").length },
    { status: "Chờ xác nhận", count: orders.filter((o) => o.status === "pending").length },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Doanh thu</h3>
          <p className="text-2xl font-bold">
            {totalRevenue.toLocaleString("vi-VN")}đ
          </p>
          <p className="text-sm text-green-600 mt-2">+12% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Đơn hàng</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
          <p className="text-sm text-blue-600 mt-2">+8% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Sản phẩm</h3>
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-sm text-gray-500 mt-2">Đang hoạt động</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Người dùng</h3>
          <p className="text-2xl font-bold">{totalUsers}</p>
          <p className="text-sm text-purple-600 mt-2">+15% so với tháng trước</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Doanh thu 5 tháng gần nhất</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString("vi-VN")}đ`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ea580c"
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Top 5 sản phẩm bán chạy</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#ea580c" name="Lượt bán" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Trạng thái đơn hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ordersByStatus.map((item) => (
            <div key={item.status} className="border rounded-lg p-4 text-center">
              <p className="text-gray-600 mb-2">{item.status}</p>
              <p className="text-3xl font-bold text-orange-600">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
