import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "./lib/supabase";
import * as SecureStore from "expo-secure-store";

// Screens...
// (keep existing imports)

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                console.log("🔍 Kiểm tra authentication status...");

                // Kiểm tra xem có user đã login không
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
                    console.log("⚠️ Chưa có user, chuyển sang SignIn");
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

    if (isLoggedIn === null) {
        // Loading state
        return (
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Loading"
                        component={LoadingScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={isLoggedIn ? "Home" : "SignIn"}
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
                {!isLoggedIn ? (
                    <>
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        {/* Detail Screens */}
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
