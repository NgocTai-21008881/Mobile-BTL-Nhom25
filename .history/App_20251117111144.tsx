import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./lib/supabase";

// Import tất cả screens
import LaunchScreen from "./screens/LaunchScreen";
import LoadingScreen from "./screens/LoadingScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import DoubleSupportScreen from "./screens/DoubleSupportScreen";
import CycleTrackingScreen from "./screens/CycleTrackingScreen";
import SleepScreen from "./screens/SleepScreen";
import HeartScreen from "./screens/HeartScreen";
import CaloriesScreen from "./screens/CaloriesScreen";
import BMIScreen from "./screens/BMIScreen";
import AllHealthyScreen from "./screens/AllHealthyScreen";
import AllHealthyStepScreen from "./screens/StepScreen";
import AllBlogsScreen from "./screens/AllBlogsScreen";
import BlogDetailScreen from "./screens/BlogDetailScreen";
import ExploreScreen from "./screens/ExploreScreen";
import OverviewScreen from "./screens/OverviewScreen";

export type RootStackParamList = {
    Launch: undefined;
    Loading: undefined;
    SignIn: undefined;
    SignUp: undefined;
    Home: undefined;
    DoubleSupportScreen: undefined;
    CycleTrackingScreen: undefined;
    SleepScreen: undefined;
    HeartScreen: undefined;
    CaloriesScreen: undefined;
    BMIScreen: undefined;
    AllHealthy: undefined;
    AllHealthyStep: undefined;
    AllBlogsScreen: undefined;
    BlogDetailScreen: { id: string };
    ExploreScreen: undefined;
    OverviewScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [state, setState] = useState<
        "launch" | "loading" | "signin" | "home"
    >("launch");
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    // Kiểm tra trạng thái đăng nhập
    useEffect(() => {
        const checkUser = async () => {
            try {
                console.log("🔍 Kiểm tra trạng thái đăng nhập...");

                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) {
                    console.error("❌ Lỗi:", error.message);
                    setIsLoggedIn(false);
                    return;
                }

                if (user) {
                    console.log("✅ Người dùng đã đăng nhập:", user.email);
                    setIsLoggedIn(true);
                } else {
                    console.log("⚠️ Chưa có người dùng đăng nhập");
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error("💥 Lỗi không mong muốn:", err);
                setIsLoggedIn(false);
            }
        };

        checkUser();

        // Lắng nghe thay đổi trạng thái đăng nhập
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log(
                    "🔔 Auth state changed:",
                    event,
                    "Has session:",
                    !!session?.user
                );

                // Chỉ cập nhật isLoggedIn dựa trên EVENT cụ thể
                // SIGNED_IN = user vừa login
                // SIGNED_OUT = user vừa logout

                if (event === "SIGNED_IN") {
                    console.log("✅ SIGNED_IN detected");
                    // Chỉ set isLoggedIn = true nếu user đã confirm email (để tránh auto-navigate khi signup)
                    if (session?.user?.email_confirmed_at) {
                        setIsLoggedIn(true);
                    } else {
                        console.log(
                            "⏭️ SIGNED_IN nhưng email chưa confirm, bỏ qua để tránh navigate"
                        );
                    }
                } else if (event === "SIGNED_OUT") {
                    console.log("✅ SIGNED_OUT detected");
                    setIsLoggedIn(false);
                } else {
                    // Tất cả events khác (INITIAL_SESSION, USER_UPDATED, PASSWORD_RECOVERY, ...):
                    // Không thay đổi isLoggedIn để tránh auto-navigate trong khi signup
                    console.log("⏭️ Event ignored:", event);
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Xử lý trạng thái điều hướng
    useEffect(() => {
        if (state === "loading") {
            console.log("🔄 Loading state: isLoggedIn =", isLoggedIn);
            if (isLoggedIn === null) {
                // Đang kiểm tra trạng thái đăng nhập
                console.log("⏳ Còn đang kiểm tra...");
                return;
            } else if (isLoggedIn) {
                console.log("✅ Chuyển sang home");
                setState("home");
            } else {
                console.log("➡️ Chuyển sang signin");
                setState("signin");
            }
        }
    }, [state, isLoggedIn]);

    // Khi isLoggedIn thay đổi mà state là signin, cập nhật state
    useEffect(() => {
        if (state === "signin" && isLoggedIn) {
            console.log(
                "🎉 User đã đăng nhập từ SignInScreen, chuyển sang home"
            );
            setState("home");
        }
    }, [isLoggedIn, state]);

    // Khi logout - chuyển về signin
    useEffect(() => {
        if (state === "home" && isLoggedIn === false) {
            console.log("🚪 Logout detected, chuyển về signin");
            setState("signin");
        }
    }, [state, isLoggedIn]);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#F6F7FB",
                    },
                    headerTintColor: "#828cf2",
                    headerTitleStyle: {
                        fontWeight: "700",
                    },
                }}
            >
                {/* 1️⃣ Launch Screen */}
                {state === "launch" && (
                    <Stack.Screen
                        name="Launch"
                        options={{
                            headerShown: false,
                        }}
                    >
                        {() => <LaunchScreen setState={setState} />}
                    </Stack.Screen>
                )}

                {/* 2️⃣ Loading Screen */}
                {state === "loading" && (
                    <Stack.Screen
                        name="Loading"
                        component={LoadingScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                )}

                {/* 3️⃣ Sign In Screen */}
                {state === "signin" && (
                    <>
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpScreen}
                            options={{
                                title: "Tạo tài khoản mới",
                                headerShown: true,
                                headerBackTitle: "Quay lại",
                            }}
                        />
                    </>
                )}

                {/* 4️⃣ Home & Other Screens */}
                {state === "home" && (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Stack.Screen
                            name="OverviewScreen"
                            component={OverviewScreen}
                            options={{ title: "Tổng Quan" }}
                        />

                        <Stack.Screen
                            name="ExploreScreen"
                            component={ExploreScreen}
                            options={{ title: "Khám Phá" }}
                        />

                        <Stack.Screen
                            name="DoubleSupportScreen"
                            component={DoubleSupportScreen}
                            options={{ title: "Double Suppport" }}
                        />

                        <Stack.Screen
                            name="CycleTrackingScreen"
                            component={CycleTrackingScreen}
                            options={{ title: "Cycle Tracking" }}
                        />

                        <Stack.Screen
                            name="SleepScreen"
                            component={SleepScreen}
                            options={{ title: "Giấc Ngủ" }}
                        />

                        <Stack.Screen
                            name="HeartScreen"
                            component={HeartScreen}
                            options={{ title: "Nhịp Tim" }}
                        />

                        <Stack.Screen
                            name="CaloriesScreen"
                            component={CaloriesScreen}
                            options={{ title: "Calories" }}
                        />

                        <Stack.Screen
                            name="BMIScreen"
                            component={BMIScreen}
                            options={{ title: "BMI" }}
                        />

                        <Stack.Screen
                            name="AllHealthy"
                            component={AllHealthyScreen}
                            options={{ title: "Tất Cả Dữ Liệu" }}
                        />

                        <Stack.Screen
                            name="AllHealthyStep"
                            component={AllHealthyStepScreen}
                            options={{ title: "Chi Tiết Bước" }}
                        />

                        <Stack.Screen
                            name="AllBlogsScreen"
                            component={AllBlogsScreen}
                            options={{ title: "Bài Viết" }}
                        />

                        <Stack.Screen
                            name="BlogDetailScreen"
                            component={BlogDetailScreen}
                            options={{ title: "Chi Tiết Bài Viết" }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
