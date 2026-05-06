import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, Filter, Grid3x3, List } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import api from "../../lib/api/client";
import { API } from "../../lib/api/endpoints";
import type { ApiProduct, ApiCategory, PaginatedResponse } from "../../lib/api/types";

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories once
  useEffect(() => {
    api
      .get<ApiCategory[]>(API.CATEGORIES.LIST)
      .then((res) => setCategories(res ?? []))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (priceRange === "low") {
          params.set("maxPrice", "50000");
        } else if (priceRange === "mid") {
          params.set("minPrice", "50000");
          params.set("maxPrice", "100000");
        } else if (priceRange === "high") {
          params.set("minPrice", "100000");
        }
        params.set("limit", "50");

        const res = await api.get<PaginatedResponse<ApiProduct>>(
          `${API.PRODUCTS.LIST}?${params.toString()}`
        );
        setProducts(res.data ?? []);
        setTotal(res.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
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
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.slug}
                        onChange={() => setSelectedCategory(category.slug)}
                        className="text-orange-600 focus:ring-orange-600"
                      />
                      <span>{category.name}</span>
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
                Hiển thị {products.length} / {total} sản phẩm
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

            {error && (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
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
                {products.map((product) => (
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
