import { create } from 'zustand';

const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingUser: true,
}));

export default useAuthStore;