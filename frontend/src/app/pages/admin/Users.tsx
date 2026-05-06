import { useState, useEffect } from "react";
import { UserCircle, Mail, Phone, Shield } from "lucide-react";
import api from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import type { ApiUser, PaginatedResponse } from "../../../lib/api/types";

export function AdminUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"all" | "USER" | "ADMIN">("all");

  useEffect(() => {
    api
      .get<PaginatedResponse<ApiUser>>(`${API.ADMIN.USERS}?limit=100`)
      .then((res) => setUsers(res.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((u) => u.role === selectedRole);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý người dùng</h1>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          {(["all", "USER", "ADMIN"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg ${
                selectedRole === role
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {role === "all"
                ? `Tất cả (${users.length})`
                : role === "USER"
                ? `Người dùng (${users.filter((u) => u.role === "USER").length})`
                : `Quản trị (${users.filter((u) => u.role === "ADMIN").length})`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md h-48 animate-pulse" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <UserCircle className="w-10 h-10 text-orange-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{user.name}</h3>
                {user.role === "ADMIN" && (
                  <div className="flex items-center gap-1 text-purple-600 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        ))}
      </div>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Không có người dùng nào</p>
        </div>
      )}
    </div>
  );
}
