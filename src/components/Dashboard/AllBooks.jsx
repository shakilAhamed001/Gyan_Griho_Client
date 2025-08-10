import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { baseUrl } from "../../utils/baseUrl";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaEye, FaEdit } from "react-icons/fa";
import { AuthContext } from "../../providers/AuthProvider";
import { toast } from "sonner";

const AllBooks = () => {
  const { user, getToken } = useContext(AuthContext);
  const [books, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true); // Start with true since we fetch on mount
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${baseUrl}/admin/book`);
      console.log("Fetched Books Data:", data);
      
      // Check the actual structure of your response
      // If data.books exists, use that, otherwise use data directly
      const booksData = data.books || data;
      setAllBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setError(error.response?.data?.message || "Failed to fetch books. Please try again.");
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const handleDelete = async (bookId) => {
    if (!user) {
      toast.error("Please log in to delete a book.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const token = await getToken();
      await axios.delete(`${baseUrl}/admin/book/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Book deleted successfully!");
      setAllBooks(books.filter((book) => book._id !== bookId));
    } catch (err) {
      console.error("Error deleting book:", err);
      const errorMsg = err.response?.data?.error || "Failed to delete book. Please try again.";
      toast.error(errorMsg);
    }
  };

  const openModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No books found. <button onClick={fetchAllBooks} className="text-amber-600 underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-amber-800">All Books</h2>
        <Link
          to="/dashboard/add-book"
          className="bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-all duration-300 flex items-center gap-2"
        >
          <FaPlus /> Add Book
        </Link>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={book.imageUrl || "https://via.placeholder.com/50"}
                    alt={book.title}
                    className="h-10 w-10 rounded object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{book.author}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{book.publishedYear || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">${book.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(book)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="bg-black/80 "></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Book Details</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={selectedBook.imageUrl || "https://via.placeholder.com/300"}
                        alt={selectedBook.title}
                        className="h-48 w-full md:w-48 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800">{selectedBook.title}</h4>
                      <p className="text-gray-600 mt-1">by {selectedBook.author}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Published Year</p>
                          <p className="font-medium">{selectedBook.publishedYear || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Genre</p>
                          <p className="font-medium">{selectedBook.genre || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium">${selectedBook.price}</p>
                        </div>
                      </div>
                      
                      {selectedBook.description && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="text-gray-700 mt-1">{selectedBook.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBooks;