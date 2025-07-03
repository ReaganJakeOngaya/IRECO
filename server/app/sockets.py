from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room


socketio = SocketIO(cors_allowed_origins="*")

def init_socketio(app):
    socketio.init_app(app)
    
    online_users = set()

    @socketio.on('connect')
    def handle_connect():
        user_id = request.args.get('user_id')
        if user_id:
            online_users.add(user_id)
            emit('update_online_users', list(online_users), broadcast=True)

    @socketio.on('disconnect')
    def handle_disconnect():
        user_id = request.args.get('user_id')
        if user_id in online_users:
            online_users.remove(user_id)
            emit('update_online_users', list(online_users), broadcast=True)

    @socketio.on('join_room')
    def handle_join(data):
        room = data.get('room')
        join_room(room)
        emit('system', {'message': f'{data["username"]} joined {room}'}, room=room)

    @socketio.on('send_message')
    def handle_message(data):
        emit('receive_message', data, room=data['room'])
