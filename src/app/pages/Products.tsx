import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Search, Filter, Grid3x3, List } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { products, categories } from "../data/mockData";

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      let matchesPrice = true;
      if (priceRange === "low") matchesPrice = product.price < 50000;
      else if (priceRange === "mid")
        matchesPrice = product.price >= 50000 && product.price < 100000;
      else if (priceRange === "high") matchesPrice = product.price >= 100000;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Sản phẩm</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-orange-600" />
                <h2 className="font-bold text-lg">Bộ lọc</h2>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === "all"}
                      onChange={() => setSelectedCategory("all")}
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <span>Tất cả</span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="text-orange-600 focus:ring-orange-600"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Giá</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "all"}
                      onChange={() => setPriceRange("all")}
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <span>Tất cả</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "low"}
                      onChange={() => setPriceRange("low")}
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <span>Dưới 50,000đ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "mid"}
                      onChange={() => setPriceRange("mid")}
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <span>50,000đ - 100,000đ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === "high"}
                      onChange={() => setPriceRange("high")}
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <span>Trên 100,000đ</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Hiển thị {filteredProducts.length} sản phẩm
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
