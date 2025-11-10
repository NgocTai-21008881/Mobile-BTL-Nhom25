import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function DoubleSupportScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.iconWrap}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/833/833472.png' }}
                            style={styles.image}
                        />
                    </View>

                    <Text style={styles.title}>Double Support</Text>

                    <Text style={styles.subtitle} numberOfLines={3}>
                        Cảm ơn bạn đã luôn đồng hành và ủng hộ chúng tôi. Hãy tiếp tục cùng nhau phát triển nhé!
                    </Text>

                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                            <Text style={styles.primaryText}>Khám phá ngay</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.ghostButton} activeOpacity={0.8}>
                            <Text style={styles.ghostText}>Chia sẻ phản hồi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    card: {
        width: Math.min(width - 40, 520),
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 22,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    iconWrap: {
        width: 110,
        height: 110,
        borderRadius: 110 / 2,
        backgroundColor: '#F2F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#E6F0FF',
    },
    image: {
        width: 64,
        height: 64,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 22,
        paddingHorizontal: 6,
    },
    buttonsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#3F72AF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 160,
        alignItems: 'center',
    },
    primaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#D1D9E6',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        minWidth: 140,
        alignItems: 'center',
    },
    ghostText: {
        color: '#3F72AF',
        fontSize: 15,
        fontWeight: '600',
    },
    safe: {
        flex: 1,
        backgroundColor: '#F4F6FB',
    },
});
