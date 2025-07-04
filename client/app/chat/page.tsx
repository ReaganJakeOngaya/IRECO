'use client'

import React, { useState, useEffect, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import socket from '@/lib/socket'
import EmojiPicker from '@/app/chat/EmojiPicker'
import { FiPaperclip, FiSend, FiSmile } from 'react-icons/fi'
import { format } from 'date-fns'

interface Room {
  id: string
  name: string
  lastMessage?: string
  unreadCount?: number
}

interface Message {
  id: string
  room: string
  content: string
  username: string
  timestamp: Date
  isRead?: boolean
}

interface User {
  id: string
  username: string
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [showEmoji, setShowEmoji] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Socket connection and event listeners
  useEffect(() => {
    socket.connect()

    const messageHandler = (msg: Message) => {
      setMessages(prev => [...prev, { ...msg, isRead: msg.username === 'Me' }])
      markMessagesAsRead()
    }
    
    const usersHandler = (users: User[]) => {
      setOnlineUsers(users)
    }

    const typingHandler = (data: { room: string; username: string }) => {
      if (selectedRoom?.id === data.room && data.username !== 'Me') {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username])
        
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username))
        }, 3000)
      }
    }

    socket.on('receive_message', messageHandler)
    socket.on('update_online_users', usersHandler)
    socket.on('typing', typingHandler)

    return () => {
      socket.off('receive_message', messageHandler)
      socket.off('update_online_users', usersHandler)
      socket.off('typing', typingHandler)
      socket.disconnect()
    }
  }, [selectedRoom])

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/rooms`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        if (!res.ok) throw new Error('Failed to load rooms')
        const data = await res.json()
        setRooms(data)
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [])

  // Join room and fetch messages
  const joinRoom = async (room: Room) => {
    try {
      setIsLoading(true)
      setSelectedRoom(room)
      setMessages([])
      socket.emit('join_room', { room: room.id, username: 'Me' })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/messages/${room.id}?limit=20`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      })

      if (!res.ok) throw new Error('Failed to load messages')
      
      const history = await res.json()
      setMessages(history.messages)
      setHasMoreMessages(history.hasMore)
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  // Load more messages when scrolling up
  const loadMoreMessages = async () => {
    if (!selectedRoom || isLoading || !hasMoreMessages) return
    
    try {
      setIsLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/messages/${selectedRoom.id}?limit=20&before=${messages[0].id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      )

      if (!res.ok) throw new Error('Failed to load more messages')
      
      const data = await res.json()
      setMessages(prev => [...data.messages, ...prev])
      setHasMoreMessages(data.hasMore)
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark messages as read
  const markMessagesAsRead = () => {
    if (!selectedRoom) return
    
    const unreadMessages = messages.filter(msg => msg.username !== 'Me' && !msg.isRead)
    if (unreadMessages.length > 0) {
      socket.emit('mark_as_read', { 
        room: selectedRoom.id,
        messageIds: unreadMessages.map(msg => msg.id)
      })
      
      setMessages(prev => prev.map(msg => 
        unreadMessages.some(m => m.id === msg.id) ? { ...msg, isRead: true } : msg
      ))
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedRoom) return
    
    if (!isTyping) {
      socket.emit('typing', { room: selectedRoom.id, username: 'Me' })
      setIsTyping(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return
    
    const msg = { 
      id: Date.now().toString(),
      room: selectedRoom.id, 
      content: newMessage, 
      username: 'Me',
      timestamp: new Date(),
      isRead: false
    }
    
    socket.emit('send_message', msg)
    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setIsTyping(false)
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedRoom) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', selectedRoom.id)

      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      })

      if (!res.ok) throw new Error('File upload failed')
      
      const { url } = await res.json()
      const msg = { 
        id: Date.now().toString(),
        room: selectedRoom.id, 
        content: url, 
        username: 'Me',
        timestamp: new Date(),
        isRead: false,
        isFile: true
      }
      
      socket.emit('send_message', msg)
      setMessages(prev => [...prev, msg])
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex h-screen">
        {/* Sidebar with chat rooms */}
        <aside className="w-64 p-4 border-r space-y-2 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          {isLoading && !selectedRoom ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`w-full text-left p-2 rounded flex justify-between items-center ${
                  selectedRoom?.id === room.id 
                    ? 'bg-blue-100' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <span>{room.name}</span>
                {room.unreadCount ? (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {room.unreadCount}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </aside>

        {/* Main chat area */}
        <main className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat header */}
              <div className="border-b p-4 flex justify-between items-center">
                <h3 className="font-semibold">{selectedRoom.name}</h3>
                <div className="flex items-center space-x-2">
                  {onlineUsers.some(u => u.id === selectedRoom.id) && (
                    <span className="text-xs text-green-500">Online</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {onlineUsers.filter(u => u.id === selectedRoom.id).length} online
                  </span>
                </div>
              </div>

              {/* Messages container */}
              <div 
                className="flex-1 overflow-y-auto p-4 bg-gray-100"
                onScroll={(e) => {
                  const { scrollTop } = e.currentTarget
                  if (scrollTop === 0) {
                    loadMoreMessages()
                  }
                }}
              >
                {isLoading && hasMoreMessages && (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`mb-4 ${msg.username === 'Me' ? 'text-right' : 'text-left'}`}
                  >
                    <div className="inline-block max-w-xs lg:max-w-md">
                      {msg.username !== 'Me' && (
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          {msg.username}
                        </div>
                      )}
                      <div className={`px-4 py-2 rounded-lg ${
                        msg.username === 'Me' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-800'
                      }`}>
                        {msg.content.startsWith('http') ? (
                          <a 
                            href={msg.content} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            View File
                          </a>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(msg.timestamp), 'h:mm a')}
                        {msg.username === 'Me' && (
                          <span className="ml-1">
                            {msg.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-2 bg-gray-100 border-t">
                  <p className="text-sm text-gray-500 italic">
                    {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                  </p>
                </div>
              )}

              {/* Message input area */}
              <div className="border-t p-4 bg-white">
                {showEmoji && (
                  <div className="mb-2">
                    <EmojiPicker 
                      onSelect={(emoji) => {
                        setNewMessage(prev => prev + emoji)
                        setShowEmoji(false)
                      }} 
                      onClose={() => setShowEmoji(false)}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <FiPaperclip size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*, .pdf, .doc, .docx"
                  />
                  <input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                  />
                  <button 
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <FiSmile size={20} />
                  </button>
                  <button 
                    onClick={sendMessage} 
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    disabled={!newMessage.trim() || !selectedRoom}
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No chat selected</h3>
                <p className="text-gray-500">Select a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  )
}
