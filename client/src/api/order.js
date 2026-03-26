import { get, post, put } from './request'

export const getTodayMenu = () => get('/orders/today')
export const getOrderByDate = (date) => get(`/orders/${date}`)
export const addOrderItem = (data) => post('/orders/add', data)
export const removeOrderItem = (data) => post('/orders/remove', data)
export const updateOrderStatus = (id, status) => put(`/orders/${id}/status`, { status })
export const getOrderHistory = (days = 7) => get('/orders/history', { days })
