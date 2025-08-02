import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home/Home.jsx";
import Shop from "./pages/shop/Shop.jsx";
import BookDetails from "./pages/singlebooks/BookDetails.jsx";
import EditBook from "./pages/editBook/EditBook.jsx";
import AddBook from "./pages/addBook/AddBook.jsx";
import { ToastContainer } from "react-toastify";
import Login from "./pages/authPage/Login.jsx";
import AuthProvider from "./providers/AuthProvider.jsx";
import Register from "./pages/authPage/Register.jsx";
import { Toaster } from 'sonner';
import Cart from "./pages/Cart/cart.jsx";
import CheckoutPage from "./pages/checkout/Checkout.jsx";
import About from "./pages/About/About.jsx";
import Contact from "./pages/About/Contact.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ToastContainer />
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />

          <Route path="/books" element={<Shop />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/books/edit/:id" element={<EditBook />} />
          <Route path="/books/add" element={<AddBook />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/user/cart" element={<Cart />} />
          <Route path="/user/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<About />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </AuthProvider>

  </BrowserRouter>
);
