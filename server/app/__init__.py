from .sockets import init_socketio, socketio

def create_app():
    ...
    init_socketio(app)
    return app
