import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const [mycart, setMyCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart items for the current user
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${baseUrl}/cart`);
        const result = response.data.filter(
          (item) => item.userEmail === user.email
        );
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
      console.log("Deleting cart item:", id);
      const res = await axios.delete(`${baseUrl}/cart/${id}`);
      console.log("Delete response:", res.data);
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

  if (loading) return <div className="p-6 text-center">Loading cart...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Billing Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Billing Information
          </h2>
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="John Doe"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Dhaka"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="1207"
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

        {/* Right: Cart Summary */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h2>
          {mycart.map((book) => (
            <div
              key={book._id}
              className="flex gap-4 border-b border-gray-200 pb-4 mb-4"
            >
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-24 h-32 object-cover rounded"
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
                  ${Number(book.price).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemoveItem(book._id)}
                  className="mt-2 text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-700">${totalPrice.toFixed(2)}</span>
          </div>

          <button className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition duration-300">
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
