import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LaunchScreen from "../screens/LaunchScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import LoadingScreen from "../screens/LoadingScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

interface AppNavigatorProps {
    state: "launch" | "loading" | "signin" | "home";
    setState: React.Dispatch<
        React.SetStateAction<"launch" | "loading" | "signin" | "home">
    >;
}

export default function AppNavigator({ state, setState }: AppNavigatorProps) {
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
                {/* Launch Screen */}
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

                {/* Loading Screen */}
                {state === "loading" && (
                    <Stack.Screen
                        name="Loading"
                        component={LoadingScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                )}

                {/* Sign In Screen */}
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

                {/* Home Screen */}
                {state === "home" && (
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
