import { Link } from "react-router";
import { ChevronRight, Tag, TrendingUp } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { products, categories, promotions } from "../data/mockData";

export function Home() {
  const featuredProducts = products.filter((p) => p.featured);

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
            <h2 className="text-3xl font-bold">Khuyến mãi hot</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-600"
              >
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-gray-600 mb-3">{promo.description}</p>
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded inline-block font-mono font-semibold">
                  {promo.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Danh mục</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-2">🍔</div>
                <h3 className="font-semibold">{category}</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

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
