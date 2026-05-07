import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Star, SlidersHorizontal } from 'lucide-react';
import { productsApi, categoriesApi, type Product, type Category } from '../services/api';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'sold' | 'rating'>('sold');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const sortMap: Record<string, { sortBy: 'price' | 'soldCount' | 'avgRating' | 'createdAt'; sortOrder: 'asc' | 'desc' }> = {
      'price-asc': { sortBy: 'price', sortOrder: 'asc' },
      'price-desc': { sortBy: 'price', sortOrder: 'desc' },
      'sold': { sortBy: 'soldCount', sortOrder: 'desc' },
      'rating': { sortBy: 'avgRating', sortOrder: 'desc' },
    };
    const { sortBy: sb, sortOrder: so } = sortMap[sortBy];
    productsApi.getAll({
      search: searchQuery || undefined,
      categoryId: selectedCategory || undefined,
      sortBy: sb,
      sortOrder: so,
      limit: 50,
    }).then(res => {
      setProducts(res?.items ?? []);
      setTotal(res?.pagination?.total ?? 0);
    }).catch(() => {});
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Sản phẩm</h1>

      {/* Filters */}
      <div className="bg-card rounded-lg p-6 mb-8 shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="sold">Bán chạy nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-muted-foreground">
            Tìm thấy {total} sản phẩm
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-card rounded-lg overflow-hidden shadow hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.images?.[0]?.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="text-sm">{parseFloat(product.avgRating).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {parseFloat(product.price).toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Đã bán {product.soldCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


