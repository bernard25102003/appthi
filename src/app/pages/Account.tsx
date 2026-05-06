import { useState } from "react";
import { Package, Star, User as UserIcon, MapPin } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { orders } from "../data/mockData";

export function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">
            Bạn cần đăng nhập để xem thông tin tài khoản
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login?redirect=%2Faccount"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register?redirect=%2Faccount"
              className="bg-orange-100 text-orange-700 px-6 py-3 rounded-lg font-semibold hover:bg-orange-200 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter((order) => order.userId === user.id);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{user.name}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "orders"
                      ? "bg-orange-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>Đơn hàng</span>
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-orange-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Thông tin cá nhân</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "orders" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h2>

                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              Đơn hàng #{order.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>

                        <div className="p-6">
                          <div className="space-y-3 mb-4">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.productName} x {item.quantity}
                                </span>
                                <span className="font-semibold">
                                  {(item.price * item.quantity).toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{order.shippingAddress}</span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="font-semibold">Tổng cộng:</span>
                            <span className="text-xl font-bold text-orange-600">
                              {order.total.toLocaleString("vi-VN")}đ
                            </span>
                          </div>

                          {order.status === "delivered" && (
                            <button className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-600 py-2 rounded-lg hover:bg-orange-200 transition-colors">
                              <Star className="w-5 h-5" />
                              Đánh giá sản phẩm
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        placeholder="Chưa cập nhật"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                        readOnly
                      />
                    </div>

                    <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                      Cập nhật thông tin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
