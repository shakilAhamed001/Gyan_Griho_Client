import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router";
import { FaShoppingCart } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { AuthContext } from "../providers/AuthProvider";
import { Tooltip } from "react-tooltip";
import { Bounce, toast } from "react-toastify";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logOutUser } = useContext(AuthContext);
  const  [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Shop" },
    { to: "/ebooks", label: "Ebooks" },
    { to: "/membership", label: "Membership" },
  ];

  const handleLogout = () => {
    logOutUser()
      .then(() => {
        console.log("user logged out successfully");
        const notify = () =>
          toast.error("Logged Out Successfully", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
        notify();
      })
      .catch((error) => console.log(error));
  };
  return (
    <nav className="bg-white fixed w-full top-0 z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-xl font-bold uppercase tracking-wider"
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
                    isActive
                      ? "text-amber-500"
                      : "text-gray-700 hover:text-amber-500"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4  ">
            {/* Cart Icon */}
            <NavLink
              to="/user/cart"
              className="bg-black relative text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FaShoppingCart className="h-8 w-8" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full"></span>
            </NavLink>

            <div className="navbar-end gap-4">
              {user ? (
                <div className="flex gap-2">
                  <img
                    data-tooltip-id="my-tooltip"
                    data-tooltip-place="top"
                    src={user?.photoURL}
                    referrerPolicy="no-referrer"
                    className=" w-10 md:w-12 h-10 md:h-12 object-fill rounded-full"
                    alt="logo"
                  />
                  <Tooltip id="my-tooltip" className="z-10">
                    <div className="text-center">
                      <p>{user?.displayName}</p>
                      <p>{user?.email}</p>
                    </div>
                  </Tooltip>
                  <Link
                    onClick={handleLogout}
                    className="btn  rounded-2xl bg-black text-white text-lg font-medium md:font-semibold"
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <Link
                  to={"/auth/login"}
                  className="btn rounded-2xl bg-black text-white text-lg font-medium md:font-semibold"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button - Only visible on mobile */}
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
                      isActive
                        ? "text-amber-500"
                        : "text-gray-700 hover:text-amber-500"
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
