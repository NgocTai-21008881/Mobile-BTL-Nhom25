// src/screens/LaunchScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

export default function LaunchScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/imglaunch.png')}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.bottomSection}>
                <View style={styles.logoCircle}>
                    <View style={styles.logoArrow} />
                </View>

                <Text style={styles.title}>
                    Let's start your{'\n'}
                    health journey today{'\n'}
                    with us!
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Loading')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: '60%' },
    bottomSection: {
        flex: 1,
        backgroundColor: '#4E6CF1',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoCircle: {
        width: 50, height: 50, backgroundColor: '#fff', borderRadius: 25,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    logoArrow: {
        width: 15, height: 15, borderLeftWidth: 3, borderBottomWidth: 3,
        borderColor: '#4E6CF1', transform: [{ rotate: '45deg' }],
    },
    title: {
        color: '#fff', textAlign: 'center', fontSize: 20, fontWeight: '600', marginBottom: 30,
    },
    button: {
        backgroundColor: '#fff', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 50,
    },
    buttonText: { color: '#4E6CF1', fontSize: 16, fontWeight: '500' },
});
