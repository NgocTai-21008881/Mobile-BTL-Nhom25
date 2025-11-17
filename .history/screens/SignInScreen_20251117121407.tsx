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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { insertTestData } from "../services/testDataService";

type SignInScreenProps = {};

export default function SignInScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Subscribe to auth changes
    useEffect(() => {
        console.log("📝 SignInScreen mounted, subscribing to auth changes");

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log(
                    "🔔 Auth state changed in SignIn:",
                    event,
                    "Session:",
                    !!session?.user
                );
                // Chỉ navigate Home nếu event là 'SIGNED_IN' và user đã confirm email
                // Tránh navigate khi user vừa signup (chưa confirm)
                if (
                    session?.user &&
                    event === "SIGNED_IN" &&
                    session.user.email_confirmed_at
                ) {
                    console.log(
                        "✅ User logged in from SignInScreen, navigating to Home"
                    );
                    // Tự động chuyển sang Home khi login thành công
                    setTimeout(() => {
                        navigation.navigate("Home" as never);
                    }, 500);
                }
            }
        );

        return () => {
            console.log("❌ SignInScreen cleanup");
            authListener?.subscription.unsubscribe();
        };
    }, [navigation]);

    const handleSignIn = async () => {
        console.log("📱 handleSignIn called");
        console.log("Email:", email, "Password:", password);

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

            console.log("📤 Response từ Supabase:", { data, error });

            if (error) {
                console.error("❌ Lỗi đăng nhập:", error.message);
                Alert.alert("❌ Đăng nhập thất bại", error.message);
                setLoading(false);
                return;
            }

            console.log("✅ Đăng nhập thành công:", data.user?.email);
            // onAuthStateChange sẽ tự động điều hướng sang Home
            setLoading(false);
        } catch (e: any) {
            console.error("💥 Lỗi:", e);
            Alert.alert("❌ Lỗi", e.message ?? "Đã xảy ra lỗi");
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || !username) {
            Alert.alert("❌ Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const usernameTrimmed = username.trim();

        // Validate
        if (usernameTrimmed.length < 3) {
            Alert.alert("❌ Lỗi", "Tên người dùng phải có ít nhất 3 ký tự");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("❌ Lỗi", "Email không hợp lệ");
            return;
        }

        if (password.length < 6) {
            Alert.alert("❌ Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        try {
            setLoading(true);
            console.log("📝 Step 1: Đăng ký auth");

            // 1. Signup auth
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: { username: usernameTrimmed },
                },
            });

            if (error) {
                console.error("❌ Step 1 Error:", error.message);
                Alert.alert("❌ Lỗi", error.message);
                setLoading(false);
                return;
            }

            if (!data.user) {
                Alert.alert("❌ Lỗi", "Không thể tạo tài khoản");
                setLoading(false);
                return;
            }

            console.log("✅ Step 1: Auth created, ID:", data.user.id);
            console.log("📝 Step 2: Inserting to users table...");

            // 2. Insert to users table
            const { error: insertError } = await supabase.from("users").insert({
                id: data.user.id,
                email: email.trim(),
                username: usernameTrimmed,
            });

            if (insertError) {
                console.error("❌ Step 2 Error:", insertError.message);
                console.error("❌ Insert Error Details:", insertError);
                // Nếu lỗi duplicate key, nghĩa là user đã tồn tại, coi như thành công
                if (insertError.code === "23505") {
                    console.log(
                        "⚠️ User already exists in users table, proceeding..."
                    );
                } else {
                    Alert.alert(
                        "⚠️ Cảnh báo",
                        "Auth tạo được nhưng insert users lỗi.\n\nVui lòng thử lại hoặc liên hệ admin."
                    );
                    setLoading(false);
                    return;
                }
            }

            console.log("✅ Step 2: User inserted successfully");

            // 3. Thêm dữ liệu mẫu cho user mới
            console.log("📝 Step 3: Adding initial test data...");
            const { error: testDataError } = await insertTestData(data.user.id);
            if (testDataError) {
                console.warn("⚠️ Step 3 Warning:", testDataError);
                // Không dừng flow, chỉ warning
            } else {
                console.log("✅ Step 3: Initial data added successfully");
            }

            // 4. Logout sau khi signup để tránh auto-navigate sang Home
            const { error: logoutError } = await supabase.auth.signOut();
            if (logoutError) {
                console.warn("⚠️ Logout error:", logoutError.message);
            } else {
                console.log("✅ Logout successful after signup");
            }

            // Delay để logout hoàn tất
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 5. Show success
            Alert.alert(
                "✅ Đăng ký thành công!",
                "Tài khoản đã được tạo và dữ liệu khởi tạo đã được thêm. Bây giờ bạn có thể đăng nhập.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Chuyển đến trang đăng nhập
                            navigation.navigate("SignIn" as never);
                        },
                        style: "default",
                    },
                ]
            );

            setLoading(false);
        } catch (e: any) {
            console.error("💥 Try-Catch Error:", e);
            console.error("Error message:", e.message);
            Alert.alert("❌ Lỗi", e.message ?? "Đã xảy ra lỗi");
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <Text style={styles.welcomeText}>
                        {isSignUp ? "Tạo Tài Khoản" : "Welcome back"} 👋
                    </Text>

                    {/* Sign Up Fields */}
                    {isSignUp && (
                        <>
                            <Text style={styles.label}>Tên người dùng</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tên người dùng"
                                placeholderTextColor="#C7D2E0"
                                value={username}
                                onChangeText={setUsername}
                                editable={!loading}
                                autoCapitalize="none"
                            />
                        </>
                    )}

                    {/* Email Field */}
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email"
                        placeholderTextColor="#C7D2E0"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        editable={!loading}
                        autoCapitalize="none"
                    />

                    {/* Password Field */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter password"
                            placeholderTextColor="#C7D2E0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Text style={styles.eyeText}>
                                {showPassword ? "👁️" : "👁️"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password Link */}
                    {!isSignUp && (
                        <TouchableOpacity style={styles.forgotContainer}>
                            <Text style={styles.forgotText}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Sign In / Sign Up Button */}
                    <TouchableOpacity
                        style={[
                            styles.mainButton,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={isSignUp ? handleSignUp : handleSignIn}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.mainButtonText}>
                                {isSignUp ? "Sign Up" : "Sign In"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Or Login With Section */}
                    {!isSignUp && (
                        <>
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>
                                    OR LOG IN WITH
                                </Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Social Buttons */}
                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.socialIcon}>G</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.socialIcon}>f</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.socialIcon}>🍎</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Toggle Sign In / Sign Up */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>
                            {isSignUp
                                ? "Already have an account? "
                                : "Don't have an account? "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSignUp(!isSignUp);
                                setEmail("");
                                setPassword("");
                                setUsername("");
                            }}
                            disabled={loading}
                        >
                            <Text style={styles.toggleLink}>
                                {isSignUp ? "Sign in" : "Sign up"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "700",
        color: "#000",
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: "#000",
        borderWidth: 0,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: "#000",
    },
    eyeIcon: {
        padding: 8,
    },
    eyeText: {
        fontSize: 18,
    },
    forgotContainer: {
        marginTop: 12,
        alignItems: "flex-end",
    },
    forgotText: {
        color: "#5865F2",
        fontSize: 14,
        fontWeight: "500",
    },
    mainButton: {
        backgroundColor: "#5865F2",
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    mainButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: "#999",
        fontWeight: "600",
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginBottom: 24,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
    },
    socialIcon: {
        fontSize: 24,
        fontWeight: "700",
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    toggleText: {
        fontSize: 14,
        color: "#666",
    },
    toggleLink: {
        fontSize: 14,
        color: "#5865F2",
        fontWeight: "700",
    },
});
