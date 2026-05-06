import { useParams, useNavigate } from "react-router";
import { Star, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import { products } from "../data/mockData";
import { useCart } from "../contexts/CartContext";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    navigate("/cart");
  };

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
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {product.category}
              </div>

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
                <span className="font-semibold">{product.rating}</span>
                <span className="text-gray-500">
                  ({product.reviews} đánh giá)
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
        </div>
      </div>
    </div>
  );
}
