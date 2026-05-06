import { Link, useNavigate } from 'react-router';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-2xl">🍔</span>
            </div>
            <span className="font-bold text-xl">FastFood Express</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-secondary transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="hover:text-secondary transition-colors">
              Sản phẩm
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative hover:text-secondary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/orders" className="hover:text-secondary transition-colors">
                  <Package className="w-6 h-6" />
                </Link>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="hover:text-secondary transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
