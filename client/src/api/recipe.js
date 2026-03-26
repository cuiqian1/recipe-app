import { get, post, put, del } from './request'

export const getRecipes = (params) => get('/recipes', params)
export const getRecipeDetail = (id) => get(`/recipes/${id}`)
export const createRecipe = (data) => post('/recipes', data)
export const updateRecipe = (id, data) => put(`/recipes/${id}`, data)
export const deleteRecipe = (id) => del(`/recipes/${id}`)
export const copyRecipe = (id) => post(`/recipes/${id}/copy`)
export const getRandomRecipes = (size = 6) => get('/recipes/random', { size })
export const getHotRecipes = (size = 10) => get('/recipes/hot', { size })
