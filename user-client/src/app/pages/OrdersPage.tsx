import { Link, useNavigate } from 'react-router';
import { Package } from 'lucide-react';
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

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login?redirect=/orders');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Lịch Sử Đơn Hàng</h1>

      {mockOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="mb-4">Chưa có đơn hàng nào</h2>
          <Link
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-card rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="mb-1">Đơn hàng #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-clamp-1">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-muted-foreground">Tổng cộng:</span>
                <span className="font-bold text-primary text-xl">
                  {order.total_price.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
