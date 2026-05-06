import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-orange-600 mb-4">FastFood</h3>
            <p className="text-gray-400">
              Hệ thống đặt đồ ăn nhanh, giao hàng tận nơi
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-orange-600 transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="hover:text-orange-600 transition-colors"
                >
                  Sản phẩm
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-orange-600 transition-colors"
                >
                  Tài khoản
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Hotline: 1900-xxxx</li>
              <li>Email: support@fastfood.vn</li>
              <li>Giờ làm việc: 8:00 - 22:00</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Theo dõi</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-600 transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-600 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-600 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 FastFood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
