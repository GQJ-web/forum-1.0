import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import { Post, PaginatedPosts } from '../types';

export const PostList: React.FC = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  
  // Search and filter states
  const [searchTitle, setSearchTitle] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [sortByLength, setSortByLength] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchTitle) params.append('title', searchTitle);
      if (searchUser) params.append('username', searchUser);
      if (searchCategory) params.append('category', searchCategory);
      if (sortByLength) params.append('sort_by_length', sortByLength);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data: PaginatedPosts = await res.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  }, [pagination.page, pagination.limit, searchTitle, searchUser, searchCategory, sortByLength]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Forum</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user.username}</span>
              <Link to="/create" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                New Post
              </Link>
              <button onClick={logout} className="text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
              <Link to="/register" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Register</Link>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Fuzzy)</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                placeholder="Search category..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by Content Length</label>
              <select
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                value={sortByLength}
                onChange={(e) => setSortByLength(e.target.value)}
              >
                <option value="">Newest First (Default)</option>
                <option value="asc">Shortest First</option>
                <option value="desc">Longest First</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700">
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No posts found.</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                    {post.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>By <span className="font-medium text-gray-700">{post.username}</span></span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
