import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import type { RootStackParamList } from "../App";

type LaunchScreenProps = {
    setState: React.Dispatch<
        React.SetStateAction<"launch" | "loading" | "signin" | "home">
    >;
};

export default function LaunchScreen({ setState }: LaunchScreenProps) {
    const handleContinue = () => {
        console.log("📲 User bấm Continue -> đi tới Loading");
        setState("loading");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require("../assets/imglaunch.png")}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    <View style={styles.logoCircle}>
                        <View style={styles.logoArrow} />
                    </View>

                    <Text style={styles.title}>
                        Let's start your{"\n"}
                        health journey today{"\n"}
                        with us!
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
    },
    imageContainer: {
        flex: 1,
        justifyContent: "center",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    bottomSection: {
        backgroundColor: "#4E6CF1",
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
        minHeight: 300,
    },
    logoCircle: {
        width: 50,
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    logoArrow: {
        width: 15,
        height: 15,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
        borderColor: "#4E6CF1",
        transform: [{ rotate: "45deg" }],
    },
    title: {
        color: "#fff",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 30,
        lineHeight: 28,
    },
    button: {
        backgroundColor: "#fff",
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 50,
    },
    buttonText: {
        color: "#4E6CF1",
        fontSize: 16,
        fontWeight: "600",
    },
});
