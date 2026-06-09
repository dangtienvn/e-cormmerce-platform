import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (product) => {
        const { cartItems } = get();
        const existingItem = cartItems.find((item) => item.id === product.id);
        
        if (existingItem) {
          set({
            cartItems: cartItems.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({ cartItems: [...cartItems, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (productId) => {
        set({ cartItems: get().cartItems.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        set({
          cartItems: get().cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        });
      },
      clearCart: () => set({ cartItems: [] }),
      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      getCartCount: () => {
        return get().cartItems.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage', // saves to localstorage automatically
    }
  )
);

export default useCartStore;
