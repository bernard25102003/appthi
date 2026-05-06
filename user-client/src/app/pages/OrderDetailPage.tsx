import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { mockOrders } from '../mockData';
import { OrderStatus } from '../types';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-secondary/20 text-secondary-foreground',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-accent/20 text-accent-foreground',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login?redirect=/orders');
    return null;
  }

  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4">Không tìm thấy đơn hàng</h2>
        <Link
          to="/orders"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Quay lại lịch sử đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/orders" className="text-primary hover:underline">
          ← Quay lại lịch sử đơn hàng
        </Link>
      </div>

      <div className="bg-card rounded-lg p-6 shadow mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="mb-2">Đơn hàng #{order.id}</h1>
            <p className="text-muted-foreground">
              Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-border">
          <div>
            <h3 className="mb-3">Thông tin người nhận</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Họ tên:</strong> {order.name}</p>
              <p><strong>Số điện thoại:</strong> {order.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.address}</p>
            </div>
          </div>
          <div>
            <h3 className="mb-3">Phương thức thanh toán</h3>
            <div className="text-sm">
              {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4">Sản phẩm</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="font-medium">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="font-bold">Tổng cộng</span>
            <span className="font-bold text-primary text-2xl">
              {order.total_price.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {order.status === 'completed' && (
          <div className="mt-6">
            <Link
              to={`/orders/${order.id}/review`}
              className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90"
            >
              Đánh giá đơn hàng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
