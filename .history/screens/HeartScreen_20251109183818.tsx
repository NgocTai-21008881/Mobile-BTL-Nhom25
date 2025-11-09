import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';


export default function HeartScreen() {


    // Data for the graph (weekly data)
    const graphData = [5000, 6000, 8000, 7000, 8500, 9500, 10500];

    return (
        <View style={styles.container}>
            <Text>heart SCREEN</Text>
        </View>
    );
}


// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 20,
    },

});
