export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">FastFood Express</h3>
            <p className="text-gray-400 text-sm">
              Giao đồ ăn nhanh tận nơi. Chất lượng - Nhanh chóng - Tiện lợi
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Hotline: 1900-xxxx</li>
              <li>Email: support@fastfood.vn</li>
              <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Giờ làm việc</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Thứ 2 - Chủ nhật</li>
              <li>8:00 - 22:00</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          © 2026 FastFood Express. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
