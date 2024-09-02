import cv2

class HomogeneousBgDetector:
    """
    Detecta objetos en una imagen con un fondo homogéneo utilizando técnicas de umbral adaptativo y detección de contornos.
    """
    def __init__(self):
        """
        Inicializa una instancia del detector. En este caso, no se requiere ninguna configuración inicial.
        """
        pass

    def detect_objects(self, frame):
        """
        Detecta objetos en una imagen dada utilizando un fondo homogéneo.

        Args:
            frame (numpy.ndarray): Imagen en formato BGR donde se realizarán las detecciones.

        Returns:
            list: Lista de contornos de los objetos detectados que tienen un área superior a un umbral.
        """
        # Convierte la imagen a escala de grises
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Aplica umbral adaptativo para segmentar los objetos del fondo
        mask = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 19, 5)

        # Encuentra los contornos en la máscara binaria
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        objects_contours = []

        # Filtra los contornos basados en el área
        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Añade los contornos que tienen un área superior a 2000 píxeles
            if area > 2000:
                objects_contours.append(cnt)
        
        return objects_contours
