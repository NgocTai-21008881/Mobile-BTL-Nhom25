import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    SafeAreaView,
    Image,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { supabase } from "../lib/supabase";

type SignInScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, "SignIn">;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password123");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState("");

    // Subscribe to auth changes
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("🔔 Auth state changed in SignIn:", event);
                if (session?.user) {
                    console.log("✅ User logged in, navigating to Home");
                    // Tự động chuyển sang Home khi login thành công
                    navigation.replace("Home");
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("❌ Lỗi", "Vui lòng nhập email và mật khẩu");
            return;
        }

        try {
            setLoading(true);
            console.log("🔐 Đang đăng nhập:", email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                console.error("❌ Lỗi đăng nhập:", error.message);
                Alert.alert("❌ Đăng nhập thất bại", error.message);
                return;
            }

            console.log("✅ Đăng nhập thành công:", data.user?.email);
            // onAuthStateChange sẽ tự động điều hướng sang Home
        } catch (e: any) {
            console.error("💥 Lỗi:", e);
            Alert.alert("❌ Lỗi", e.message ?? "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || !username) {
            Alert.alert("❌ Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);
            console.log("📝 Đang tạo tài khoản:", email);

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            });

            if (error) {
                console.error("❌ Lỗi tạo tài khoản:", error.message);
                Alert.alert("❌ Tạo tài khoản thất bại", error.message);
                return;
            }

            // Lưu thêm info vào custom users table
            if (data?.user?.id) {
                await supabase.from("users").insert([
                    {
                        id: data.user.id,
                        username,
                        email,
                    },
                ]);
            }

            Alert.alert(
                "✅ Thành công",
                "Tài khoản đã được tạo! Vui lòng đăng nhập."
            );
            setIsSignUp(false);
            setUsername("");
            setEmail("");
            setPassword("");
        } catch (e: any) {
            console.error("💥 Lỗi:", e);
            Alert.alert("❌ Lỗi", e.message ?? "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.content}>
                <Text style={styles.title}>
                    {isSignUp ? "Tạo Tài Khoản" : "Chào Mừng"}
                </Text>
                <Text style={styles.subtitle}>
                    {isSignUp
                        ? "Đăng ký để theo dõi sức khỏe"
                        : "Đăng nhập vào tài khoản"}
                </Text>

                {isSignUp && (
                    <>
                        <Text style={styles.label}>Tên người dùng</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên người dùng"
                            value={username}
                            onChangeText={setUsername}
                            editable={!loading}
                        />
                    </>
                )}

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!loading}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={isSignUp ? handleSignUp : handleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isSignUp ? "Đăng Ký" : "Đăng Nhập"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        setIsSignUp(!isSignUp);
                        setEmail("");
                        setPassword("");
                        setUsername("");
                    }}
                    disabled={loading}
                >
                    <Text style={styles.toggleText}>
                        {isSignUp
                            ? "Đã có tài khoản? Đăng nhập"
                            : "Chưa có tài khoản? Đăng ký"}
                    </Text>
                </TouchableOpacity>

                {/* Debug Box */}
                <View style={styles.debugBox}>
                    <Text style={styles.debugTitle}>🧪 Tài khoản Test</Text>
                    <Text style={styles.debugText}>
                        Email: test@example.com
                    </Text>
                    <Text style={styles.debugText}>Mật khẩu: password123</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F7FB" },
    content: { padding: 20, paddingTop: 60 },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 8,
    },
    subtitle: { fontSize: 14, color: "#64748B", marginBottom: 30 },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    button: {
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    toggleText: {
        color: "#10B981",
        textAlign: "center",
        marginTop: 20,
        fontWeight: "600",
    },
    debugBox: {
        backgroundColor: "#FEF3C7",
        borderRadius: 12,
        padding: 12,
        marginTop: 30,
        marginBottom: 30,
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#92400E",
        marginBottom: 8,
    },
    debugText: { fontSize: 12, color: "#78350F", marginBottom: 4 },
});
