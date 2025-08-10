import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom"; // Updated import
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { AuthContext } from "../providers/AuthProvider";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure toast styles are imported

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logOutUser, cart: myCart, role } = useContext(AuthContext);
  console.log({ myCart });
  const totalItems = myCart.reduce((acc, item) => acc + item.quantity, 0);

  // Conditionally include Dashboard link if user is logged in and has admin role
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    ...(user && role === "admin" ? [{ to: "/dashboard", label: "Dashboard" }] : []),
  ];

  const handleLogout = () => {
    logOutUser()
      .then(() => {
        console.log("user logged out successfully");
        toast.error("Logged Out Successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          transition: "bounce",
        });
      })
      .catch((error) => {
        console.error("Logout error:", error);
        toast.error(`Logout failed: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          transition: "bounce",
        });
      });
  };

  return (
    <nav className="bg-white fixed w-full top-0 z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-xl font-bold uppercase tracking-wider text-gray-800"
          >
            Gyan<span className="text-amber-500">Griho.</span>
          </NavLink>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-amber-500" : "text-gray-700 hover:text-amber-500"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <div className="navbar-end gap-4">
              {user ? (
                <div className="flex gap-2 items-center">
                  {/* Cart Icon */}
                  <NavLink
                    to="/user/cart"
                    className="bg-black relative text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <FaShoppingCart className="h-8 w-8" />
                    {myCart?.length > 0 && (
                      <span className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                        {totalItems}
                      </span>
                    )}
                  </NavLink>
                  {user?.photoURL ? (
                    <img
                      data-tooltip-id="my-tooltip"
                      data-tooltip-place="top"
                      src={user?.photoURL}
                      referrerPolicy="no-referrer"
                      className="w-10 md:w-12 h-10 md:h-12 object-fill rounded-full"
                      alt="User profile"
                    />
                  ) : (
                    <FaUser
                      data-tooltip-id="my-tooltip"
                      data-tooltip-place="top"
                      className="w-6 md:w-8 h-8 md:h-10 text-gray-700"
                    />
                  )}
                  <Tooltip id="my-tooltip" className="z-10">
                    <div className="text-center">
                      <p>{user?.displayName || "N/A"}</p>
                      <p>{user?.email}</p>
                    </div>
                  </Tooltip>
                  <button
                    onClick={handleLogout}
                    className="btn rounded-2xl bg-black text-white text-lg font-medium md:font-semibold hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="btn rounded-2xl bg-black text-white text-lg font-medium md:font-semibold hover:bg-gray-800"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 hover:text-amber-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-3">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `text-sm font-medium py-2 transition-colors ${
                      isActive ? "text-amber-500" : "text-gray-700 hover:text-amber-500"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;