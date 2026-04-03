import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: (token, user) => {
    set({ token, user });
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("user", JSON.stringify(user));
  },

  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      if (token && user) {
        set({ token, user: JSON.parse(user) });
      }
    } catch (e) {
      console.error("Failed to load auth", e);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
