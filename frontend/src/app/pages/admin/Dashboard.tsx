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
import { useEffect, useState } from "react";
import api from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import type { DashboardStats } from "../../../lib/api/types";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardStats>(API.ADMIN.DASHBOARD)
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  const ordersByStatus = stats?.ordersByStatus ?? {};
  const ordersByStatusList = [
    { status: "Đã giao", count: ordersByStatus["DELIVERED"] ?? 0 },
    { status: "Đang giao", count: (ordersByStatus["SHIPPED"] ?? 0) + (ordersByStatus["PROCESSING"] ?? 0) },
    { status: "Chờ xác nhận", count: ordersByStatus["PENDING"] ?? 0 },
    { status: "Đã hủy", count: ordersByStatus["CANCELLED"] ?? 0 },
  ];

  const revenueData = [
    { name: "T1", revenue: 4200000 },
    { name: "T2", revenue: 3800000 },
    { name: "T3", revenue: 5100000 },
    { name: "T4", revenue: 4600000 },
    { name: "T5", revenue: totalRevenue },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Đơn hàng</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Sản phẩm</h3>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Người dùng</h3>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
      </div>
      )}

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
          <h2 className="text-xl font-bold mb-4">Trạng thái đơn hàng</h2>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {ordersByStatusList.map((item) => (
              <div key={item.status} className="border rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-2 text-sm">{item.status}</p>
                <p className="text-3xl font-bold text-orange-600">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
