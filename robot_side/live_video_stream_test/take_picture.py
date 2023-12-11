import cv2

# Open a connection to the camera (0 is usually the default camera)
cap = cv2.VideoCapture(0)

# Check if the camera is opened successfully
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

# Capture a single frame
ret, frame = cap.read()

# Check if the frame was read successfully
if ret:
    # Save the frame to an image file (in PNG format)
    cv2.imwrite("captured_frame.png", frame)
    print("Frame saved as captured_frame.png")

# Release the camera
cap.release()