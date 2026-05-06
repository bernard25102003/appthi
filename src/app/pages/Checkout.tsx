import { useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Wallet, CheckCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    paymentMethod: "cod" as "cod" | "online",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const shippingFee = totalPrice > 150000 ? 0 : 20000;
  const finalTotal = totalPrice + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
      navigate("/account");
    }, 3000);
  };

  if (items.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ giao hàng trong vòng 30 phút.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển đến trang tài khoản...
          </p>
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
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value as "cod",
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
                      value="online"
                      checked={formData.paymentMethod === "online"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value as "online",
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
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
