import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { toast } from "sonner";
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const provider = new GoogleAuthProvider();

  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const profileUpdate = (updateData) => {
    return updateProfile(auth.currentUser, updateData);
  };

  const logInUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    return signInWithPopup(auth, provider);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const logOutUser = () => {
    return signOut(auth);
  };

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    const index = cart.findIndex(b => b.bookId === item.bookId);
    let updatedCart = [...cart];

    if (index !== -1) {
      updatedCart[index].quantity += 1;
    } else {
      updatedCart.push(item);
    }

    setCart(updatedCart);
  };

   const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const removeFromCart = (bookId) => {
    const updatedCart = cart.filter(item => item.bookId !== bookId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Book removed from cart successfully')
  };


  const authInfo = {
    user,
    loading,
    setLoading,
    setUser,
    createUser,
    profileUpdate,
    logInUser,
    logOutUser,
    signInWithGoogle,
    cart,
    addToCart,
    clearCart,
    removeFromCart
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
