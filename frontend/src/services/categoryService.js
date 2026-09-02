import { api } from './api';

export const categoryService = {
  getAll() {
    return api.get('/categories').then((res) => res.data);
  },

  getBySlug(slug) {
    return api.get(`/categories/slug/${slug}`).then((res) => res.data);
  },

  getById(id) {
    return api.get(`/categories/${id}`).then((res) => res.data);
  },
};
