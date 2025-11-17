import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomNav, { TabKey } from "../componets/BottomNav";
import OverviewScreen from "./OverviewScreen";
import ExploreScreen from "./ExploreScreen";
import SharingScreen from "./SharingScreen";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<TabKey>("Overview");

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", onPress: () => {} },
                {
                    text: "Sign Out",
                    onPress: async () => {
                        try {
                            await supabase.auth.signOut();
                            console.log("✅ Signed out successfully");
                            // Navigation will be handled by App.tsx auth listener
                        } catch (error) {
                            console.error("❌ Error signing out:", error);
                            Alert.alert("Error", "Failed to sign out");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Health Tracker</Text>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
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
