import { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { orders, Order, OrderStatus } from '../data/mockData';
import { toast } from 'sonner';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export function Orders() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = selectedStatus
    ? orders.filter(order => order.status === selectedStatus)
    : orders;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Mã đơn</th>
                <th className="text-left py-3 px-4 text-gray-600">Khách hàng</th>
                <th className="text-left py-3 px-4 text-gray-600">Tổng tiền</th>
                <th className="text-left py-3 px-4 text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-4 text-gray-600">Thanh toán</th>
                <th className="text-left py-3 px-4 text-gray-600">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{order.id}</td>
                    <td className="py-3 px-4">{order.name}</td>
                    <td className="py-3 px-4">{order.total_price.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.payment_method === 'COD' ? 'COD' : 'Chuyển khoản'}</td>
                    <td className="py-3 px-4">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const getNextStatuses = (status: OrderStatus): OrderStatus[] => {
    switch (status) {
      case 'pending':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        return ['shipping', 'cancelled'];
      case 'shipping':
        return ['completed', 'cancelled'];
      case 'completed':
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${statusLabels[newStatus]}"?`)) {
      const index = orders.findIndex(o => o.id === order.id);
      if (index > -1) {
        orders[index].status = newStatus;
        setCurrentStatus(newStatus);
        toast.success('Đã cập nhật trạng thái đơn hàng');
      }
    }
  };

  const nextStatuses = getNextStatuses(currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Thông tin khách hàng</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Tên:</span> {order.name}</p>
                <p><span className="text-gray-600">SĐT:</span> {order.phone}</p>
                <p><span className="text-gray-600">Địa chỉ:</span> {order.address}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Thông tin đơn hàng</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Mã đơn:</span> {order.id}</p>
                <p><span className="text-gray-600">Tổng tiền:</span> {order.total_price.toLocaleString('vi-VN')}đ</p>
                <p>
                  <span className="text-gray-600">Trạng thái:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}>
                    {statusLabels[currentStatus]}
                  </span>
                </p>
                <p><span className="text-gray-600">Thanh toán:</span> {order.payment_method === 'COD' ? 'COD' : 'Chuyển khoản'}</p>
                <p><span className="text-gray-600">Thời gian:</span> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Sản phẩm</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Hình ảnh</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Tên sản phẩm</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Đơn giá</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Số lượng</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      </td>
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4">{item.price.toLocaleString('vi-VN')}đ</td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      <td className="py-2 px-4">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {nextStatuses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Cập nhật trạng thái</h3>
              <div className="flex gap-2">
                {nextStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      status === 'cancelled'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    Chuyển sang "{statusLabels[status]}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
