import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function AdminLayout() {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Sản phẩm", icon: Package },
    { path: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
    { path: "/admin/users", label: "Người dùng", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-600">Admin Panel</h1>
        </div>

        <nav className="px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-orange-600 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
