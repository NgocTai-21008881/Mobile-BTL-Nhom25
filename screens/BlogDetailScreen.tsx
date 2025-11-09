import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function BlogDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { title, tag, views, image, content } = route.params as any;

    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách bài viết cùng loại (related)
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('blogs')
                .select('id, tieude, hinhanh, loai, luongxem')
                .neq('tieude', title) // loại bỏ bài đang xem
                .eq('loai', tag)      // chỉ lấy cùng chủ đề
                .limit(5);

            if (error) console.error('Lỗi khi tải related blogs:', error);
            else setRelatedBlogs(data || []);
            setLoading(false);
        })();
    }, [title, tag]);

    return (
        <ScrollView style={styles.container}>
            {/* Back */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <AntDesign name="arrowleft" size={22} color="#333" />
            </TouchableOpacity>

            {/* Image */}
            <Image source={{ uri: image }} style={styles.blogImage} />

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.blogTag}>{tag}</Text>
                <Text style={styles.blogTitle}>{title}</Text>
                <View style={styles.metaRow}>
                    <AntDesign name="eye" size={14} color="#6B7280" />
                    <Text style={styles.metaText}> {views} views</Text>
                </View>
            </View>

            {/* Content */}
            <Text style={styles.contentText}>{content}</Text>

            {/* Related */}
            <View style={styles.relatedContainer}>
                <Text style={styles.relatedTitle}>Related Articles</Text>

                {loading ? (
                    <ActivityIndicator size="small" color="#4BC7E2" style={{ marginVertical: 20 }} />
                ) : relatedBlogs.length === 0 ? (
                    <Text style={{ color: '#777' }}>No related articles found.</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {relatedBlogs.map((blog) => (
                            <TouchableOpacity
                                key={blog.id}
                                style={styles.relatedCard}
                                onPress={() =>
                                    navigation.replace('BlogDetailScreen', {
                                        title: blog.tieude,
                                        tag: blog.loai,
                                        views: blog.luongxem,
                                        image: blog.hinhanh,
                                        content: `Bài viết chi tiết về chủ đề ${blog.tieude}.`,
                                    })
                                }
                            >
                                <Image source={{ uri: blog.hinhanh }} style={styles.relatedImage} />
                                <Text numberOfLines={2} style={styles.relatedText}>
                                    {blog.tieude}
                                </Text>
                                <View style={styles.metaSmall}>
                                    <AntDesign name="eye" size={12} color="#6B7280" />
                                    <Text style={styles.metaSmallText}> {blog.luongxem} views</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
    backButton: { marginTop: 40, marginBottom: 10 },
    blogImage: { width: '100%', height: 220, borderRadius: 16 },
    infoContainer: { marginTop: 16 },
    blogTag: { color: '#4BC7E2', fontWeight: '700', textTransform: 'uppercase' },
    blogTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginVertical: 6 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    metaText: { color: '#777', marginLeft: 4 },
    contentText: { marginTop: 20, lineHeight: 22, color: '#333', fontSize: 15 },
    relatedContainer: { marginTop: 30, marginBottom: 40 },
    relatedTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#111' },
    relatedCard: {
        width: 180,
        marginRight: 14,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    relatedImage: { width: '100%', height: 110, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    relatedText: { fontSize: 14, fontWeight: '700', marginTop: 6, color: '#111', paddingHorizontal: 6 },
    metaSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, marginBottom: 8 },
    metaSmallText: { color: '#6B7280', fontSize: 12, marginLeft: 4 },
});
