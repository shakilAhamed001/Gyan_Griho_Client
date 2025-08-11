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
import axios from "axios";
import { baseUrl } from "../utils/baseUrl";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartRefresh, setCartRefresh] = useState(false); // Added for cart sync
  const provider = new GoogleAuthProvider();

  // Optional: Uncomment if using Firebase Auth emulator
  // useEffect(() => {
  //   connectAuthEmulator(auth, "http://localhost:9099");
  // }, []);

  const createUser = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await fetch(`${baseUrl}/api/set-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await result.user.getIdToken()}`,
      },
      body: JSON.stringify({ uid: result.user.uid, role: "user" }),
    });
    setRole("user");
    return result;
  };

  const profileUpdate = (updateData) => {
    return updateProfile(auth.currentUser, updateData);
  };

  const logInUser = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdTokenResult();
    setRole(token.claims.role || "user");
    return result;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdTokenResult();
    if (!token.claims.role) {
      await fetch(`${baseUrl}/api/set-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await result.user.getIdToken()}`,
        },
        body: JSON.stringify({ uid: result.user.uid, role: "user" }),
      });
      setRole("user");
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

  const fetchCart = async (idToken) => {
    try {
      const response = await axios.get(`${baseUrl}/cart`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      console.log("Fetched cart in AuthProvider:", cartData);
    } catch (error) {
      console.error("Error fetching cart in AuthProvider:", error);
      setCart([]);
      toast.error("Failed to fetch cart data.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdTokenResult();
        setRole(token.claims.role || "user");
        await fetchCart(await currentUser.getIdToken());
      } else {
        setRole(null);
        setCart([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cartRefresh]);

  const logOutUser = () => {
    setCart([]);
    setRole(null);
    return signOut(auth);
  };

  const addToCart = async (item) => {
    if (!user) {
      toast.error("Please log in to add items to cart.");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(
        `${baseUrl}/cart`,
        { bookId: item.bookId, quantity: 1 },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setCartRefresh((prev) => !prev); // Trigger cart refresh
      toast.success("Book added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.error || "Failed to add to cart.");
    }
  };

  const removeFromCart = async (cartId) => {
    if (!user) {
      toast.error("Please log in to remove items from cart.");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      await axios.delete(`${baseUrl}/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setCartRefresh((prev) => !prev); // Trigger cart refresh
      toast.success("Book removed from cart successfully");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(error.response?.data?.error || "Failed to remove from cart.");
    }
  };

  const clearCart = async () => {
    if (!user) {
      toast.error("Please log in to clear cart.");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      await Promise.all(
        cart.map((item) =>
          axios.delete(`${baseUrl}/cart/${item._id}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          })
        )
      );
      setCart([]);
      setCartRefresh((prev) => !prev);
      toast.success("Cart payment successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart.");
    }
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
    role,
    setRole,
    cartRefresh,
    setCartRefresh,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;