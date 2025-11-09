import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1524594227085-4cb851b78d7e?w=1200&auto=format&fit=crop&q=60";

export default function BlogDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();

    const params = (route.params || {}) as any;
    const title = params?.title ?? "";
    const tag = params?.tag ?? "Dinh dưỡng";
    const views = params?.views ?? 0;
    const image = params?.image || FALLBACK_IMG;
    const content = params?.content ?? `Bài viết chi tiết về chủ đề ${title}.`;

    const [imgUri, setImgUri] = useState(image);
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách bài viết cùng loại (related)
    useEffect(() => {
        let isMounted = true;

        (async () => {
            const { data, error } = await supabase
                .from("blogs")
                .select("id, tieude, hinhanh, loai, luongxem")
                .eq("loai", tag)
                .neq("tieude", title)
                .order("luongxem", { ascending: false })
                .limit(10);

            if (!isMounted) return;
            if (error) {
                console.error("Lỗi khi tải related blogs:", error);
                setRelatedBlogs([]);
            } else {
                setRelatedBlogs(data ?? []);
            }
            setLoading(false);
        })();

        return () => {
            isMounted = false;
        };
    }, [title, tag]);

    return (
        <ScrollView style={styles.container}>
            {/* Dùng header mặc định của Stack, không render icon custom để tránh ký tự "?" */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Text style={{ fontSize: 22, color: "#333" }}>‹</Text>
            </TouchableOpacity>

            {/* Image */}
            <Image
                source={{ uri: imgUri }}
                style={styles.blogImage}
                onError={() => setImgUri(FALLBACK_IMG)}
            />

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
                    <ActivityIndicator
                        size="small"
                        color="#4BC7E2"
                        style={{ marginVertical: 20 }}
                    />
                ) : relatedBlogs.length === 0 ? (
                    <Text style={{ color: "#777" }}>
                        No related articles found.
                    </Text>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {relatedBlogs.map((blog) => (
                            <TouchableOpacity
                                key={blog.id?.toString()}
                                style={styles.relatedCard}
                                onPress={() =>
                                    navigation.push("BlogDetailScreen", {
                                        title: blog.tieude,
                                        tag: blog.loai,
                                        views: blog.luongxem ?? 0,
                                        image: blog.hinhanh || FALLBACK_IMG,
                                        content: `Bài viết chi tiết về chủ đề ${blog.tieude}.`,
                                    })
                                }
                            >
                                <Image
                                    source={{
                                        uri: blog.hinhanh || FALLBACK_IMG,
                                    }}
                                    style={styles.relatedImage}
                                    onError={({ nativeEvent }) => {
                                        // đổi sang fallback nếu ảnh lỗi
                                        (
                                            nativeEvent as any
                                        ).target?.setNativeProps?.({
                                            src: [{ uri: FALLBACK_IMG }],
                                        });
                                    }}
                                />
                                <Text
                                    numberOfLines={2}
                                    style={styles.relatedText}
                                >
                                    {blog.tieude}
                                </Text>
                                <View style={styles.metaSmall}>
                                    <AntDesign
                                        name="eye"
                                        size={12}
                                        color="#6B7280"
                                    />
                                    <Text style={styles.metaSmallText}>
                                        {" "}
                                        {blog.luongxem ?? 0} views
                                    </Text>
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
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
    backButton: { marginTop: 40, marginBottom: 10, width: 30 },
    blogImage: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        backgroundColor: "#f3f4f6",
    },
    infoContainer: { marginTop: 16 },
    blogTag: {
        color: "#4BC7E2",
        fontWeight: "700",
        textTransform: "uppercase",
    },
    blogTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111",
        marginVertical: 6,
    },
    metaRow: { flexDirection: "row", alignItems: "center" },
    metaText: { color: "#777", marginLeft: 4 },
    contentText: { marginTop: 20, lineHeight: 22, color: "#333", fontSize: 15 },
    relatedContainer: { marginTop: 30, marginBottom: 40 },
    relatedTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#111",
    },
    relatedCard: {
        width: 180,
        marginRight: 14,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    relatedImage: {
        width: "100%",
        height: 110,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: "#f3f4f6",
    },
    relatedText: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 6,
        color: "#111",
        paddingHorizontal: 6,
    },
    metaSmall: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        marginBottom: 8,
        marginTop: 4,
    },
    metaSmallText: { color: "#6B7280", fontSize: 12, marginLeft: 4 },
});
