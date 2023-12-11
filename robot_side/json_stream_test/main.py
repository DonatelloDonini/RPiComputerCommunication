import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server")

@sio.event
def disconnect():
    print("Disconnected from server")

while True:
    # JSON data to be sent
    data_to_send = {
        'name': 'Zio Zame',
        'age': 25,
        'city': 'Example City'
    }

    sio.connect('http://192.168.43.2:3000')
    sio.emit('json-data', data_to_send)
    print('JSON data sent:', data_to_send)

    time.sleep(5)  # Adjust the delay as needed