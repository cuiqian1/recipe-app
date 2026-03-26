import { get, post, put } from './request'

export const login = (nickname) => post('/users/login', { nickname })
export const getUsers = () => get('/users')
export const updateUser = (id, data) => put(`/users/${id}`, data)
