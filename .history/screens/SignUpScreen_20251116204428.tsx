import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { signUpUser } from "../services/userService";

export default function SignUpScreen() {
    const navigation = useNavigation();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!username || !email || !pwd) {
            Alert.alert(
                "Thiếu thông tin",
                "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
            );
            return;
        }

        setLoading(true);
        try {
            const { error, user } = await signUpUser(
                username.trim(),
                email.trim(),
                pwd.trim()
            );
            setLoading(false);

            console.log("📝 SignUp response:", { error, user });

            if (error) {
                console.error("❌ SignUp error:", error);
                Alert.alert("Đăng ký thất bại", error);
                return;
            }

            if (user) {
                console.log("✅ SignUp success:", user);
                Alert.alert(
                    "Thành công",
                    `Tạo tài khoản cho ${user.username} thành công!\n\nVui lòng kiểm tra email để xác nhận tài khoản.`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                console.log("🔄 Going back to SignIn");
                                // Xóa các form input
                                setUsername("");
                                setEmail("");
                                setPwd("");
                                // Quay lại SignInScreen
                                navigation.goBack();
                            },
                        },
                    ]
                );
            } else {
                console.error("⚠️ No user data returned");
                Alert.alert("Lỗi", "Không nhận được dữ liệu user từ server");
            }
        } catch (err: any) {
            setLoading(false);
            console.error("💥 Catch error:", err);
            Alert.alert("Lỗi bất ngờ", err.message ?? "Đã xảy ra lỗi");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tạo tài khoản mới 👋</Text>

            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
                <AntDesign name="user" size={18} color="#9AA0A6" />
                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Nhập tên người dùng"
                    placeholderTextColor="#A7A7A7"
                    style={styles.input}
                />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
                <AntDesign name="mail" size={18} color="#9AA0A6" />
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Nhập email"
                    placeholderTextColor="#A7A7A7"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
                <AntDesign name="lock" size={18} color="#9AA0A6" />
                <TextInput
                    value={pwd}
                    onChangeText={setPwd}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#A7A7A7"
                    secureTextEntry
                    style={styles.input}
                />
            </View>

            <TouchableOpacity
                style={[styles.signUpBtn, loading && { opacity: 0.7 }]}
                onPress={handleSignUp}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.signUpText}>Sign Up</Text>
                )}
            </TouchableOpacity>

            <View style={styles.bottomRow}>
                <Text style={{ color: "#666" }}>Đã có tài khoản? </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("SignIn" as never)}
                >
                    <Text style={{ color: "#4E6CF1", fontWeight: "600" }}>
                        Đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const RADIUS = 14;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 36,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 24,
        color: "#0B0B0C",
        textAlign: "center",
    },
    label: { fontSize: 13, color: "#666", marginBottom: 6 },
    inputWrap: {
        height: 48,
        borderRadius: RADIUS,
        backgroundColor: "#F3F5F7",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        gap: 10,
        marginBottom: 14,
    },
    input: { flex: 1, fontSize: 15, paddingVertical: 0 },
    signUpBtn: {
        height: 50,
        backgroundColor: "#5865F2",
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    signUpText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    bottomRow: {
        marginTop: 28,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});
