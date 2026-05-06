import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Order, PaymentMethod } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  removeFromCart: (product_id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  createOrder: (data: { name: string; phone: string; address: string; payment_method: PaymentMethod }) => Promise<Order>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id);
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    toast.success('Đã thêm vào giỏ hàng');
  };

  const updateQuantity = (product_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product_id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product_id === product_id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (product_id: string) => {
    setItems(prev => prev.filter(item => item.product_id !== product_id));
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const createOrder = async (data: { name: string; phone: string; address: string; payment_method: PaymentMethod }): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const order: Order = {
      id: 'ORD' + Date.now().toString().slice(-6),
      user_id: '1',
      total_price: totalPrice,
      status: 'pending',
      payment_method: data.payment_method,
      name: data.name,
      phone: data.phone,
      address: data.address,
      created_at: new Date().toISOString(),
      items: items,
    };

    clearCart();
    return order;
  };

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalPrice, createOrder }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
