import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaEye, FaEdit, FaSearch } from "react-icons/fa";
import { AuthContext } from "../../providers/AuthProvider";
import { toast } from "sonner"; // optional, keep if you already use it

// baseUrl should point to your API root, e.g. export const baseUrl = process.env.REACT_APP_API_URL;
import { baseUrl } from "../../utils/baseUrl";

/**
 * AllBooks.jsx
 *
 * - Fetches all books from GET `${baseUrl}/admin/book`
 * - Delete: DELETE `${baseUrl}/admin/book/:id`
 * - Update: PUT `${baseUrl}/admin/book/:id`
 *
 * Features:
 * - Responsive modern UI (table for desktop, cards for mobile)
 * - View modal (read-only)
 * - Edit modal (live image preview, validation)
 * - Optimistic UI update on edit/delete
 * - Loading skeleton + error handling + retry
 *
 * Make sure Tailwind is installed and AuthProvider provides getToken() and user.
 */

const EMPTY_FORM = {
  title: "",
  author: "",
  publishedYear: "",
  genre: "",
  price: "",
  description: "",
  imageUrl: "",
};

const AllBooks = () => {
  const { user, getToken } = useContext(AuthContext);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [selectedBook, setSelectedBook] = useState(null);
  const [isViewOpen, setViewOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  // Edit form
  const [form, setForm] = useState(EMPTY_FORM);

  // Search & sort
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("title"); // or 'price' | 'publishedYear'
  const [sortDir, setSortDir] = useState("asc");

  // Fetch books
  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${baseUrl}/admin/book`);
      const data = res.data;
      const booksData = Array.isArray(data) ? data : data.books || [];
      setBooks(booksData);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setError(err.response?.data?.message || "Failed to load books. Try again.");
      toast?.error?.("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived filtered + sorted list
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = books.filter((b) => {
      if (!q) return true;
      return (
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.genre || "").toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (sortKey === "price" || sortKey === "publishedYear") {
        const na = Number(av) || 0;
        const nb = Number(bv) || 0;
        return sortDir === "asc" ? na - nb : nb - na;
      }
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [books, query, sortKey, sortDir]);

  // Delete handler (optimistic)
  const handleDelete = async (bookId) => {
    if (!user) {
      toast?.error?.("Please log in to delete a book.");
      return;
    }
    if (!window.confirm("Permanently delete this book?")) return;

    // optimistic remove
    const prev = books;
    setBooks((s) => s.filter((b) => b._id !== bookId));

    try {
      const token = await getToken();
      await axios.delete(`${baseUrl}/admin/book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast?.success?.("Book deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast?.error?.(err.response?.data?.message || "Failed to delete. Reverting.");
      setBooks(prev); // revert
    }
  };

  // Open view modal
  const openViewModal = (book) => {
    setSelectedBook(book);
    setViewOpen(true);
  };
  const closeViewModal = () => {
    setViewOpen(false);
    setSelectedBook(null);
  };

  // Open edit modal: populate form with selectedBook fields
  const openEditModal = (book) => {
    if (!user) {
      toast?.error?.("Please log in to edit a book.");
      return;
    }
    setSelectedBook(book);
    setForm({
      title: book.title ?? "",
      author: book.author ?? "",
      publishedYear: book.publishedYear ? String(book.publishedYear) : "",
      genre: book.genre ?? "",
      price: book.price ? String(book.price) : "",
      description: book.description ?? "",
      imageUrl: book.imageUrl ?? "",
    });
    setEditOpen(true);
  };
  const closeEditModal = () => {
    setEditOpen(false);
    setSelectedBook(null);
    setForm(EMPTY_FORM);
    setUpdating(false);
  };

  // Form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Basic validation
  const validateForm = () => {
    if (!form.title || form.title.trim().length < 2) {
      toast?.error?.("Title must be at least 2 characters.");
      return false;
    }
    if (!form.author || form.author.trim().length < 2) {
      toast?.error?.("Author must be at least 2 characters.");
      return false;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      toast?.error?.("Price must be a positive number.");
      return false;
    }
    if (
      form.publishedYear &&
      (isNaN(form.publishedYear) ||
        Number(form.publishedYear) < 1000 ||
        Number(form.publishedYear) > new Date().getFullYear())
    ) {
      toast?.error?.(`Published year must be between 1000 and ${new Date().getFullYear()}.`);
      return false;
    }
    if (form.imageUrl && !/^https?:\/\/.+\.(png|jpg|jpeg|gif|webp)$/i.test(form.imageUrl.trim())) {
      toast?.error?.("Image URL must be a valid image link.");
      return false;
    }
    return true;
  };

  // Update submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedBook) return;

    setUpdating(true);

    // Prepare payload: include fields required by backend (adjust as necessary)
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      price: Number(parseFloat(form.price)),
      publishedYear: form.publishedYear ? parseInt(form.publishedYear) : undefined,
      genre: form.genre?.trim() || undefined,
      description: form.description?.trim() || undefined,
      imageUrl: form.imageUrl?.trim() || undefined,
    };

    // remove undefined keys
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    // optimistic update: create new book object to replace
    const optimistic = { ...selectedBook, ...payload };

    const prevBooks = books;
    setBooks((bs) => bs.map((b) => (b._id === selectedBook._id ? optimistic : b)));

    try {
      const token = await getToken();
      const res = await axios.put(`${baseUrl}/admin/book/${selectedBook._id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // use server response if available
      const updated = res.data?.book || res.data || optimistic;
      setBooks((bs) => bs.map((b) => (b._id === selectedBook._id ? updated : b)));
      toast?.success?.("Book updated successfully");
      closeEditModal();
    } catch (err) {
      console.error("Update failed:", err);
      toast?.error?.(err.response?.data?.message || "Failed to update. Reverting changes.");
      setBooks(prevBooks); // revert
      setUpdating(false);
    }
  };

  // Small helper to show a friendly price format
  const formatPrice = (p) => {
    if (p === null || p === undefined) return "-";
    const n = Number(p);
    if (isNaN(n)) return "-";
    return `$${n.toFixed(2)}`;
  };

  // Loading skeleton for table/cards
  const Skeleton = () => (
    <div className="animate-pulse grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow">
          <div className="h-40 bg-gray-200 rounded-md mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="flex gap-2 mt-4">
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-amber-800">All Books</h1>
          <p className="text-sm text-gray-500 mt-1">Manage catalog — edit, view or remove books</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author or genre..."
              className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 w-64"
            />
          </div>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="rounded-md border-gray-200 shadow-sm px-3 py-2"
          >
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
            <option value="price">Sort: Price</option>
            <option value="publishedYear">Sort: Year</option>
          </select>

          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
            title="Toggle sort direction"
          >
            {sortDir === "asc" ? "Asc" : "Desc"}
          </button>

          <Link
            to="/dashboard/add-book"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition"
          >
            <FaPlus /> Add Book
          </Link>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}{" "}
            <button onClick={fetchAllBooks} className="ml-3 underline text-amber-700">
              Retry
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-600">No books found.</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((book) => (
              <article
                key={book._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={book.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
                    alt={book.title}
                    className="object-cover w-full h-full"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/600x400?text=No+Image")}
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">by {book.author || "-"}</p>

                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <div>
                      <div className="text-xs text-gray-400">Year</div>
                      <div className="font-medium">{book.publishedYear || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Genre</div>
                      <div className="font-medium">{book.genre || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="font-medium">{formatPrice(book.price)}</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-3 line-clamp-3">{book.description || ""}</p>

                  <div className="mt-4 flex gap-2 items-center">
                    <button
                      onClick={() => openViewModal(book)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition text-amber-700"
                      title="View details"
                    >
                      <FaEye /> View
                    </button>

                    <button
                      onClick={() => openEditModal(book)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow-sm transition ${
                        user ? "bg-green-600 text-white border-transparent hover:bg-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                      disabled={!user}
                      title={user ? "Edit book" : "Login to edit"}
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(book._id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow-sm transition ${
                        user ? "bg-red-600 text-white border-transparent hover:bg-red-700" : "bg-gray-100 text-gray-500"
                      }`}
                      disabled={!user}
                      title={user ? "Delete book" : "Login to delete"}
                    >
                      <FaTrash /> Delete
                    </button>

                    <div className="ml-auto text-xs text-gray-400">ID: {String(book._id).slice(-6)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewOpen && selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeViewModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full z-10 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">{selectedBook.title}</h2>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img
                  src={selectedBook.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
                  alt={selectedBook.title}
                  className="w-full h-56 object-cover rounded-lg"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/600x400?text=No+Image")}
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800">{selectedBook.title}</h3>
                <p className="text-sm text-gray-500 mb-3">by {selectedBook.author}</p>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <div className="text-xs text-gray-400">Published</div>
                    <div className="font-medium">{selectedBook.publishedYear || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Genre</div>
                    <div className="font-medium">{selectedBook.genre || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="font-medium">{formatPrice(selectedBook.price)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">ID</div>
                    <div className="font-mono text-xs">{selectedBook._id}</div>
                  </div>
                </div>

                {selectedBook.description && (
                  <>
                    <div className="mt-4 text-sm text-gray-700">{selectedBook.description}</div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button onClick={closeViewModal} className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal} />
          <form
            onSubmit={handleEditSubmit}
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
          >
            <div className="flex items-start justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Book</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // reset to original
                    setForm({
                      title: selectedBook.title ?? "",
                      author: selectedBook.author ?? "",
                      publishedYear: selectedBook.publishedYear ? String(selectedBook.publishedYear) : "",
                      genre: selectedBook.genre ?? "",
                      price: selectedBook.price ? String(selectedBook.price) : "",
                      description: selectedBook.description ?? "",
                      imageUrl: selectedBook.imageUrl ?? "",
                    });
                    toast?.info?.("Form reset to original values");
                  }}
                  className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Reset
                </button>
                <button type="button" onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: preview */}
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                <div className="w-full">
                  <div className="h-56 w-full bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={form.imageUrl || selectedBook.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
                      alt={form.title || selectedBook.title}
                      className="object-cover w-full h-full"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/600x400?text=No+Image")}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="text-xs text-gray-500">Image URL</label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleEditChange}
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-md border-gray-200 p-2"
                  />
                </div>
              </div>

              {/* Right: form */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Title *</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleEditChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-200 p-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Author *</label>
                    <input
                      name="author"
                      value={form.author}
                      onChange={handleEditChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-200 p-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Published Year</label>
                    <input
                      name="publishedYear"
                      type="number"
                      min="1000"
                      max={new Date().getFullYear()}
                      value={form.publishedYear}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-200 p-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Genre</label>
                    <input
                      name="genre"
                      value={form.genre}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-200 p-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Price *</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.price}
                      onChange={handleEditChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-200 p-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">&nbsp;</label>
                    <div className="mt-1 w-full text-sm text-gray-400">ID: <span className="font-mono text-xs">{selectedBook._id}</span></div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs text-gray-500">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-200 p-2"
                    placeholder="Short description..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                disabled={isUpdating}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className={`px-4 py-2 rounded-md text-white ${isUpdating ? "bg-amber-300" : "bg-amber-600 hover:bg-amber-700"}`}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AllBooks;
