import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';

/**
 * Componente `FormScreen` para calcular la cantidad de focos necesarios para iluminar un área 
 * basándose en los requisitos de iluminación y las dimensiones del área proporcionadas.
 * 
 * @component
 * @example
 * return (
 *   <FormScreen />
 * );
 */
export default function FormScreen() {
    // Hook para obtener parámetros de la ruta de navegación
    const route = useRoute();
    const { dimensions } = route.params; // Dimensiones del área proporcionadas por la pantalla anterior

    // Estados para almacenar los valores de entrada y resultados del cálculo
    const [lumens, setLumens] = useState('');
    const [luxes, setLuxes] = useState('');
    const [focusCount, setFocusCount] = useState(null);
    const [distances, setDistances] = useState(null);

    // Cálculo del área del espacio basado en las dimensiones proporcionadas
    const area = dimensions.width * dimensions.height;

    /**
     * Maneja el cálculo de la cantidad de focos necesarios y sus posiciones.
     * Valida los valores ingresados, calcula los focos necesarios, y determina sus posiciones.
     */
    const handleCalculate = () => {
        // Convierte las entradas de texto a números flotantes
        const lumensValue = parseFloat(lumens);
        const luxesValue = parseFloat(luxes);

        // Verifica si los valores ingresados son válidos
        if (isNaN(lumensValue) || isNaN(luxesValue) || lumensValue <= 0 || luxesValue <= 0) {
            Alert.alert('Error', 'Please enter valid values for lumens and luxes.');
            return;
        }

        // Calcula los lúmenes necesarios para el área
        const requiredLumens = luxesValue * area;

        // Calcula la cantidad de focos necesarios
        const calculatedFocusCount = requiredLumens / lumensValue;
        const numFoci = Math.ceil(calculatedFocusCount);
        setFocusCount(numFoci);

        // Determina el número de columnas y filas para distribuir los focos
        const numCols = Math.ceil(Math.sqrt(numFoci));
        const numRows = Math.ceil(numFoci / numCols);

        // Calcula el espaciado entre los focos
        const spacingX = dimensions.width / numCols;
        const spacingY = dimensions.height / numRows;

        // Calcula las distancias desde los bordes del área
        const edgeDistanceX = spacingX / 2;
        const edgeDistanceY = spacingY / 2;

        // Calcula las posiciones de los focos
        const calculatedDistances = [];
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const x = edgeDistanceX + col * spacingX;
                const y = edgeDistanceY + row * spacingY;
                if (x <= dimensions.width && y <= dimensions.height) {
                    calculatedDistances.push({ x, y });
                }
            }
        }
        setDistances(calculatedDistances);
    };

    /**
     * Renderiza una cuadrícula de focos en base al número de focos calculados.
     * 
     * @param {number} numFoci - Número total de focos a mostrar en la cuadrícula.
     * @returns {JSX.Element} - Elemento de la cuadrícula de focos.
     */
    const renderFocusGrid = (numFoci) => {
        if (numFoci <= 0) return null;

        // Obtiene el ancho de la ventana para ajustar el tamaño de la cuadrícula
        const screenWidth = Dimensions.get('window').width;
        const aspectRatio = dimensions.width / dimensions.height;
        const containerWidth = screenWidth - 40; // Margen de 20 en ambos lados
        const containerHeight = containerWidth / aspectRatio;

        // Calcula el tamaño de los focos y el espaciado
        const numCols = Math.ceil(Math.sqrt(numFoci));
        const numRows = Math.ceil(numFoci / numCols);
        const focusSize = 20;

        const spacingX = containerWidth / numCols;
        const spacingY = containerHeight / numRows;

        // Calcula las distancias desde los bordes de la cuadrícula
        const edgeDistanceX = spacingX / 2;
        const edgeDistanceY = spacingY / 2;

        // Crea una cuadrícula de focos
        const grid = [];
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const x = edgeDistanceX + col * spacingX;
                const y = edgeDistanceY + row * spacingY;

                if (x <= containerWidth && y <= containerHeight) {
                    grid.push(
                        <View
                            key={`${row}-${col}`}
                            style={[
                                styles.focus,
                                { width: focusSize, height: focusSize, left: x, top: y },
                            ]}
                        />
                    );
                }
            }
        }

        return (
            <View style={[styles.gridContainer, { width: containerWidth, height: containerHeight }]}>
                {grid}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Sección que muestra las dimensiones del área */}
            <View style={styles.section}>
                <Text style={styles.header}>Object Dimensions</Text>
                <Text style={styles.text}>Width: {dimensions.width.toFixed(2)} m</Text>
                <Text style={styles.text}>Height: {dimensions.height.toFixed(2)} m</Text>
                <Text style={styles.text}>Area: {area.toFixed(2)} m²</Text>
            </View>
            {/* Sección que muestra los requisitos de iluminación recomendados */}
            <View style={styles.section}>
                <Text style={styles.header}>Lighting Requirements</Text>
                <View style={styles.table}>
                    <Text style={styles.tableHeader}>House</Text>
                    <Text style={styles.tableRow}>Vitrina = 1000 lux</Text>
                    <Text style={styles.tableRow}>Mostrador = 500 lux</Text>
                    <Text style={styles.tableRow}>Estantes = 200 lux</Text>
                    <Text style={styles.tableRow}>Cocina = 500 lux</Text>
                </View>

                <View style={styles.table}>
                    <Text style={styles.tableHeader}>Room</Text>
                    <Text style={styles.tableRow}>Sala = 100-300 lux</Text>
                    <Text style={styles.tableRow}>Cocina = 200-300 lux</Text>
                    <Text style={styles.tableRow}>Cuarto de baño = 150-250 lux</Text>
                    <Text style={styles.tableRow}>Pasillos = 100-200 lux</Text>
                </View>
            </View>
            {/* Sección para ingresar los valores de lúmenes y luxes y realizar el cálculo */}
            <View style={styles.section}>
                <Text style={styles.header}>Lumens and Luxes</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter lumens"
                    keyboardType="numeric"
                    value={lumens}
                    onChangeText={setLumens}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter luxes"
                    keyboardType="numeric"
                    value={luxes}
                    onChangeText={setLuxes}
                />
                <TouchableOpacity style={styles.button} onPress={handleCalculate}>
                    <Text style={styles.buttonText}>Calculate</Text>
                </TouchableOpacity>
                {/* Muestra los resultados del cálculo si están disponibles */}
                {focusCount !== null && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.result}>
                            Number of lights needed: {focusCount}
                        </Text>
                        {renderFocusGrid(focusCount)}
                        <View style={styles.distancesContainer}>
                            <Text style={styles.header}>Distances:</Text>
                            {distances && distances.map((dist, index) => (
                                <Text key={index} style={styles.distanceText}>
                                    Focus {index + 1}: x: {dist.x.toFixed(2)} m, y: {dist.y.toFixed(2)} m
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

// Estilos para el componente
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        color: '#ffffff',
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ffffff',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        color: '#ffffff',
    },
    resultContainer: {
        marginTop: 20,
    },
    result: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    gridContainer: {
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 5,
        position: 'relative',
        marginTop: 20,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    focus: {
        position: 'absolute',
        backgroundColor: '#2196f3',
        borderRadius: 10,
    },
    distancesContainer: {
        marginTop: 20,
    },
    distanceText: {
        fontSize: 16,
        color: '#ffffff',
    },
    table: {
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 5,
    },
    tableHeader: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tableRow: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 5,
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
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
