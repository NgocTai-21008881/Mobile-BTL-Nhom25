import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export type TabKey = "Overview" | "Explore" | "Sharing";

type BottomNavProps = {
    active: TabKey;
    onPress: (key: TabKey) => void;
    onSignOut?: () => void;
};

const ITEMS = [
    { key: "Overview", icon: "home", label: "Overview" },
    { key: "Explore", icon: "appstore", label: "Explore" },
    { key: "Sharing", icon: "share-alt", label: "Sharing" },
];

export default function BottomNav({
    active,
    onPress,
    onSignOut,
}: BottomNavProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleSignOut = () => {
        console.log("🔴 SIGN OUT BUTTON CLICKED");
        setShowConfirm(true);
    };

    const confirmSignOut = async () => {
        setIsLoading(true);
        try {
            console.log("⏳ Signing out...");
            await supabase.auth.signOut();
            console.log("✅ Logout thành công");
            setShowConfirm(false);
            setShowSuccess(true);

            // Auto-hide success message after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error("❌ Logout failed:", err);
            setShowConfirm(false);
            Alert.alert("❌ Error", "Failed to sign out: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            {/* Confirmation Modal */}
            <Modal
                visible={showConfirm}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>👋 Sign Out</Text>
                        <Text style={styles.modalMessage}>
                            Are you about to sign out. Are you sure?
                        </Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowConfirm(false)}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    isLoading && styles.confirmButtonDisabled,
                                ]}
                                onPress={confirmSignOut}
                                disabled={isLoading}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {isLoading ? "Signing out..." : "Sign Out"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccess}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successContent}>
                        <Text style={styles.successIcon}>✅</Text>
                        <Text style={styles.successTitle}>Success!</Text>
                        <Text style={styles.successMessage}>
                            You have been signed out successfully! 👋
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation Bar */}
            <View style={styles.tabBar}>
                {ITEMS.map((item) => {
                    const isActive = item.key === active;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.tabItem}
                            onPress={() => onPress(item.key)}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                        >
                            <AntDesign
                                name={item.icon}
                                size={20}
                                color={isActive ? "#5865F2" : "#9AA0A6"}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    isActive && styles.tabActive,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* Sign Out Button */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => {
                        console.log("🔴 Sign Out button pressed");
                        handleSignOut();
                    }}
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityLabel="Sign Out"
                >
                    <AntDesign name="logout" size={24} color="#EF4444" />
                    <Text style={[styles.tabLabel, styles.signOutLabel]}>
                        Sign Out
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        height: 58,
        backgroundColor: "#fff",
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    tabItem: { alignItems: "center", justifyContent: "center" },
    tabLabel: { marginTop: 2, fontSize: 11, color: "#9AA0A6" },
    tabActive: { color: "#5865F2", fontWeight: "700" },
    signOutLabel: { color: "#EF4444", fontWeight: "700" },
});
