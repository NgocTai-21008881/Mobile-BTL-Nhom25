import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LaunchScreen from "../screens/LaunchScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import AllHealthyScreen from "../screens/AllHealthyScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Launch">
                <Stack.Screen
                    name="Launch"
                    component={LaunchScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="SignIn"
                    component={SignInScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{ headerShown: false }}
                />
                {/* <Stack.Screen name="AllHealthy" component={AllHealthyScreen} /> */}
                <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
