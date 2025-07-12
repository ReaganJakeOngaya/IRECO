'use client'

import React, { useState, useEffect, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import socket from '@/lib/socket'
import EmojiPicker from '@/app/chat/EmojiPicker'
import { 
  FiPaperclip, 
  FiSend, 
  FiSmile, 
  FiSearch, 
  FiMoreVertical, 
  FiPhone, 
  FiVideo, 
  FiImage,
  FiMic,
  FiX,
  FiDownload,
  FiMessageSquare,
  FiEye,
  FiUsers,
  FiSettings,
  FiStar,
  FiArchive,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi'

import { AiFillPushpin } from "react-icons/ai"

import { format, isToday, isYesterday, differenceInDays } from 'date-fns'

interface Room {
  id: string
  name: string
  lastMessage?: string
  unreadCount?: number
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
  isPinned?: boolean
  isArchived?: boolean
  roomType?: 'direct' | 'group'
  participantCount?: number
}

interface Message {
  id: string
  room: string
  content: string
  username: string
  timestamp: Date
  isRead?: boolean
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyTo?: string
  reactions?: { emoji: string; users: string[] }[]
}

interface User {
  id: string
  username: string
  avatar?: string
  isOnline?: boolean
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
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Utility functions
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    if (isToday(date)) return format(date, 'h:mm a')
    if (isYesterday(date)) return 'Yesterday'
    if (differenceInDays(new Date(), date) < 7) return format(date, 'EEE')
    return format(date, 'MMM d')
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc': case 'docx': return '📝'
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️'
      case 'mp4': case 'mov': case 'avi': return '🎥'
      case 'mp3': case 'wav': case 'aac': return '🎵'
      default: return '📎'
    }
  }

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
      setShowRoomInfo(false)
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

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return
    
    const msg = { 
      id: Date.now().toString(),
      room: selectedRoom.id, 
      content: newMessage, 
      username: 'Me',
      timestamp: new Date(),
      isRead: false,
      messageType: 'text' as const,
      replyTo: replyingTo?.id
    }
    
    socket.emit('send_message', msg)
    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setReplyingTo(null)
    setIsTyping(false)
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
      const msg: Message = { 
        id: Date.now().toString(),
        room: selectedRoom.id, 
        content: file.name, 
        username: 'Me',
        timestamp: new Date(),
        isRead: false,
        messageType: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size
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

  // Start/stop voice recording
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
          // Handle audio upload here
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error starting recording:', error)
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    }
  }

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <MainLayout>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar with chat rooms */}
        <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiSearch className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FiMoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
            
            {/* Search Input */}
            <div className={`transition-all duration-300 ${showSearch ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'} overflow-hidden`}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && !selectedRoom ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => joinRoom(room)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                      selectedRoom?.id === room.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          room.avatar ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          {room.avatar ? (
                            <img src={room.avatar} alt={room.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getAvatarInitials(room.name)
                          )}
                        </div>
                        {room.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>

                      {/* Room Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 dark:text-white truncate">{room.name}</h3>
                          <div className="flex items-center space-x-1">
                            {room.isPinned && <AiFillPushpin className="w-3 h-3 text-gray-400" />}
                            {/* {room.isPinned && <FiPin className="w-3 h-3 text-gray-400" />} */}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {room.lastMessage || 'No messages yet'}
                          </p>
                          {room.unreadCount && room.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                        {room.roomType === 'group' && (
                          <div className="flex items-center mt-1">
                            <FiUsers className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">{room.participantCount} members</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat header */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        selectedRoom.avatar ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {selectedRoom.avatar ? (
                          <img src={selectedRoom.avatar} alt={selectedRoom.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getAvatarInitials(selectedRoom.name)
                        )}
                      </div>
                      {selectedRoom.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{selectedRoom.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedRoom.isOnline ? 'Online' : selectedRoom.lastSeen || 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <FiVideo className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button 
                      onClick={() => setShowRoomInfo(!showRoomInfo)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
                {isLoading && hasMoreMessages && (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.username === 'Me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md group ${msg.username === 'Me' ? 'order-2' : 'order-1'}`}>
                      {msg.username !== 'Me' && (
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 px-2">
                          {msg.username}
                        </div>
                      )}
                      
                      {/* Reply indicator */}
                      {msg.replyTo && (
                        <div className="mb-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500 text-sm">
                          <p className="text-gray-600 dark:text-gray-300">Replying to message</p>
                        </div>
                      )}

                      <div className={`px-4 py-2 rounded-2xl shadow-sm backdrop-blur-sm ${
                        msg.username === 'Me' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : 'bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-white border border-gray-200/50 dark:border-gray-600/50'
                      }`}>
                        {msg.messageType === 'image' ? (
                          <div className="space-y-2">
                            <img 
                              src={msg.fileUrl} 
                              alt={msg.fileName}
                              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setShowImagePreview(msg.fileUrl!)}
                            />
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        ) : msg.messageType === 'file' ? (
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getFileIcon(msg.fileName!)}</div>
                            <div className="flex-1">
                              <p className="font-medium">{msg.fileName}</p>
                              <p className="text-sm opacity-70">
                                {msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : 'File'}
                              </p>
                            </div>
                            <button className="p-1 rounded-full hover:bg-black/10">
                              <FiDownload className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <p className="break-words">{msg.content}</p>
                        )}
                      </div>
                      
                      <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                        msg.username === 'Me' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{format(new Date(msg.timestamp), 'h:mm a')}</span>
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
                <div className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                    </p>
                  </div>
                </div>
              )}

              {/* Reply indicator */}
              {replyingTo && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Replying to {replyingTo.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {replyingTo.content}
                      </p>
                    </div>
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message input area */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
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
                
                <div className="flex items-end space-x-2">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiImage className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*, .pdf, .doc, .docx, audio/*, video/*"
                    multiple
                  />
                  
                  <div className="flex-1 relative">
                    <input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping()
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Type a message..."
                    />
                  </div>
                  
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={toggleRecording}
                      className={`p-2 rounded-full transition-colors ${
                        isRecording 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiMic className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={sendMessage} 
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      disabled={!newMessage.trim() || !selectedRoom}
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <FiMessageSquare className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Welcome to SocialWave Chat
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Select a conversation from the sidebar to start messaging, or create a new chat to connect with friends.
                  </p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Room Info Sidebar */}
        {showRoomInfo && selectedRoom && (
          <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chat Info</h3>
              <button 
                onClick={() => setShowRoomInfo(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Room Avatar and Info */}
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto ${
                selectedRoom.avatar ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {selectedRoom.avatar ? (
                  <img src={selectedRoom.avatar} alt={selectedRoom.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getAvatarInitials(selectedRoom.name)
                )}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedRoom.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedRoom.roomType === 'group' ? `${selectedRoom.participantCount} members` : 'Direct message'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-white">Voice Call</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiVideo className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-white">Video Call</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiSearch className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-white">Search Messages</span>
              </button>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Settings</h5>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {isMuted ? (
                    <FiVolumeX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <FiVolume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <span className="text-gray-800 dark:text-white">Notifications</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  isMuted ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                    isMuted ? 'translate-x-1' : 'translate-x-5'
                  }`}></div>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiStar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-white">Starred Messages</span>
              </button>
              
              
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <AiFillPushpin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-white">Pin Chat</span>
              </button>
             
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiArchive className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-white">Archive Chat</span>
              </button>
            </div>

            {/* Shared Media */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Shared Media</h5>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div 
                    key={item}
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:opacity-75 cursor-pointer transition-opacity"
                  >
                    <FiImage className="w-6 h-6 text-gray-400" />
                  </div>
                ))}
              </div>
              <button className="w-full text-center text-blue-500 hover:text-blue-600 text-sm font-medium">
                View All Media
              </button>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImagePreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button 
                onClick={() => setShowImagePreview(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <FiX className="w-6 h-6 text-white" />
              </button>
              <img 
                src={showImagePreview} 
                alt="Preview" 
                className="max-w-full max-h-full rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}