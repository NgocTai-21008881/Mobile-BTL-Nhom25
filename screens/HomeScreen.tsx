import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNav, { TabKey } from "../componets/BottomNav";
import OverviewScreen from "./OverviewScreen";
import ExploreScreen from "./ExploreScreen";
import SharingScreen from "./SharingScreen";
import StepScreen from "./StepScreen";
import SleepScreen from "./SleepScreen";
import BMIScreen from "./BMIScreen";
import CaloriesScreen from "./CaloriesScreen";
import HeartScreen from "./HeartScreen";
import CycleTrackingScreen from "./CycleTrackingScreen";
import BlogDetailScreen from "./BlogDetailScreen";

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>("Overview");

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {activeTab === "Overview" && (
                    <>
                        <Stack.Screen name="OverviewTab" component={OverviewScreen} />
                        <Stack.Screen name="StepScreen" component={StepScreen} />
                        <Stack.Screen name="SleepScreen" component={SleepScreen} />
                        <Stack.Screen name="BMIScreen" component={BMIScreen} />
                        <Stack.Screen name="CaloriesScreen" component={CaloriesScreen} />
                        <Stack.Screen name="HeartScreen" component={HeartScreen} />
                        <Stack.Screen name="CycleTrackingScreen" component={CycleTrackingScreen} />
                        <Stack.Screen name="BlogDetailScreen" component={BlogDetailScreen} />
                    </>
                )}

                {activeTab === "Explore" && (
                    <Stack.Screen name="ExploreTab" component={ExploreScreen} />
                )}

                {activeTab === "Sharing" && (
                    <Stack.Screen name="SharingTab" component={SharingScreen} />
                )}
            </Stack.Navigator>

            <BottomNav active={activeTab} onPress={setActiveTab} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});
