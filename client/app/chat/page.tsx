'use client'

import React, { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import socket from '@/lib/socket'

interface Room {
  id: string
  name: string
}

interface Message {
  id?: string
  room: string
  content: string
  username: string
  timestamp?: Date
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    socket.connect()

    const messageHandler = (msg: Message) => {
      setMessages(prev => [...prev, msg])
    }
    
    const usersHandler = (users: string[]) => {
      setOnlineUsers(users)
    }

    socket.on('receive_message', messageHandler)
    socket.on('update_online_users', usersHandler)

    return () => {
      socket.off('receive_message', messageHandler)
      socket.off('update_online_users', usersHandler)
      socket.disconnect()
    }
  }, [])

  const joinRoom = async (room: Room) => {
    try {
      setSelectedRoom(room)
      socket.emit('join_room', { room: room.id, username: 'Me' })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/messages/${room.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      })

      if (!res.ok) throw new Error('Failed to load messages')
      
      const history = await res.json()
      setMessages(history)
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Failed to load messages')
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return
    
    const msg = { 
      room: selectedRoom.id, 
      content: newMessage, 
      username: 'Me' 
    }
    
    socket.emit('send_message', msg)
    setMessages(prev => [...prev, msg])
    setNewMessage('')
  }

  return (
    <MainLayout>
      <div className="flex h-screen">
        <aside className="w-64 p-4 border-r space-y-2">
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => joinRoom(room)}
              className={`block w-full text-left p-2 rounded ${
                selectedRoom?.id === room.id 
                  ? 'bg-blue-100' 
                  : 'hover:bg-gray-200'
              }`}
            >
              {room.name}
            </button>
          ))}
        </aside>
        <main className="flex-1 p-4 flex flex-col">
          {selectedRoom ? (
            <>
              <div className="flex-1 border rounded p-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id || msg.content} className={`mb-2 ${msg.username === 'Me' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      onlineUsers.includes(msg.room) ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="inline-block bg-blue-100 px-3 py-2 rounded">
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 border p-2 rounded"
                  placeholder="Type a message"
                />
                <button 
                  onClick={sendMessage} 
                  className="bg-blue-600 text-white px-4 rounded"
                  disabled={!selectedRoom}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a chat room to start messaging</p>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  )
}
