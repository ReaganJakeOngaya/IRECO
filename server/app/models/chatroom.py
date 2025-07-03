# File: server/app/models/chatroom.py

# chatroom.py
class ChatRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    is_group = db.Column(db.Boolean, default=False)
    users = db.relationship('User', secondary='room_users', backref='rooms')
    messages = db.relationship('Message', backref='room', lazy=True)

room_users = db.Table('room_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('room_id', db.Integer, db.ForeignKey('chat_room.id'))
)
