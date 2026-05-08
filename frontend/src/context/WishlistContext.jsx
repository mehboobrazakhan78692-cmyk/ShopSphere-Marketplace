import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shopsphere_wishlist')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shopsphere_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.find((i) => i._id === product._id)) return prev;
      toast.success('Added to wishlist ❤️');
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((i) => i._id !== id));
    toast('Removed from wishlist', { icon: '💔' });
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.find((i) => i._id === product._id);
    if (exists) removeFromWishlist(product._id);
    else addToWishlist(product);
  };

  const isWishlisted = (id) => wishlistItems.some((i) => i._id === id);

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted, wishlistCount: wishlistItems.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
