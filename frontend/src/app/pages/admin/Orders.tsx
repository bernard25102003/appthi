import { useState, useEffect } from "react";
import { Eye, Package, CheckCircle, XCircle } from "lucide-react";
import api from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import type { ApiOrder, PaginatedResponse } from "../../../lib/api/types";

export function AdminOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchOrders = async () => {
    try {
      const res = await api.get<PaginatedResponse<ApiOrder>>(
        `${API.ADMIN.ORDERS}?limit=100`
      );
      setOrders(res.data ?? []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchOrders().finally(() => setIsLoading(false));
  }, []);

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "Đã giao";
      case "SHIPPED":
        return "Đang giao";
      case "PROCESSING":
        return "Đang xử lý";
      case "PENDING":
        return "Chờ xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      await api.patch(API.ADMIN.ORDER_STATUS(orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as ApiOrder["status"] } : o
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý đơn hàng</h1>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {["all", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedStatus === s
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s === "all"
                ? `Tất cả (${orders.length})`
                : `${getStatusText(s)} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
      ) : (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Mã đơn</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ngày đặt</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thanh toán</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                  {order.finalAmount.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-6 py-4 text-sm">{order.paymentMethod}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "PROCESSING")}
                        className="text-blue-600 hover:text-blue-800"
                        title="Xác nhận đơn"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                    )}
                    {order.status === "PROCESSING" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                        className="text-green-600 hover:text-green-800"
                        title="Đánh dấu đang giao"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {order.status === "SHIPPED" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                        className="text-green-600 hover:text-green-800"
                        title="Đánh dấu đã giao"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {(order.status === "PENDING" || order.status === "PROCESSING") && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        className="text-red-600 hover:text-red-800"
                        title="Hủy đơn"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-800" title="Xem chi tiết">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
