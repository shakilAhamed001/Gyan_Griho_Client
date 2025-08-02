import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const Cart = () => {
  const { user, cart, removeFromCart } = useContext(AuthContext);
  console.log({cart})
  const [mycart, setMyCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  // Fetch cart items for the current user
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${baseUrl}/cart`);
        const result = response.data.filter(
          (item) => item.userEmail === user.email
        );
        console.log({result})
        setMyCart(result);
      } catch (err) {
        setError("Failed to fetch cart.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchCart();
    }
  }, [user]);

  // Remove a cart item
  const handleRemoveItem = async (id) => {
    try {
      await axios.delete(`${baseUrl}/cart/${id}`);
      setMyCart((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error removing item:", err.response?.data || err.message);
    }
  };

  // Submit billing form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert("Billing info submitted!");
  };

  // Calculate total price
  const totalPrice = mycart.reduce(
    (acc, book) => acc + Number(book.price) * Number(book.quantity),
    0
  );

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading cart...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-10">
        {/* Left: Sticky Billing Form */}
        <div className="sticky top-24 self-start bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Billing Information
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                value={user?.email || ""}
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="123 Main Street"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Dhaka"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="1207"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Confirm Details
            </button>
          </form>
        </div>

        {/* Right: Scrollable Cart Summary */}
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            cart?.map((book) => (
              <div
                key={book?.bookId}
                className="flex gap-5 border-b border-gray-200 pb-5 mb-5 last:border-none last:mb-0"
              >
                <img
                  src={book?.imageUrl}
                  alt={book.title}
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500">by {book.author}</p>
                  <p className="text-sm text-gray-600 italic">
                    Published: {book.publishedYear}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{book.description}</p>
                  <p className="text-sm text-gray-700 mt-1">Qty: {book.quantity}</p>
                  <p className="text-green-700 font-bold mt-2">
                    ${(Number(book.price) * Number(book.quantity)).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(book.bookId)}
                    className="mt-2 text-red-600 text-sm cursor-pointer hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Total Price */}
          {cart.length > 0 && (
            <div className="flex justify-between items-center text-lg font-semibold mt-6 border-t border-gray-300 pt-4">
              <span>Total:</span>
              <span className="text-green-700">${totalItems.toFixed(2)}</span>
            </div>
          )}

          <button
            disabled={cart.length === 0}
            // onClick={clearCart}
            className={`mt-6 w-full py-3 cursor-pointer rounded-md font-semibold text-white transition ${
              cart.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
