import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Star, TrendingUp } from 'lucide-react';
import { categoriesApi, productsApi, type Category, type Product } from '../services/api';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    categoriesApi.getAll().then(data => setCategories(data || [])).catch(() => {});
    productsApi
      .getAll({ sortBy: 'soldCount', sortOrder: 'desc', limit: 6 })
      .then(res => setFeaturedProducts(res?.items || []))
      .catch(() => {});
  }, []);

  const categoryEmoji = (idx: number) => {
    const emojis = ['🍔', '🍕', '🍗', '🍝', '🥤', '🍰'];
    return emojis[idx % emojis.length];
  };

  return (
    <div>
      {/* Banner */}
      <section className="bg-gradient-to-r from-primary to-accent text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl mb-4">
            Đồ Ăn Nhanh Ngon Miệng
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Giao tận nơi trong 30 phút - Nóng hổi, tươi ngon
          </p>
          <Link
            to="/products"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Đặt hàng ngay
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">Danh Mục Sản Phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, idx) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="bg-card p-6 rounded-lg text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-2">
                  {category.icon || categoryEmoji(idx)}
                </div>
                <h3 className="text-sm">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-12">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h2>Sản Phẩm Nổi Bật</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-card rounded-lg overflow-hidden shadow hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={product.images?.[0]?.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="text-sm">{parseFloat(product.avgRating).toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} đánh giá)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {parseFloat(product.price).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Đã bán {product.soldCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

