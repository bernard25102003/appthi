import { useState } from "react";
import { Eye, Package, CheckCircle, XCircle } from "lucide-react";
import { orders as initialOrders } from "../../data/mockData";

export function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Đã giao";
      case "processing":
        return "Đang giao";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const updateOrderStatus = (
    orderId: number,
    newStatus: "pending" | "processing" | "delivered" | "cancelled"
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý đơn hàng</h1>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedStatus === "all"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedStatus === "pending"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Chờ xác nhận ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setSelectedStatus("processing")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedStatus === "processing"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Đang giao ({orders.filter((o) => o.status === "processing").length})
          </button>
          <button
            onClick={() => setSelectedStatus("delivered")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedStatus === "delivered"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Đã giao ({orders.filter((o) => o.status === "delivered").length})
          </button>
          <button
            onClick={() => setSelectedStatus("cancelled")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedStatus === "cancelled"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Đã hủy ({orders.filter((o) => o.status === "cancelled").length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                <td className="px-6 py-4 text-sm">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                  {order.total.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-6 py-4 text-sm">
                  {order.paymentMethod === "cod" ? "COD" : "Online"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "processing")}
                        className="text-blue-600 hover:text-blue-800"
                        title="Xác nhận đơn"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                    )}
                    {order.status === "processing" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                        className="text-green-600 hover:text-green-800"
                        title="Đánh dấu đã giao"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {(order.status === "pending" ||
                      order.status === "processing") && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
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
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
          <p className="text-gray-500">Không có đơn hàng nào</p>
        </div>
      )}
    </div>
  );
}
