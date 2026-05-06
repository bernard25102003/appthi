import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Tag, TrendingUp } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import api from "../../lib/api/client";
import { API } from "../../lib/api/endpoints";
import type { ApiProduct, ApiCategory, PaginatedResponse } from "../../lib/api/types";

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get<PaginatedResponse<ApiProduct>>(
            `${API.PRODUCTS.LIST}?featured=true&limit=8`
          ),
          api.get<ApiCategory[]>(API.CATEGORIES.LIST),
        ]);
        setFeaturedProducts(productsRes.data ?? []);
        setCategories(categoriesRes ?? []);
      } catch {
        // silently fallback to empty
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Đồ ăn nhanh, giao tận nơi
            </h1>
            <p className="text-xl mb-8">
              Thưởng thức món ngon yêu thích chỉ trong 30 phút
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Đặt hàng ngay
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-6 h-6 text-orange-600" />
            <h2 className="text-3xl font-bold">Danh mục món ăn</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-12 h-12 mx-auto mb-2 object-cover rounded-full"
                  />
                ) : (
                  <div className="text-4xl mb-2">🍔</div>
                )}
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md h-64 animate-pulse"
                />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-gray-500">Chưa có sản phẩm nổi bật.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Xem tất cả sản phẩm
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
