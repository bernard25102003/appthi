import { useParams, useNavigate } from "react-router";
import { Star, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import api from "../../lib/api/client";
import { API } from "../../lib/api/endpoints";
import type { ApiProduct, ApiReview } from "../../lib/api/types";

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const p = await api.get<ApiProduct>(API.PRODUCTS.DETAIL(slug));
        setProduct(p);
        const r = await api
          .get<ApiReview[]>(API.REVIEWS.LIST(p.id))
          .catch(() => []);
        setReviews(r ?? []);
      } catch {
        setError("Không tìm thấy sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || "",
      });
    }
    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
        <button
          onClick={() => navigate("/products")}
          className="text-orange-600 hover:underline"
        >
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={product.imageUrl || ""}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              {product.category && (
                <div className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {product.category.name}
                </div>
              )}

              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({product.reviewCount} đánh giá)
                </span>
              </div>

              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              <div className="text-4xl font-bold text-orange-600 mb-8">
                {product.price.toLocaleString("vi-VN")}đ
              </div>

              <div className="flex items-center gap-4 mb-8">
                <span className="font-semibold">Số lượng:</span>
                <div className="flex items-center gap-3 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-lg"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-r-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>

          <div className="border-t p-8">
            <h2 className="text-2xl font-bold mb-4">Mô tả chi tiết</h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description}. Sản phẩm được chế biến từ nguyên liệu tươi
              ngon, đảm bảo vệ sinh an toàn thực phẩm. Giao hàng nhanh chóng
              trong vòng 30 phút.
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="border-t p-8">
              <h2 className="text-2xl font-bold mb-6">Đánh giá từ khách hàng</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{review.user.name}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
