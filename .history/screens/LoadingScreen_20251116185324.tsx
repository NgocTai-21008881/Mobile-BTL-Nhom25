import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function LoadingScreen() {
    useEffect(() => {
        console.log("⏳ LoadingScreen: Đang kiểm tra authentication...");
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Health Tracker</Text>
            <ActivityIndicator
                size="large"
                color="#10B981"
                style={{ marginTop: 20 }}
            />
            <Text style={styles.subtitle}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F6F7FB",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0F172A",
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 10,
    },
});
