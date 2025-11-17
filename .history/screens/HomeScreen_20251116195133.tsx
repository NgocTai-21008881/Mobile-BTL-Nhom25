import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import BottomNav, { TabKey } from "../componets/BottomNav";
import OverviewScreen from "./OverviewScreen";
import ExploreScreen from "./ExploreScreen";
import SharingScreen from "./SharingScreen";

export default function HomeScreen() {
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
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flex: 1 }}>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#F6F7FB",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    signOutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#EF4444",
        borderRadius: 8,
    },
    signOutText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
