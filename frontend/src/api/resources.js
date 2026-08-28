import { api } from './client.js'

// A generic CRUD resource bound to a controller route.
export function resource(path) {
  return {
    list: (params = {}) => {
      const qs = new URLSearchParams({ skip: 0, take: 200, ...params }).toString()
      return api.get(`${path}?${qs}`)
    },
    get: (id) => api.get(`${path}/${id}`),
    create: (body) => api.post(path, body),
    update: (id, body) => api.put(`${path}/${id}`, body),
    remove: (id) => api.del(`${path}/${id}`),
  }
}

export const Clients = resource('/Client')
export const Vehicles = resource('/Vehicle')
export const Mechanics = resource('/Mechanic')
export const Pieces = resource('/Piece')
export const WorkOrders = resource('/WorkOrder')

// WorkOrderPiece uses a composite key (workOrderId + pieceId) in the route.
export const WorkOrderPieces = {
  list: (params = {}) => {
    const qs = new URLSearchParams({ skip: 0, take: 500, ...params }).toString()
    return api.get(`/WorkOrderPiece?${qs}`)
  },
  create: (body) => api.post('/WorkOrderPiece', body),
  update: (workOrderId, pieceId, body) =>
    api.put(`/WorkOrderPiece/${workOrderId}/${pieceId}`, body),
  remove: (workOrderId, pieceId) => api.del(`/WorkOrderPiece/${workOrderId}/${pieceId}`),
}

export const Auth = {
  login: (body) => api.post('/Auth/login', body),
  register: (body) => api.post('/Auth/register', body),
}
