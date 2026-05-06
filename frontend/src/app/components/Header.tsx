import { Link } from "react-router";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-600">
            FastFood
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-orange-600 transition-colors">
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="hover:text-orange-600 transition-colors"
            >
              Sản phẩm
            </Link>
            <Link
              to="/account"
              className="hover:text-orange-600 transition-colors"
            >
              Tài khoản
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-orange-600"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Đăng nhập</span>
              </Link>
            )}

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/account"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tài khoản
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left hover:text-orange-600 transition-colors"
                >
                  Đăng xuất
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hover:text-orange-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="hover:text-orange-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
