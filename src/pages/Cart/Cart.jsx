import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";


const Cart = () => {
    const { user, logOutUser } = useContext(AuthContext);
    const [mycart, setMyCart]= useState([]); 

    useEffect(() => {
    const fetchCart = async () => {
        const response = await axios.get(`${baseUrl}/cart`);
        const result = response.data.filter(item => item.userEmail == user.email);
        setMyCart(result);
    };
    if (user?.email) { // To ensure user is loaded
        fetchCart();
    }
}, [user]);
    return (
         <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

            {mycart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
            ) : (
                <div className="flex flex-col gap-6">
                    {mycart.map((item, index) => (
                        <div key={index} className="flex flex-col md:flex-row bg-white shadow rounded-xl p-4 hover:scale-[1.01] transition">
                            <img src={item.imageUrl} alt={item.title} className="w-full md:w-48 h-auto object-cover rounded-lg" />
                            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                                <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                                <p className="text-gray-700 mb-1"><span className="font-semibold">Author:</span> {item.author}</p>
                                <p className="text-gray-700 mb-1"><span className="font-semibold">Genre:</span> {item.genre} | <span className="font-semibold">Year:</span> {item.publishedYear}</p>
                                <p className="text-gray-600 mb-2"><span className="font-semibold">Description:</span> {item.description.slice(0, 100)}...</p>
                                <p className="text-lg font-semibold mb-1">Price: ${item.price}</p>
                                <p className="text-lg font-semibold">Quantity: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* {mycart.length > 0 && (
                <div className="mt-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Total: ${totalPrice.toFixed(2)}</h2>
                    <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
                        Proceed to Checkout
                    </button>
                </div>
            )} */}
        </div>
    )
}
export default Cart