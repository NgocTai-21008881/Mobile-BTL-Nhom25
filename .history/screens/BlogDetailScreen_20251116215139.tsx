import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
    Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1524594227085-4cb851b78d7e?w=1200&auto=format&fit=crop&q=60";

export default function BlogDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { title, tag, views, image, content } = (route.params || {}) as any;

    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("blogs")
                .select("id, tieude, hinhanh, loai, luongxem")
                .neq("tieude", title || "")
                .eq("loai", tag || "Dinh dưỡng")
                .limit(5);

            if (error) console.error("Lỗi khi tải related blogs:", error);
            else setRelatedBlogs(data || []);
            setLoading(false);
        })();
    }, [title, tag]);

    // Handle share
    const handleShare = async () => {
        try {
            await Share.share({
                message: `${title}\n\nKhám phá bài viết này: ${tag}`,
                title: title,
            });
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chia sẻ bài viết");
        }
    };

    // Handle favorite
    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        Alert.alert(
            "Thành công",
            isFavorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích"
        );
    };

    // Handle comment
    const handleAddComment = () => {
        if (comment.trim() === "") {
            Alert.alert("Lỗi", "Vui lòng nhập bình luận");
            return;
        }
        setComments([
            ...comments,
            {
                id: comments.length + 1,
                text: comment,
                author: "Bạn",
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
        ]);
        setComment("");
        setShowCommentModal(false);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Back button — không icon, không lỗi "?" */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            {/* Image */}
            <Image
                source={{ uri: image || FALLBACK_IMG }}
                style={styles.blogImage}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.blogTag}>{tag || "DINH DƯỠNG"}</Text>
                <Text style={styles.blogTitle}>{title || "Bài viết"}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>👁 {views || 0} views</Text>
                </View>
            </View>

            {/* Content */}
            <Text style={styles.contentText}>
                {content ||
                    `Bài viết chi tiết về chủ đề ${title || "Dinh dưỡng"}.`}
            </Text>

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
                                key={blog.id}
                                style={styles.relatedCard}
                                onPress={() =>
                                    navigation.replace("BlogDetailScreen", {
                                        title: blog.tieude,
                                        tag: blog.loai,
                                        views: blog.luongxem,
                                        image: blog.hinhanh,
                                        content: `Bài viết chi tiết về chủ đề ${blog.tieude}.`,
                                    })
                                }
                            >
                                <Image
                                    source={{
                                        uri: blog.hinhanh || FALLBACK_IMG,
                                    }}
                                    style={styles.relatedImage}
                                />
                                <Text
                                    numberOfLines={2}
                                    style={styles.relatedText}
                                >
                                    {blog.tieude}
                                </Text>
                                <Text style={styles.metaSmallText}>
                                    👁 {blog.luongxem || 0} views
                                </Text>
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
    backText: { fontSize: 28, color: "#333", lineHeight: 28 },
    blogImage: { width: "100%", height: 220, borderRadius: 16 },
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
    },
    relatedText: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 6,
        color: "#111",
        paddingHorizontal: 6,
    },
    metaSmallText: {
        color: "#6B7280",
        fontSize: 12,
        marginLeft: 6,
        marginBottom: 8,
    },
});
