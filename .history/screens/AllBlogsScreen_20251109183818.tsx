import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function AllBlogsScreen() {
    const navigation = useNavigation<any>();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('blogs')
                .select('id, tieude, hinhanh, loai, luongxem, ngaytao')
                .order('ngaytao', { ascending: false });

            if (error) console.error('Lỗi khi lấy blogs:', error.message);
            else setBlogs(data || []);
            setLoading(false);
        })();
    }, []);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Blogs</Text>
                <View style={{ width: 22 }} /> {/* giữ cân đối layout */}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4BC7E2" style={{ marginTop: 40 }} />
            ) : blogs.length === 0 ? (
                <Text style={styles.emptyText}>Không có bài viết nào.</Text>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {blogs.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.blogItem}
                            onPress={() =>
                                navigation.navigate('BlogDetailScreen', {
                                    title: item.tieude,
                                    tag: item.loai,
                                    views: item.luongxem,
                                    image: item.hinhanh,
                                    content: `Bài viết chi tiết về chủ đề ${item.tieude}.`,
                                })
                            }
                        >
                            <Image source={{ uri: item.hinhanh }} style={styles.blogImage} />
                            <View style={styles.blogInfo}>
                                <Text style={styles.blogTag}>{item.loai}</Text>
                                <Text numberOfLines={2} style={styles.blogTitle}>
                                    {item.tieude}
                                </Text>
                                <View style={styles.metaRow}>
                                    <AntDesign name="eye" size={13} color="#6B7280" />
                                    <Text style={styles.blogMeta}> {item.luongxem} views</Text>
                                    <Text style={styles.dot}>•</Text>
                                    <Text style={styles.blogMeta}>
                                        {new Date(item.ngaytao).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    backButton: {
        padding: 4,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },

    blogItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 18,
        marginTop: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
        overflow: 'hidden',
    },
    blogImage: { width: 110, height: 100 },
    blogInfo: { flex: 1, padding: 10, justifyContent: 'center' },
    blogTag: { color: '#4BC7E2', fontSize: 12, fontWeight: '700' },
    blogTitle: { color: '#111', fontWeight: '700', fontSize: 15, marginTop: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    blogMeta: { color: '#6B7280', fontSize: 12 },
    dot: { color: '#9AA0A6', marginHorizontal: 6 },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#777',
        fontSize: 15,
    },
});
