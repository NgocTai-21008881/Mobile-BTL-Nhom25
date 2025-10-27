import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import BottomNav, { TabKey } from '../componets/BottomNav'; // Assuming BottomNav is already created
import OverviewScreen from './OverviewScreen';  // Placeholder for your Overview tab content
import ExploreScreen from './ExploreScreen';  // Placeholder for your Exercise tab content
import SharingScreen from './SharingScreen';  // Placeholder for your Sharing tab content

export default function HomeScreen() {

    const [activeTab, setActiveTab] = useState<TabKey>('Overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Explore':
                return <ExploreScreen />;
            case 'Sharing':
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
        backgroundColor: '#fff',
    },
});
