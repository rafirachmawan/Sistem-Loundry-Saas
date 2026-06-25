import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  branchId?: string | null;
  branch?: {
    id: string;
    name: string;
  } | null;
}

export interface Branch {
  id: string;
  name: string;
}

interface UserState {
  users: User[];
  branches: Branch[];
  tier: string;
  maxUsers: number;
  loading: boolean;
  errorMsg: string;
  fetchUsers: () => Promise<void>;
  fetchBranches: () => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (userId: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  branches: [],
  tier: "STARTER",
  maxUsers: 1,
  loading: true,
  errorMsg: "",

  fetchUsers: async () => {
    set({ loading: true, errorMsg: "" });
    try {
      const res = await fetch("/api/owner/users");
      const data = await res.json();
      if (res.ok && data.success) {
        set({
          users: data.users,
          tier: data.tier,
          maxUsers: data.maxUsers,
          loading: false,
        });
        if (data.tier === "ENTERPRISE") {
          get().fetchBranches();
        }
      } else {
        set({ errorMsg: data.message || "Gagal memuat daftar pengguna", loading: false });
      }
    } catch (err) {
      set({ errorMsg: "Kesalahan koneksi jaringan", loading: false });
    }
  },

  fetchBranches: async () => {
    try {
      const res = await fetch("/api/owner/branches");
      const data = await res.json();
      if (res.ok && data.success) {
        set({ branches: data.branches });
      }
    } catch (err) {
      console.error(err);
    }
  },

  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  
  updateUser: (user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
    })),
    
  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),
}));
