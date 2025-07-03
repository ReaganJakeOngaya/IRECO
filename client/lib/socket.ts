import { io } from 'socket.io-client'

const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : ''

const socket = io('http://localhost:5000', {
  autoConnect: false,
  transports: ['websocket'],
  query: { user_id: userId }
})

export default socket
