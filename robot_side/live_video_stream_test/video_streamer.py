import time
import cv2
import socket
import json
import socketio
import base64
import threading

def get_destination(listening_port):
    # Create a socket object
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Bind the socket to a specific address and port
    server_socket.bind(('0.0.0.0', listening_port))

    # Listen for incoming connections
    server_socket.listen(1)

    print('Raspberry Pi is listening on port', listening_port)

    destination_ip= None
    destination_port= None

    # Accept a connection from the server
    client_socket, (destination_ip, _) = server_socket.accept()

    # Receive data from the server
    data = client_socket.recv(1024)

    if data:
        # Parse JSON data
        destination_port = json.loads(data.decode('utf-8'))["recievingPort"]
        
    # Close the connection
    client_socket.close()
    
    return destination_ip, destination_port

def stream_camera_footage(ouput_socket: "socketio.client.Client", camera_index: int, data_name: str, frames_time_gap_milliseconds: int= 100)-> None:
    cap = cv2.VideoCapture(camera_index)

    # Check if the camera opened successfully
    if not cap.isOpened():
        print(f"Error: Could not open camera.\nCamera index: {camera_index}")
        exit()

    # Set the frame width and height
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    try:
        while True:
            # Read a frame from the camera
            ret, frame = cap.read()

            # Check if the frame was successfully read
            if not ret:
                raise ValueError(f"Error: Could not open camera.\nCamera index: {camera_index}")

            # Encode the frame as JPEG
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = base64.b64encode(buffer).decode('utf-8')

            # Emit the frame to the connected client
            ouput_socket.emit('frame', {data_name: frame_bytes})
            time.sleep(frames_time_gap_milliseconds/1000)
    finally:
        cap.release()

# Function to send frames to the connected client
def main(listening_port):
    destination_ip, destination_port= get_destination(listening_port)
    print(f"destination: {destination_ip}:{destination_port}")

    # Create a Socket.IO server
    sio = socketio.Client()

    @sio.event
    def connect():
        print("Connected to server")

    @sio.event
    def disconnect():
        print("Disconnected from server")

    sio.connect(f"http://{destination_ip}:{destination_port}")

    LEFT_CAMERA_INDEX= 0
    RIGHT_CAMERA_INDEX= 2

    left_camera_streaming= threading.Thread(target=stream_camera_footage, args=(sio, LEFT_CAMERA_INDEX, "left_frame"))
    right_camera_streaming= threading.Thread(target=stream_camera_footage, args=(sio, RIGHT_CAMERA_INDEX, "right_frame"))

    left_camera_streaming.start()
    right_camera_streaming.start()

    try:
        left_camera_streaming.join()
        right_camera_streaming.join()
    except KeyboardInterrupt:
        print("interrupted. Exiting...")
    
    sio.disconnect()
    print("main thread exiting")

if __name__== "__main__":
    LISTENING_PORT= 3000
    main(LISTENING_PORT)