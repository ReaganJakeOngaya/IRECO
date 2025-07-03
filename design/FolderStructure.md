social-media-app/
├── backend/                        # Flask Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── message.py
│   │   │   ├── reel.py
│   │   │   └── call.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── chat.py
│   │   │   └── media.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── media_service.py
│   │   │   └── socket_service.py
│   │   ├── sockets.py
│   │   └── config.py
│   ├── migrations/
│   ├── .env
│   ├── requirements.txt
│   └── wsgi.py
│
├── frontend/                      # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── dashboard/
│   │   │   ├── index.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── posts.tsx
│   │   │   └── video-call.tsx
│   │   ├── stream/
│   │   │   ├── index.tsx
│   │   │   └── [roomId].tsx
│   │   ├── reels/
│   │   │   ├── index.tsx
│   │   │   └── create.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChatBox.tsx
│   │   ├── PostCard.tsx
│   │   ├── ReelPlayer.tsx
│   │   ├── VideoCallUI.tsx
│   │   └── StreamPlayer.tsx
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.config.js
│   ├── utils/
│   └── tsconfig.json
│
├── docs/
│   ├── wireframes/
│   │   ├── login.png
│   │   ├── chat.png
│   │   ├── dashboard.png
│   │   ├── video-call.png
│   │   └── stream-room.png
│   └── README.md
│
├── .gitignore
├── docker-compose.yml
└── README.md
