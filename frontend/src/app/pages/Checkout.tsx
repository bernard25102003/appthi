import { useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Wallet, CheckCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api, { ApiError } from "../../lib/api/client";
import { API } from "../../lib/api/endpoints";
import type { ApiOrder } from "../../lib/api/types";

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    paymentMethod: "COD" as "COD" | "ONLINE",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null);

  const shippingFee = totalPrice > 150000 ? 0 : 20000;
  const finalTotal = totalPrice + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // Backend requires an addressId — create a one-off address first
      const addressRes = await api.post<{ id: string }>("/users/addresses", {
        recipientName: formData.name,
        phone: formData.phone,
        addressLine: formData.address,
        ward: "",
        district: "",
        city: "Việt Nam",
        isDefault: false,
      });

      const orderRes = await api.post<ApiOrder>(API.ORDERS.CREATE, {
        addressId: addressRes.id,
        paymentMethod: formData.paymentMethod,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setPlacedOrder(orderRes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login?redirect=/checkout");
        return;
      }
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !placedOrder) {
    navigate("/cart");
    return null;
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-2">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ giao hàng trong vòng 30 phút.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Mã đơn hàng: <span className="font-mono font-semibold">#{placedOrder.id}</span>
          </p>
          <button
            onClick={() => navigate("/account")}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Địa chỉ giao hàng *
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value as "COD",
                        })
                      }
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <Wallet className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold">Thanh toán khi nhận hàng</p>
                      <p className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="ONLINE"
                      checked={formData.paymentMethod === "ONLINE"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value as "ONLINE",
                        })
                      }
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <CreditCard className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold">Thanh toán online</p>
                      <p className="text-sm text-gray-600">
                        Thanh toán qua thẻ ATM, Visa, Mastercard
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>

                <div className="space-y-3 mb-4 pb-4 border-b">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">
                      {totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        `${shippingFee.toLocaleString("vi-VN")}đ`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </button>
                {error && (
                  <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
