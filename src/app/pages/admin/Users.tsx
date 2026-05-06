import { useState } from "react";
import { UserCircle, Mail, Phone, MapPin, Shield } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "user" | "admin";
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "0901234567",
    address: "123 Main St, District 1, Ho Chi Minh City",
    role: "user",
    joinedDate: "2026-01-15",
    totalOrders: 2,
    totalSpent: 394000,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "0912345678",
    address: "456 Second St, District 3, Ho Chi Minh City",
    role: "user",
    joinedDate: "2026-02-20",
    totalOrders: 5,
    totalSpent: 1250000,
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@fastfood.vn",
    phone: "0923456789",
    address: "789 Admin St, District 1, Ho Chi Minh City",
    role: "admin",
    joinedDate: "2025-12-01",
    totalOrders: 0,
    totalSpent: 0,
  },
];

export function AdminUsers() {
  const [users] = useState<User[]>(mockUsers);
  const [selectedRole, setSelectedRole] = useState<"all" | "user" | "admin">(
    "all"
  );

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((u) => u.role === selectedRole);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý người dùng</h1>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedRole("all")}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === "all"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả ({users.length})
          </button>
          <button
            onClick={() => setSelectedRole("user")}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === "user"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Người dùng ({users.filter((u) => u.role === "user").length})
          </button>
          <button
            onClick={() => setSelectedRole("admin")}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === "admin"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Quản trị ({users.filter((u) => u.role === "admin").length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{user.name}</h3>
                {user.role === "admin" && (
                  <div className="flex items-center gap-1 text-purple-600 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{user.phone}</span>
              </div>

              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{user.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {user.totalOrders}
                </p>
                <p className="text-xs text-gray-600">Đơn hàng</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {(user.totalSpent / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-gray-600">Tổng chi tiêu</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Tham gia: {new Date(user.joinedDate).toLocaleDateString("vi-VN")}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Không có người dùng nào</p>
        </div>
      )}
    </div>
  );
}
