import cv2
import cv2.aruco as aruco
import numpy as np
from flask import Flask, request, jsonify
import io
from PIL import Image
import base64
from flask_cors import CORS
from object_detector import HomogeneousBgDetector

# Inicializa la aplicación Flask
app = Flask(__name__)
CORS(app)  # Permite solicitudes de diferentes dominios (CORS)

# Configuración de parámetros para el detector de marcadores ArUco
parameters = cv2.aruco.DetectorParameters()
aruco_dict = cv2.aruco.Dictionary(cv2.aruco.DICT_5X5_100, 5)  # Diccionario de marcadores ArUco

# Inicializa el detector de objetos de fondo homogéneo
detector = HomogeneousBgDetector()

@app.route('/process_image', methods=['POST'])
def processimage():
    """
    Procesa una imagen enviada a través de una solicitud POST, detecta marcadores ArUco,
    y encuentra el objeto más cercano al centro de la imagen.

    - Requiere un archivo de imagen en la solicitud.
    - Detecta los marcadores ArUco en la imagen.
    - Calcula la dimensión del objeto más cercano al centro de la imagen.

    Returns:
        JSON: Contiene la imagen procesada codificada en base64 y las dimensiones del objeto más cercano.
    """
    # Verifica si el archivo está en la solicitud
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400  # Error si no se proporciona un archivo

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400  # Error si no se selecciona un archivo

    # Lee la imagen del archivo
    in_memory_file = io.BytesIO(file.read())
    img = Image.open(in_memory_file)
    img = np.array(img)
    
    # Convierte la imagen a formato BGR si es necesario
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)  # Convierte imagen en escala de grises a BGR
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)  # Convierte imagen RGBA a BGR

    # Detecta los marcadores ArUco en la imagen
    corners, ids, _ = aruco.detectMarkers(img, aruco_dict, parameters=parameters)
    
    # Verifica si se detectaron marcadores
    if ids is None:
        return jsonify({'error': 'No Aruco marker detected'}), 400  # Error si no se detectan marcadores ArUco

    # Dibuja los marcadores detectados en la imagen
    cv2.aruco.drawDetectedMarkers(img, corners, ids)

    # Tamaño del marcador ArUco en centímetros
    aruco_size_cm = 3.3

    # Calcula la relación de píxeles a centímetros del marcador ArUco
    side_length_pixels = np.linalg.norm(corners[0][0][0] - corners[0][0][1])
    pixel_cm_ratio = side_length_pixels / aruco_size_cm

    # Obtiene las dimensiones de la imagen
    img_height, img_width = img.shape[:2]
    center_x, center_y = img_width // 2, img_height // 2  # Centro de la imagen

    # Detecta los objetos en la imagen utilizando el detector
    contours = detector.detect_objects(img)
    
    # Verifica si se detectaron objetos
    if not contours:
        return jsonify({'error': 'No objects detected'}), 400  # Error si no se detectan objetos

    closest_object = None
    min_distance = float('inf')

    # Encuentra el objeto más cercano al centro de la imagen
    for cnt in contours:
        rect = cv2.minAreaRect(cnt)
        (x, y), (w, h), angle = rect

        # Calcula el ancho y alto del objeto en centímetros
        object_width = float(w / pixel_cm_ratio)  # Convierte el ancho a centímetros
        object_height = float(h / pixel_cm_ratio)  # Convierte el alto a centímetros
        
        # Calcula la distancia del objeto al centro de la imagen
        object_center_x, object_center_y = int(x), int(y)
        distance = np.sqrt((object_center_x - center_x) ** 2 + (object_center_y - center_y) ** 2)

        if distance < min_distance:
            min_distance = distance
            closest_object = {'width': object_width, 'height': object_height}

        # Dibuja el contorno del objeto en la imagen
        box = cv2.boxPoints(rect)
        box = np.int32(box)
        cv2.circle(img, (int(x), int(y)), 5, (0, 0, 255), -1)  # Dibuja un círculo en el centro del objeto
        cv2.polylines(img, [box], True, (255, 0, 0), 2)  # Dibuja el contorno del objeto
        
        # Agrega etiquetas con las dimensiones del objeto
        cv2.putText(img, "Ancho: {} cm".format(round(object_width, 1)), 
                    (int(x), int(y - 15)), cv2.FONT_HERSHEY_SIMPLEX, 
                    2, (150, 0, 255), 7)
        cv2.putText(img, "Alto: {} cm".format(round(object_height, 1)), 
                    (int(x), int(y + 15)), cv2.FONT_HERSHEY_SIMPLEX, 
                    2, (200, 0, 200), 7)

    # Verifica si se encontró algún objeto cercano al centro
    if not closest_object: 
        return jsonify({'error': 'No objects close to center detected'}), 400  # Error si no se detecta ningún objeto cercano al centro

    # Codifica la imagen procesada en formato JPEG y luego a base64
    _, img_encoded = cv2.imencode('.jpg', img)
    img_bytes = img_encoded.tobytes()

    return jsonify({
        'image': base64.b64encode(img_bytes).decode('utf-8'),  # Imagen codificada en base64
        'dimensions': closest_object  # Dimensiones del objeto más cercano
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Inicia el servidor Flask en el puerto 5000
