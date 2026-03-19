import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ defaultValue = '', onSearch, placeholder = 'Tìm sách...' }) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (onSearch) {
      onSearch(q);
    } else if (q) {
      navigate(`/sach?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-l-lg border border-green-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
      />
      <button
        type="submit"
        className="rounded-r-lg bg-green-800 px-4 py-2 text-white text-sm font-medium hover:bg-green-700 transition"
      >
        Tìm
      </button>
    </form>
  );
}
