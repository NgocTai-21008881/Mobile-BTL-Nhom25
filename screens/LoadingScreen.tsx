// src/screens/LoadingScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

const DOT_COUNT = 4;
const DOT_SIZE = 14;
const DOT_SPACING = 8;
const COLOR = '#4E6CF1';

function DotLoader() {
    const anims = useRef(
        [...Array(DOT_COUNT)].map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const createAnimation = (anim: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: -8, // nhảy lên
                        duration: 200,
                        delay,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 200,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            );

        const loops = anims.map((a, i) => createAnimation(a, i * 100));
        loops.forEach(loop => loop.start());

        return () => loops.forEach(loop => loop.stop());
    }, [anims]);

    return (
        <View style={styles.loader}>
            {anims.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.dot,
                        {
                            transform: [{ translateY: anim }],
                            marginLeft: i === 0 ? 0 : DOT_SPACING,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

export default function LoadingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        const t = setTimeout(() => {
            navigation.replace('SignIn');
        }, 2000);
        return () => clearTimeout(t);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <DotLoader />
            <Text style={styles.text}>Health Tracker Đang chuẩn bị…</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: '#333',
    },
    loader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 40,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: COLOR,
    },
});
