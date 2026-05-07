import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { type PaymentMethod } from '../services/api';
import { toast } from 'sonner';

export function CheckoutPage() {
  const { items, totalPrice, createOrder } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: user?.name ?? '',
    recipientPhone: user?.phone ?? '',
    recipientAddress: user?.address ?? '',
    paymentMethod: 'COD' as PaymentMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (authLoading) return null;
  if (items.length === 0) return <Navigate to="/cart" replace />;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/checkout" replace />;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Vui lĂ²ng nháº­p há» tĂªn';
    }
    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = 'Vui lĂ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i';
    } else if (!/^[0-9]{10}$/.test(formData.recipientPhone.replace(/\s/g, ''))) {
      newErrors.recipientPhone = 'Sá»‘ Ä‘iá»‡n thoáº¡i khĂ´ng há»£p lá»‡';
    }
    if (!formData.recipientAddress.trim()) {
      newErrors.recipientAddress = 'Vui lĂ²ng nháº­p Ä‘á»‹a chá»‰ giao hĂ ng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lĂ²ng kiá»ƒm tra láº¡i thĂ´ng tin');
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder(formData);
      toast.success('Äáº·t hĂ ng thĂ nh cĂ´ng!');
      navigate(`/order-success/${order.id}`);
    } catch (error: any) {
      toast.error(error?.message ?? 'ÄĂ£ cĂ³ lá»—i xáº£y ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Thanh ToĂ¡n</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="mb-4">ThĂ´ng tin giao hĂ ng</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Há» tĂªn *</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className={`w-full px-4 py-2 bg-input-background border ${
                    errors.recipientName ? 'border-destructive' : 'border-border'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.recipientName && (
                  <p className="text-destructive text-sm mt-1">{errors.recipientName}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Sá»‘ Ä‘iá»‡n thoáº¡i *</label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className={`w-full px-4 py-2 bg-input-background border ${
                    errors.recipientPhone ? 'border-destructive' : 'border-border'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.recipientPhone && (
                  <p className="text-destructive text-sm mt-1">{errors.recipientPhone}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Äá»‹a chá»‰ giao hĂ ng *</label>
                <textarea
                  value={formData.recipientAddress}
                  onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 bg-input-background border ${
                    errors.recipientAddress ? 'border-destructive' : 'border-border'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.recipientAddress && (
                  <p className="text-destructive text-sm mt-1">{errors.recipientAddress}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="mb-4">PhÆ°Æ¡ng thá»©c thanh toĂ¡n</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Thanh toĂ¡n khi nháº­n hĂ ng (COD)</div>
                  <div className="text-sm text-muted-foreground">
                    Thanh toĂ¡n báº±ng tiá»n máº·t khi nháº­n hĂ ng
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={formData.paymentMethod === 'BANK_TRANSFER'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Chuyá»ƒn khoáº£n ngĂ¢n hĂ ng</div>
                  <div className="text-sm text-muted-foreground">
                    Chuyá»ƒn khoáº£n qua QR Code
                  </div>
                </div>
              </label>
            </div>

            {formData.paymentMethod === 'BANK_TRANSFER' && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="mb-3">ThĂ´ng tin chuyá»ƒn khoáº£n</h3>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>NgĂ¢n hĂ ng:</strong> Vietcombank</p>
                  <p><strong>Sá»‘ tĂ i khoáº£n:</strong> 1234567890</p>
                  <p><strong>Chá»§ tĂ i khoáº£n:</strong> CONG TY FASTFOOD EXPRESS</p>
                </div>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    QR Code
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  * QuĂ©t mĂ£ QR Ä‘á»ƒ thanh toĂ¡n nhanh chĂ³ng
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Äang xá»­ lĂ½...' : 'Äáº·t hĂ ng'}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <div className="bg-card rounded-lg p-6 shadow sticky top-20">
            <h3 className="mb-4">ÄÆ¡n hĂ ng cá»§a báº¡n</h3>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-2 mb-1">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} x {item.price.toLocaleString('vi-VN')}Ä‘
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}Ä‘
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Táº¡m tĂ­nh</span>
                <span>{totalPrice.toLocaleString('vi-VN')}Ä‘</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PhĂ­ váº­n chuyá»ƒn</span>
                <span className="text-secondary">Miá»…n phĂ­</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold">Tá»•ng cá»™ng</span>
                <span className="font-bold text-primary text-xl">
                  {totalPrice.toLocaleString('vi-VN')}Ä‘
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
