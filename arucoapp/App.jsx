import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/components/HomeScreen';
import FormScreen from './src/components/FormScreen';

// Crea una instancia del navegador de pila
const Stack = createStackNavigator();

/**
 * Componente principal de la aplicación que configura la navegación.
 * 
 * Utiliza `NavigationContainer` para envolver el árbol de navegación y 
 * gestionar el estado de navegación. `Stack.Navigator` se usa para definir
 * las rutas de la pila de navegación, y `Stack.Screen` define cada pantalla
 * en la pila.
 * 
 * @returns {JSX.Element} Componente que configura y renderiza la navegación
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Pantalla de Inicio */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          // La pantalla HomeScreen se muestra cuando se navega a la ruta "Home"
        />
        
        {/* Pantalla del Formulario */}
        <Stack.Screen 
          name="Form" 
          component={FormScreen} 
          // La pantalla FormScreen se muestra cuando se navega a la ruta "Form"
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
