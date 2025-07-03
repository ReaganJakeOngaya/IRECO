'use client'

import { useState } from 'react'

export default function CreateGroupModal({ onCreated }: { onCreated: (room: any) => void }) {
  const [show, setShow] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])

  const handleCreate = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        name: roomName,
        is_group: true,
        user_ids: selectedUsers,
      })
    })

    if (res.ok) {
      const room = await res.json()
      onCreated(room)
      setShow(false)
      setRoomName('')
      setSelectedUsers([])
    }
  }

  return (
    <>
      <button onClick={() => setShow(true)} className="bg-green-600 text-white px-4 py-1 rounded">+ New Group</button>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">Create Group</h3>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Group name"
              className="w-full border rounded p-2"
            />
            <p className="text-sm text-gray-600">* Add user IDs temporarily (simulate)</p>
            <input
              type="text"
              placeholder="1,2,3"
              onChange={(e) => setSelectedUsers(e.target.value.split(',').map(Number))}
              className="w-full border rounded p-2"
            />
            <div className="flex justify-between">
              <button onClick={() => setShow(false)} className="px-4 py-1 border rounded">Cancel</button>
              <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-1 rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
