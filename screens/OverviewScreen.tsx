import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 96 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <AntDesign name="home" size={18} color="#5865F2" />
                        <Text style={styles.headerDate}>TUES • 13 JUL</Text>
                    </View>

                    <TouchableOpacity style={styles.avatarWrap}>
                        <Image
                            source={{ uri: 'https://cdn.pixabay.com/photo/2025/07/27/10/26/blackbirds-9738306_1280.jpg' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                {/* Title + All data */}
                <View style={styles.rowBetween}>
                    <Text style={styles.pageTitle}>Overview</Text>
                    <TouchableOpacity style={styles.allDataBtn} onPress={() => navigation.navigate('AllHealthy')}>
                        <AntDesign name="bar-chart" size={14} color="#5865F2" />
                        <Text style={styles.allDataText}>All data</Text>
                    </TouchableOpacity>

                </View>

                {/* Health Score */}
                <View style={styles.healthCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.healthTitle}>Health Score</Text>
                        <Text style={styles.healthDesc}>
                            Based on your overview health tracking, your score is 78 and
                            considered good.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Tell me more →</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>78</Text>
                    </View>
                </View>

                {/* Highlights */}
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Highlights</Text>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>View more ›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {/* Highlight Cards */}
                    <View style={[styles.hCard, { backgroundColor: '#6E7BF7' }]}>
                        <View style={styles.hIconCircle}>
                            <AntDesign name="man" size={18} color="#fff" />
                        </View>
                        <Text style={styles.hTitle}>Steps</Text>
                        <Text style={styles.hValue}>11,857</Text>
                        <Text style={styles.hSub}>updated 15m ago</Text>
                    </View>

                    <View style={[styles.hCard, { backgroundColor: '#B28BFF' }]}>
                        <View style={styles.hIconCircle}>
                            <AntDesign name="calendar" size={18} color="#fff" />
                        </View>
                        <Text style={styles.hTitle}>Cycle tracking</Text>
                        <Text style={styles.hValue}>12</Text>
                        <Text style={styles.hSub}>days before period</Text>
                    </View>

                    <View style={[styles.hCard, { backgroundColor: '#2C6AA0' }]}>
                        <View style={styles.hIconCircle}>
                            <AntDesign name="moon" size={18} color="#fff" />
                        </View>
                        <Text style={styles.hTitle}>Sleep</Text>
                        <Text style={styles.hValue}>7h 31min</Text>
                        <Text style={styles.hSub}>updated a day ago</Text>
                    </View>

                    <View style={[styles.hCard, { backgroundColor: '#43A095' }]}>
                        <View style={styles.hIconCircle}>
                            <AntDesign name="rest" size={18} color="#fff" />
                        </View>
                        <Text style={styles.hTitle}>Nutrition</Text>
                        <Text style={styles.hValue}>960 kcal</Text>
                        <Text style={styles.hSub}>updated 15m ago</Text>
                    </View>
                </View>

                {/* This week report */}
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>This Week Report</Text>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>View more ›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.kpiWrap}>
                    {/* KPI Cards */}
                    <View style={styles.kpiCard}>
                        <View style={styles.kpiLeft}>
                            <AntDesign name="street-view" size={14} color="#5865F2" />
                            <Text style={styles.kpiLabel}>Steps</Text>
                        </View>
                        <Text style={styles.kpiValue}>697,978</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiLeft}>
                            <AntDesign name="dropbox" size={14} color="#5865F2" />
                            <Text style={styles.kpiLabel}>Workout</Text>
                        </View>
                        <Text style={styles.kpiValue}>6h 45min</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiLeft}>
                            <AntDesign name="dropbox" size={14} color="#5865F2" />
                            <Text style={styles.kpiLabel}>Water</Text>
                        </View>
                        <Text style={styles.kpiValue}>10,659 ml</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiLeft}>
                            <AntDesign name="API" size={14} color="#5865F2" />
                            <Text style={styles.kpiLabel}>Sleep</Text>
                        </View>
                        <Text style={styles.kpiValue}>29h 17min</Text>
                    </View>
                </View>


                {/* Blogs */}
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Blogs</Text>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>View more ›</Text>
                    </TouchableOpacity>
                </View>
                {/* Horizontal Scroll View for Blogs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blogsContainer}>
                    <View style={styles.blogCard}>
                        <Image
                            source={{ uri: 'https://cdn.pixabay.com/photo/2025/07/27/10/26/blackbirds-9738306_1280.jpg' }}
                            style={styles.blogImage}
                        />
                        <View style={{ padding: 12 }}>
                            <Text style={styles.blogTag}>Nutrition</Text>
                            <Text style={styles.blogTitle} numberOfLines={2}>
                                More about Apples: Benefits, nutrition, and tips
                            </Text>
                            <View style={styles.blogMetaRow}>
                                <AntDesign name="eye" size={14} color="#6B7280" />
                                <Text style={styles.blogMeta}> 2.8k views</Text>
                                <Text style={styles.dot}>•</Text>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Tell me more</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Add more blog cards here */}
                    <View style={styles.blogCard}>
                        <Image
                            source={{ uri: 'https://cdn.pixabay.com/photo/2025/07/27/10/26/blackbirds-9738306_1280.jpg' }}
                            style={styles.blogImage}
                        />
                        <View style={{ padding: 12 }}>
                            <Text style={styles.blogTag}>Health</Text>
                            <Text style={styles.blogTitle} numberOfLines={2}>
                                The Benefits of Daily Exercise
                            </Text>
                            <View style={styles.blogMetaRow}>
                                <AntDesign name="eye" size={14} color="#6B7280" />
                                <Text style={styles.blogMeta}> 1.2k views</Text>
                                <Text style={styles.dot}>•</Text>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Tell me more</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* You can continue adding more blog cards */}
                    <View style={styles.blogCard}>
                        <Image
                            source={{ uri: 'https://cdn.pixabay.com/photo/2025/07/27/10/26/blackbirds-9738306_1280.jpg' }}
                            style={styles.blogImage}
                        />
                        <View style={{ padding: 12 }}>
                            <Text style={styles.blogTag}>Health</Text>
                            <Text style={styles.blogTitle} numberOfLines={2}>
                                The Benefits of Daily Exercise
                            </Text>
                            <View style={styles.blogMetaRow}>
                                <AntDesign name="eye" size={14} color="#6B7280" />
                                <Text style={styles.blogMeta}> 1.2k views</Text>
                                <Text style={styles.dot}>•</Text>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Tell me more</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>


            </ScrollView>
        </View>
    );
}

