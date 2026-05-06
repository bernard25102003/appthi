import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link
            to="/products"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-6 border-b last:border-b-0"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-orange-600 font-bold mb-3">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold">
                    {totalPrice > 150000 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      "20,000đ"
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-xl font-bold">Tổng cộng</span>
                <span className="text-2xl font-bold text-orange-600">
                  {(totalPrice > 150000
                    ? totalPrice
                    : totalPrice + 20000
                  ).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors mb-3"
              >
                Tiến hành thanh toán
              </button>

              <Link
                to="/products"
                className="block text-center text-orange-600 hover:underline"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
