import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function DoubleSupportScreen() {
    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
                }}
                style={styles.image}
            />
            <Text style={styles.title}>Double Support</Text>
            <Text style={styles.subtitle}>
                Cảm ơn bạn đã luôn đồng hành và ủng hộ chúng tôi. Hãy tiếp tục
                cùng nhau phát triển nhé!
            </Text>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Khám phá ngay</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4F6FB",
        paddingHorizontal: 20,
    },
    image: {
        width: 120,
        height: 120,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#2D3142",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#4C5C68",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 40,
    },
    button: {
        backgroundColor: "#3F72AF",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
