export interface User {
  id: number;
  username: string;
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: Pagination;
}
