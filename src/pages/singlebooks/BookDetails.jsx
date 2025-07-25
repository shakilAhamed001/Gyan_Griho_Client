import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useBooks } from '../../context/BookContext';
import { baseUrl } from "../../utils/baseUrl";
import { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../providers/AuthProvider';

const BookDetails = () => {
  const { id } = useParams();
  const { currentBook, loading, error, fetchBookDetails, clearCurrentBook } = useBooks();
   const { user, logOutUser } = useContext(AuthContext);
  window.scrollTo(0, 0);

  useEffect(() => {
    fetchBookDetails(id);
    return () => clearCurrentBook();
  }, [id, fetchBookDetails, clearCurrentBook]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-amber-500">Loading...</div>
      </div>
    );
  }
// const handleAddToCart = () => {
//   //  let cart = localStorage.getItem("cart");
//   // cart = cart ? JSON.parse(cart) : [];
//   // console.log({cart});
//   // // Check if item already exists
//   // if(cart.length === 0) {
//   //   // If cart is empty, add the item with quantity 1
//   //   cart.push({ ...currentBook, quantity: 1 });
//   //   localStorage.setItem("cart", JSON.stringify(cart));
//   //   return;
//   // }
//   // const existingIndex = cart.findIndex(i => i._id === currentBook._id);
//   // console.log({existingIndex});
//   // if (existingIndex >= 0) {
//   //   // If already in cart, increase quantity
//   //   cart[existingIndex].quantity += 1;
//   // } else if(existingIndex === -1) {
//   //   // Otherwise add new item with quantity 1
//   //   return ;
//   // }else{
//   //   cart.push({ ...item, quantity: 1 });
//   // }

//   // // Save back to localStorage
//   // localStorage.setItem("cart", JSON.stringify(cart));
//     let cart = localStorage.getItem("cart");
//   cart = cart ? JSON.parse(cart) : [];

//   // Check if item already exists
//   const existingIndex = cart.findIndex(i => i._id === currentBook._id);

//   if (existingIndex >= 0) {
//     // If already in cart, increase quantity
//     cart[existingIndex].quantity += 1;
//   } else {
//     // Otherwise add new item with quantity 1
//     cart.push({ ...currentBook, quantity: 1 });
//   }

//   // Save back to localStorage
//   localStorage.setItem("cart", JSON.stringify(cart));
// }
  const handleAddToCart = () => {
    const data = {
      bookId: currentBook._id,
      title: currentBook.title,
      author: currentBook.author,
      price: currentBook.price,
      imageUrl: currentBook.imageUrl || '/placeholder-book.jpg',
      quantity: 1,
      genre: currentBook.genre,
      publishedYear: currentBook.publishedYear || 'N/A',
      description: currentBook.description || 'No description available.',
      userEmail: user.email,
    }
    axios.post(`${baseUrl}/cart`, data)
         .then(() => {
           alert('Book added successfully');
          //  reset();
         })
         .catch((err) => {
           alert(`Error adding book: ${err.message}`);
         });
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Book not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        to="/books" 
        className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-8 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        Back to Books
      </Link>

      <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentBook.imageUrl || '/placeholder-book.jpg'}
              alt={currentBook.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Title and Author */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentBook.title}</h1>
            <p className="text-xl text-gray-600">by {currentBook.author}</p>
          </div>

          {/* Price and Genre */}
          <div className="space-y-2">
            <p className="text-2xl font-bold text-amber-500">
              {(currentBook.price).toFixed(2)} $
            </p>
            <p className="text-gray-600">
              Genre: <span className="text-gray-900">{currentBook.genre}</span>
            </p>
            {currentBook.publishedYear && (
              <p className="text-gray-600">
                Published: <span className="text-gray-900">{currentBook.publishedYear}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {currentBook.description || 'No description available.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            {
              user ? (
                 <button onClick={handleAddToCart} className=" bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center">
              <FaShoppingCart className="mr-2" />
              Add to Cart
            </button>
              ) : ( 
                <Link to="/auth/login" className=" bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center">
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </Link>
              )
              }
          </div>
          {/* Additional Details */}
          {currentBook.isbn && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">ISBN</p>
                  <p className="text-gray-900">{currentBook.isbn}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pages</p>
                  <p className="text-gray-900">{currentBook.pages || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Language</p>
                  <p className="text-gray-900">{currentBook.language || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Format</p>
                  <p className="text-gray-900">{currentBook.format || 'Paperback'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;