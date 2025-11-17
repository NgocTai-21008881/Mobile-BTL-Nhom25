import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import BottomNav, { TabKey } from "../componets/BottomNav";
import OverviewScreen from "./OverviewScreen";
import ExploreScreen from "./ExploreScreen";
import SharingScreen from "./SharingScreen";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState<TabKey>("Overview");

    const renderTabContent = () => {
        switch (activeTab) {
            case "Explore":
                return <ExploreScreen />;
            case "Sharing":
                return <SharingScreen />;
            default:
                return <OverviewScreen />;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {renderTabContent()}
            </ScrollView>
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
