import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod } from '../types';
import { toast } from 'sonner';

export function CheckoutPage() {
  const { items, totalPrice, createOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    payment_method: 'COD' as PaymentMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!isAuthenticated) {
    navigate('/login?redirect=/checkout');
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder(formData);
      toast.success('Đặt hàng thành công!');
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Thanh Toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Họ tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 bg-input-background border ${
                    errors.name ? 'border-destructive' : 'border-border'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2 bg-input-background border ${
                    errors.phone ? 'border-destructive' : 'border-border'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Địa chỉ giao hàng *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 bg-input-background border ${
                    errors.address ? 'border-destructive' : 'border-border'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.address && (
                  <p className="text-destructive text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={formData.payment_method === 'COD'}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                  <div className="text-sm text-muted-foreground">
                    Thanh toán bằng tiền mặt khi nhận hàng
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="payment_method"
                  value="BANK_TRANSFER"
                  checked={formData.payment_method === 'BANK_TRANSFER'}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Chuyển khoản ngân hàng</div>
                  <div className="text-sm text-muted-foreground">
                    Chuyển khoản qua QR Code
                  </div>
                </div>
              </label>
            </div>

            {formData.payment_method === 'BANK_TRANSFER' && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="mb-3">Thông tin chuyển khoản</h3>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>Số tài khoản:</strong> 1234567890</p>
                  <p><strong>Chủ tài khoản:</strong> CONG TY FASTFOOD EXPRESS</p>
                  <p><strong>Nội dung:</strong> DH {Date.now().toString().slice(-6)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    QR Code
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  * Quét mã QR để thanh toán nhanh chóng
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <div className="bg-card rounded-lg p-6 shadow sticky top-20">
            <h3 className="mb-4">Đơn hàng của bạn</h3>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {items.map(item => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-2 mb-1">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-secondary">Miễn phí</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold text-primary text-xl">
                  {totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
