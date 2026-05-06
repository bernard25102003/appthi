import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Star, SlidersHorizontal } from 'lucide-react';
import { mockProducts, mockCategories } from '../mockData';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'sold' | 'rating'>('sold');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'sold':
          return b.sold_count - a.sold_count;
        case 'rating':
          return b.avg_rating - a.avg_rating;
        default:
          return 0;
      }
    });

    return sorted;
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
      <h1 className="mb-8">Sản Phẩm</h1>

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
              {mockCategories.map(cat => (
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
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🍔</div>
          <h3 className="mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-muted-foreground">
            Tìm thấy {filteredAndSortedProducts.length} sản phẩm
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-card rounded-lg overflow-hidden shadow hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="text-sm">{product.avg_rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.review_count})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Đã bán {product.sold_count}
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