/* ---------- Styles ---------- */
const R = 16;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerDate: { color: '#6B7280', fontWeight: '700', letterSpacing: 0.5 },

    avatarWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    avatar: { width: '100%', height: '100%' },

    rowBetween: {
        paddingHorizontal: 18,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0B0B0C',
        letterSpacing: 0.2,
    },
    allDataBtn: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    allDataText: { color: '#5865F2', fontWeight: '700', fontSize: 12 },

    healthCard: {
        marginTop: 12,
        marginHorizontal: 18,
        backgroundColor: '#fff',
        borderRadius: R,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    healthTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
    healthDesc: { color: '#6B7280', marginTop: 6, lineHeight: 18 },
    linkText: { color: '#5865F2', marginTop: 8, fontWeight: '700' },

    scoreBadge: {
        width: 56,
        height: 56,
        backgroundColor: '#FF7B54',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    scoreText: { color: '#fff', fontSize: 20, fontWeight: '800' },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginTop: 10,
    },

    grid: {
        marginTop: 10,
        paddingHorizontal: 18,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    hCard: {
        width: '47%',
        borderRadius: R,
        padding: 12,
    },
    hIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.20)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    hTitle: { color: '#fff', opacity: 0.9, fontWeight: '700' },
    hValue: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4 },
    hSub: { color: '#fff', opacity: 0.85, marginTop: 2, fontSize: 12 },

    kpiWrap: {
        marginTop: 12,
        paddingHorizontal: 18,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    kpiCard: {
        backgroundColor: '#fff',
        borderRadius: R,
        paddingVertical: 12,
        paddingHorizontal: 14,
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
    },
    kpiLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    kpiLabel: { color: '#6B7280', fontWeight: '700' },
    kpiValue: { color: '#111827', fontWeight: '800' },



    blogsContainer: {
        marginTop: 10,
        paddingLeft: 18,
        paddingRight: 18,
    },

    blogCard: {
        backgroundColor: '#fff',
        borderRadius: R,
        marginRight: 12,  // Add margin between cards
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        width: 250,  // You can adjust the width based on how large you want the cards
    },

    blogImage: {
        width: '100%',
        height: 160,
        borderRadius: R,  // Optional: if you want rounded corners for the image
    },
    blogTag: { color: '#6B7280', fontSize: 12, marginBottom: 4 },
    blogTitle: { color: '#111827', fontSize: 16, fontWeight: '800' },
    blogMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    blogMeta: { color: '#6B7280' },

    dot: {
        color: '#9AA0A6',
        marginHorizontal: 6,
    },
});
