import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  connectAuthEmulator,
} from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { toast } from "sonner";
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Added for role management
  const provider = new GoogleAuthProvider();

  // Optional: Uncomment if using Firebase Auth emulator for local development
  // useEffect(() => {
  //   connectAuthEmulator(auth, "http://localhost:9099");
  // }, []);

  const createUser = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set default role to 'user' in Firebase custom claims
    await fetch('/api/set-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await result.user.getIdToken()}`,
      },
      body: JSON.stringify({ uid: result.user.uid, role: 'user' }),
    });
    setRole('user');
    return result;
  };

  const profileUpdate = (updateData) => {
    return updateProfile(auth.currentUser, updateData);
  };

  const logInUser = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Fetch user role from custom claims
    const token = await result.user.getIdTokenResult();
    setRole(token.claims.role || 'user');
    return result;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    // Set default role to 'user' if not already set
    const token = await result.user.getIdTokenResult();
    if (!token.claims.role) {
      await fetch('/api/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await result.user.getIdToken()}`,
        },
        body: JSON.stringify({ uid: result.user.uid, role: 'user' }),
      });
      setRole('user');
    } else {
      setRole(token.claims.role);
    }
    return result;
  };

  const getToken = async () => {
    if (!user) {
      throw new Error("No authenticated user");
    }
    try {
      const token = await user.getIdToken();
      console.log("Retrieved Firebase ID Token:", token);
      return token;
    } catch (error) {
      console.error("Error retrieving ID token:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdTokenResult();
        setRole(token.claims.role || 'user');
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logOutUser = () => {
    clearCart();
    setRole(null);
    return signOut(auth);
  };

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    const index = cart.findIndex(b => b.bookId === item.bookId);
    let updatedCart = [...cart];

    if (index !== -1) {
      updatedCart[index].quantity = (updatedCart[index].quantity || 1) + 1;
    } else {
      updatedCart.push({ ...item, quantity: 1 });
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
    toast.success('Book removed from cart successfully');
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
    getToken,
    cart,
    addToCart,
    clearCart,
    removeFromCart,
    role, // Added role to context
    setRole,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;