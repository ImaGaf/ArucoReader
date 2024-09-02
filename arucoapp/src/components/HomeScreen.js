import React, { useEffect, useRef, useState } from 'react';
import base64js from 'base64-js'; // Biblioteca para manipulación de datos base64 (no utilizada en este código)
import { StyleSheet, View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy'; // Componentes de Expo para usar la cámara
import axios from 'axios'; // Biblioteca para hacer solicitudes HTTP
import { useNavigation } from '@react-navigation/native'; // Hook para la navegación entre pantallas

/**
 * Componente `HomeScreen` para la captura y procesamiento de imágenes.
 * Permite tomar una foto con la cámara, procesar la imagen y navegar a la pantalla de formulario con los datos procesados.
 * 
 * @component
 * @example
 * return (
 *   <HomeScreen />
 * );
 */
export default function HomeScreen() {
  // Hook para la navegación entre pantallas
  const navigation = useNavigation(); 

  // Estado para gestionar el permiso de la cámara
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  // Estado para almacenar la URI de la imagen capturada
  const [image, setImage] = useState(null);
  // Estado para almacenar la URI de la imagen procesada
  const [processingImage, setProcessingImage] = useState(null);
  // Estado para almacenar las dimensiones de la imagen procesada
  const [imageDimensions, setImageDimensions] = useState([]);
  // Estado para almacenar posibles mensajes de error
  const [error, setError] = useState(null);
  // Estado para gestionar la visualización de la imagen procesada
  const [showProcessed, setShowProcessed] = useState(false);
  // Estado para gestionar la carga de procesamiento
  const [loading, setLoading] = useState(false);

  // Referencia para el componente de cámara
  const cameraRef = useRef(null);

  // Hook que solicita permisos para acceder a la cámara al montar el componente
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
    })();
  }, []);

  /**
   * Captura una foto usando la cámara y actualiza el estado con la URI de la imagen.
   * Utiliza la referencia del componente de cámara para tomar la foto.
   */
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri); // Actualiza el estado con la URI de la imagen capturada
        setShowProcessed(false); // Oculta la imagen procesada
      } catch (e) {
        console.log(e); // Maneja errores al capturar la foto
      }
    }
  };

  /**
   * Procesa la imagen capturada enviándola al servidor para análisis.
   * Actualiza el estado con la imagen procesada y las dimensiones obtenidas.
   */
  const processImage = async () => {
    if (image) {
      setLoading(true); // Muestra el indicador de carga
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      try {
        // Envia la imagen al servidor para su procesamiento
        const response = await axios.post('https://arucoback.onrender.com/process_image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const { image: base64Image, dimensions } = response.data;
        console.log(dimensions); // Imprime las dimensiones de la imagen en la consola

        // Convierte la imagen base64 a una URI de imagen
        const processedImageUri = `data:image/jpeg;base64,${base64Image}`;
        setProcessingImage(processedImageUri); // Actualiza el estado con la imagen procesada
        setImageDimensions(dimensions); // Actualiza el estado con las dimensiones de la imagen
        setShowProcessed(true); // Muestra la imagen procesada
        setError(null); // Limpia cualquier error anterior
      } catch (e) {
        console.error('Error processing image:', e.response ? e.response.data : e.message);
        setError('Error processing image: ' + (e.response ? e.response.data : e.message)); // Maneja errores en el procesamiento
      } finally {
        setLoading(false); // Oculta el indicador de carga
      }
    }
  };

  /**
   * Navega a la pantalla de formulario con las dimensiones de la imagen procesada.
   */
  const navigateToForm = () => {
    navigation.navigate('Form', { dimensions: imageDimensions });
  };

  // Muestra un mensaje de error si no se tiene permiso para acceder a la cámara
  if (hasCameraPermission === false) {
    return <Text style={styles.errorText}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Muestra el indicador de carga si `loading` es verdadero */}
      {loading && <ActivityIndicator size="large" color="#ffffff" style={styles.loadingIndicator} />}
      
      {/* Muestra la cámara si no hay imagen capturada y `showProcessed` es falso */}
      {!showProcessed ? (
        !image ? (
          <Camera style={styles.camera} type={CameraType.back} ref={cameraRef} />
        ) : (
          <Image source={{ uri: image }} style={styles.image} />
        )
      ) : (
        <Image source={{ uri: processingImage }} style={styles.image} />
      )}
      
      <View style={styles.buttonContainer}>
        {/* Muestra botones para tomar una foto, volver a tomarla o procesar la imagen */}
        {!showProcessed ? (
          image ? (
            <>
              <TouchableOpacity style={styles.button} onPress={() => setImage(null)}>
                <Text style={styles.buttonText}>Re-take</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={processImage}>
                <Text style={styles.buttonText}>Process</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Take a Picture</Text>
            </TouchableOpacity>
          )
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => {
              setImage(null);
              setProcessingImage(null);
              setImageDimensions([]);
              setShowProcessed(false);
            }}>
              <Text style={styles.buttonText}>Re-take</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={navigateToForm}>
              <Text style={styles.buttonText}>Calculate</Text>
            </TouchableOpacity>
          </>
        )}
        {/* Muestra un mensaje de error si `error` no es nulo */}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

// Estilos para el componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3d00',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
});
