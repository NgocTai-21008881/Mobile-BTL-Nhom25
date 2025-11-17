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
import { supabase } from "../lib/supabase";

export default function SignUpScreen() {
    const navigation = useNavigation();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        console.log("🔘 Button pressed! Starting signup...");
        console.log("State:", { username, email, pwd, loading });

        if (!username || !email || !pwd) {
            Alert.alert(
                "Thiếu thông tin",
                "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
            );
            return;
        }

        const usernameTrimmed = username.trim();
        const emailTrimmed = email.trim();
        const pwdTrimmed = pwd.trim();

        // Validate
        if (usernameTrimmed.length < 3) {
            Alert.alert("❌ Lỗi", "Tên người dùng phải có ít nhất 3 ký tự");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
            Alert.alert("❌ Lỗi", "Email không hợp lệ");
            return;
        }

        if (pwdTrimmed.length < 6) {
            Alert.alert("❌ Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setLoading(true);
        try {
            console.log("🚀 Step 1: Đăng ký auth...");
            console.log("Email:", emailTrimmed, "Username:", usernameTrimmed);

            // 1. Signup auth
            const { data, error } = await supabase.auth.signUp({
                email: emailTrimmed,
                password: pwdTrimmed,
                options: {
                    data: { username: usernameTrimmed },
                },
            });

            console.log("📤 Auth signup response:", { data, error });

            if (error) {
                console.error("❌ Auth signup error:", error);
                setLoading(false);
                Alert.alert("❌ Đăng ký thất bại", error.message || JSON.stringify(error));
                return;
            }

            if (!data.user) {
                console.error("❌ No user created");
                setLoading(false);
                Alert.alert("❌ Lỗi", "Không thể tạo tài khoản");
                return;
            }

            console.log("✅ Auth user created, ID:", data.user.id);
            console.log("🚀 Step 2: Insert to users table...");

            // 2. Insert to users table
            const { error: insertError, data: insertData } = await supabase
                .from("users")
                .insert({
                    id: data.user.id,
                    email: emailTrimmed,
                    username: usernameTrimmed,
                });

            console.log("📤 Insert response:", { insertData, insertError });

            if (insertError) {
                console.error("❌ Insert error:", insertError);
                setLoading(false);
                Alert.alert(
                    "⚠️ Cảnh báo",
                    "Auth tạo được nhưng insert users lỗi: " + (insertError.message || JSON.stringify(insertError))
                );
                return;
            }

            console.log("✅ User inserted successfully");
            console.log("🚀 Step 3: Logout...");

            setLoading(false);

            // 3. Logout sau khi signup để tránh auto-navigate sang Home
            const { error: logoutError } = await supabase.auth.signOut();
            console.log("📤 Logout response:", { logoutError });
            
            if (logoutError) {
                console.warn("⚠️ Logout error:", logoutError);
            } else {
                console.log("✅ Logout successful after signup");
            }

            // Delay dài để logout hoàn tất + listener cập nhật
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Verify logout thành công bằng cách check session
            const { data: sessionData } = await supabase.auth.getSession();
            console.log("📋 Session after logout:", sessionData?.session);

            // 4. Show success - Alert sẽ hiển thị AFTER logout đã hoàn tất
            console.log("📢 Showing success alert...");
            Alert.alert(
                "✅ Đăng ký thành công!",
                `Tài khoản ${usernameTrimmed} đã được tạo.\n\nVui lòng kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.`,
                [
                    {
                        text: "Quay lại đăng nhập",
                        onPress: () => {
                            console.log("🔄 Going back to SignIn");
                            // Xóa các form input
                            setUsername("");
                            setEmail("");
                            setPwd("");
                            // Quay lại SignInScreen
                            navigation.navigate("SignIn" as never);
                        },
                        style: "default",
                    },
                ]
            );
        } catch (err: any) {
            setLoading(false);
            console.error("💥 Catch error:", err);
            console.error("Error details:", err.toString(), err.message);
            Alert.alert("❌ Lỗi bất ngờ", err.message ?? "Đã xảy ra lỗi: " + err.toString());
        }
    };

    return (
        <View style={styles.container}>
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
                onPress={() => {
                    console.log("🎯 TouchableOpacity onPress triggered!");
                    handleSignUp();
                }}
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
        paddingTop: 20,
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
