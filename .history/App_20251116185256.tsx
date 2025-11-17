import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "./lib/supabase";

// Import tất cả screens
import LaunchScreen from "./screens/LaunchScreen";
import LoadingScreen from "./screens/LoadingScreen";
import SignInScreen from "./screens/SignInScreen";
import HomeScreen from "./screens/HomeScreen";
import DoubleSupportScreen from "./screens/DoubleSupportScreen";
import CycleTrackingScreen from "./screens/CycleTrackingScreen";
import SleepScreen from "./screens/SleepScreen";
import HeartScreen from "./screens/HeartScreen";
import CaloriesScreen from "./screens/CaloriesScreen";
import BMIScreen from "./screens/BMIScreen";
import AllHealthyScreen from "./screens/AllHealthyScreen";
import AllHealthyStepScreen from "./screens/AllHealthyStepScreen";
import AllBlogsScreen from "./screens/AllBlogsScreen";
import BlogDetailScreen from "./screens/BlogDetailScreen";
import ExploreScreen from "./screens/ExploreScreen";
import OverviewScreen from "./screens/OverviewScreen";

export type RootStackParamList = {
    Launch: undefined;
    Loading: undefined;
    SignIn: undefined;
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

    // Kiểm tra auth status
    useEffect(() => {
        const checkUser = async () => {
            try {
                console.log("🔍 Kiểm tra authentication status...");

                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) {
                    console.error("❌ Error:", error.message);
                    setIsLoggedIn(false);
                    return;
                }

                if (user) {
                    console.log("✅ User đã login:", user.email);
                    setIsLoggedIn(true);
                } else {
                    console.log("⚠️ Chưa có user");
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error("💥 Unexpected error:", err);
                setIsLoggedIn(false);
            }
        };

        checkUser();

        // Subscribe to auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("🔔 Auth state changed:", event);
                setIsLoggedIn(!!session?.user);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Xử lý navigation dựa trên state
    useEffect(() => {
        if (state === "launch") {
            // Hiển thị Launch Screen
            return;
        } else if (state === "loading") {
            // Kiểm tra auth
            if (isLoggedIn === null) {
                // Vẫn đang loading
            } else if (isLoggedIn) {
                setState("home");
            } else {
                setState("signin");
            }
        }
    }, [state, isLoggedIn]);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#F6F7FB",
                    },
                    headerTintColor: "#10B981",
                    headerTitleStyle: {
                        fontWeight: "700",
                    },
                }}
            >
                {/* 1️⃣ LAUNCH SCREEN - Hiện đầu tiên */}
                {state === "launch" && (
                    <Stack.Screen
                        name="Launch"
                        component={LaunchScreen}
                        options={{
                            headerShown: false,
                            animationEnabled: false,
                        }}
                        listeners={{
                            transitionEnd: () => {
                                // Khi LaunchScreen transition kết thúc, chuyển sang Loading
                                setTimeout(() => setState("loading"), 500);
                            },
                        }}
                    />
                )}

                {/* 2️⃣ LOADING SCREEN - Kiểm tra auth */}
                {state === "loading" && (
                    <Stack.Screen
                        name="Loading"
                        component={LoadingScreen}
                        options={{
                            headerShown: false,
                            animationEnabled: false,
                        }}
                    />
                )}

                {/* 3️⃣ SIGN IN SCREEN - Nếu chưa login */}
                {state === "signin" && (
                    <Stack.Screen
                        name="SignIn"
                        component={SignInScreen}
                        options={{
                            headerShown: false,
                            animationEnabled: false,
                        }}
                    />
                )}

                {/* 4️⃣ HOME & OTHER SCREENS - Nếu đã login */}
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
                            options={{ title: "Bước Đi" }}
                        />

                        <Stack.Screen
                            name="CycleTrackingScreen"
                            component={CycleTrackingScreen}
                            options={{ title: "Chu Kỳ" }}
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
