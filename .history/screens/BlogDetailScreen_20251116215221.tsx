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
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Back & Share Buttons */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleShare}
                        style={styles.actionBtn}
                    >
                        <AntDesign name="sharealt" size={20} color="#5865F2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleFavorite}
                        style={styles.actionBtn}
                    >
                        <AntDesign
                            name={isFavorite ? "heart" : "hearto"}
                            size={20}
                            color={isFavorite ? "#FF6B6B" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Featured Image with Gradient Overlay */}
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: image || FALLBACK_IMG }}
                    style={styles.blogImage}
                />
                <View style={styles.imageOverlay} />
                <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{tag || "BLOG"}</Text>
                </View>
            </View>

            {/* Blog Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.blogTitle}>{title || "Bài viết"}</Text>

                {/* Meta Information */}
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <AntDesign name="eye" size={16} color="#6B7280" />
                        <Text style={styles.metaText}>
                            {views || 0} lượt xem
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <AntDesign name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.metaText}>Hôm nay</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <AntDesign
                            name="clockcircle"
                            size={16}
                            color="#6B7280"
                        />
                        <Text style={styles.metaText}>5 phút đọc</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>
                            {Math.floor(views / 100)}
                        </Text>
                        <Text style={styles.statLabel}>Ngàn lượt xem</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{comments.length}</Text>
                        <Text style={styles.statLabel}>Bình luận</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>4.8</Text>
                        <Text style={styles.statLabel}>Đánh giá</Text>
                    </View>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle}>Nội dung bài viết</Text>
                <Text style={styles.contentText}>
                    {content ||
                        `Bài viết chi tiết về chủ đề ${title || "Dinh dưỡng"}.`}
                </Text>

                {/* Key Takeaways */}
                <View style={styles.takeawayBox}>
                    <View style={styles.takeawayHeader}>
                        <AntDesign name="bulb1" size={20} color="#FFA500" />
                        <Text style={styles.takeawayTitle}>Điểm chính</Text>
                    </View>
                    <View style={styles.takeawayContent}>
                        <Text style={styles.takeawayItem}>
                            • Hiểu rõ hơn về {tag?.toLowerCase() || "chủ đề"}
                        </Text>
                        <Text style={styles.takeawayItem}>
                            • Áp dụng vào đời sống hàng ngày
                        </Text>
                        <Text style={styles.takeawayItem}>
                            • Cải thiện chất lượng sức khỏe
                        </Text>
                    </View>
                </View>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentTitle}>
                        Bình luận ({comments.length})
                    </Text>
                    <TouchableOpacity
                        style={styles.addCommentBtn}
                        onPress={() => setShowCommentModal(true)}
                    >
                        <AntDesign name="plus" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {comments.length === 0 ? (
                    <Text style={styles.noCommentText}>
                        Hãy là người bình luận đầu tiên!
                    </Text>
                ) : (
                    comments.map((c) => (
                        <View key={c.id} style={styles.commentCard}>
                            <View style={styles.commentAuthor}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {c.author.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.commentMeta}>
                                    <Text style={styles.authorName}>
                                        {c.author}
                                    </Text>
                                    <Text style={styles.commentTime}>
                                        {c.timestamp}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.commentContent}>{c.text}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* Related Articles */}
            <View style={styles.relatedContainer}>
                <Text style={styles.relatedTitle}>📚 Bài viết liên quan</Text>

                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color="#5865F2"
                        style={{ marginVertical: 20 }}
                    />
                ) : relatedBlogs.length === 0 ? (
                    <Text style={styles.noRelatedText}>
                        Không có bài viết liên quan.
                    </Text>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 10 }}
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
                                <View style={styles.relatedContent}>
                                    <Text
                                        numberOfLines={2}
                                        style={styles.relatedText}
                                    >
                                        {blog.tieude}
                                    </Text>
                                    <Text style={styles.relatedViewCount}>
                                        👁 {blog.luongxem || 0}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    // Comment Modal
    return (
        <>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Back & Share Buttons */}
                <View style={styles.headerBar}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <AntDesign name="arrowleft" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={handleShare}
                            style={styles.actionBtn}
                        >
                            <AntDesign
                                name="sharealt"
                                size={20}
                                color="#5865F2"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleFavorite}
                            style={styles.actionBtn}
                        >
                            <AntDesign
                                name={isFavorite ? "heart" : "hearto"}
                                size={20}
                                color={isFavorite ? "#FF6B6B" : "#9CA3AF"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Featured Image with Gradient Overlay */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: image || FALLBACK_IMG }}
                        style={styles.blogImage}
                    />
                    <View style={styles.imageOverlay} />
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>{tag || "BLOG"}</Text>
                    </View>
                </View>

                {/* Blog Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.blogTitle}>{title || "Bài viết"}</Text>

                    {/* Meta Information */}
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <AntDesign name="eye" size={16} color="#6B7280" />
                            <Text style={styles.metaText}>
                                {views || 0} lượt xem
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <AntDesign
                                name="calendar"
                                size={16}
                                color="#6B7280"
                            />
                            <Text style={styles.metaText}>Hôm nay</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <AntDesign
                                name="clockcircle"
                                size={16}
                                color="#6B7280"
                            />
                            <Text style={styles.metaText}>5 phút đọc</Text>
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>
                                {Math.floor(views / 100)}
                            </Text>
                            <Text style={styles.statLabel}>Ngàn lượt xem</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>
                                {comments.length}
                            </Text>
                            <Text style={styles.statLabel}>Bình luận</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>4.8</Text>
                            <Text style={styles.statLabel}>Đánh giá</Text>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <Text style={styles.contentTitle}>Nội dung bài viết</Text>
                    <Text style={styles.contentText}>
                        {content ||
                            `Bài viết chi tiết về chủ đề ${
                                title || "Dinh dưỡng"
                            }.`}
                    </Text>

                    {/* Key Takeaways */}
                    <View style={styles.takeawayBox}>
                        <View style={styles.takeawayHeader}>
                            <AntDesign name="bulb1" size={20} color="#FFA500" />
                            <Text style={styles.takeawayTitle}>Điểm chính</Text>
                        </View>
                        <View style={styles.takeawayContent}>
                            <Text style={styles.takeawayItem}>
                                • Hiểu rõ hơn về{" "}
                                {tag?.toLowerCase() || "chủ đề"}
                            </Text>
                            <Text style={styles.takeawayItem}>
                                • Áp dụng vào đời sống hàng ngày
                            </Text>
                            <Text style={styles.takeawayItem}>
                                • Cải thiện chất lượng sức khỏe
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.commentTitle}>
                            Bình luận ({comments.length})
                        </Text>
                        <TouchableOpacity
                            style={styles.addCommentBtn}
                            onPress={() => setShowCommentModal(true)}
                        >
                            <AntDesign name="plus" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {comments.length === 0 ? (
                        <Text style={styles.noCommentText}>
                            Hãy là người bình luận đầu tiên!
                        </Text>
                    ) : (
                        comments.map((c) => (
                            <View key={c.id} style={styles.commentCard}>
                                <View style={styles.commentAuthor}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {c.author.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.commentMeta}>
                                        <Text style={styles.authorName}>
                                            {c.author}
                                        </Text>
                                        <Text style={styles.commentTime}>
                                            {c.timestamp}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.commentContent}>
                                    {c.text}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Related Articles */}
                <View style={styles.relatedContainer}>
                    <Text style={styles.relatedTitle}>
                        📚 Bài viết liên quan
                    </Text>

                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color="#5865F2"
                            style={{ marginVertical: 20 }}
                        />
                    ) : relatedBlogs.length === 0 ? (
                        <Text style={styles.noRelatedText}>
                            Không có bài viết liên quan.
                        </Text>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 10 }}
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
                                    <View style={styles.relatedContent}>
                                        <Text
                                            numberOfLines={2}
                                            style={styles.relatedText}
                                        >
                                            {blog.tieude}
                                        </Text>
                                        <Text style={styles.relatedViewCount}>
                                            👁 {blog.luongxem || 0}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Comment Modal */}
            <Modal
                visible={showCommentModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCommentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Thêm bình luận
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCommentModal(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={24}
                                    color="#0F172A"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.commentInputContainer}>
                            <Text style={styles.inputLabel}>
                                Chia sẻ suy nghĩ của bạn
                            </Text>
                            <View style={styles.textInputWrapper}>
                                <Text
                                    style={[
                                        styles.commentTextInput,
                                        {
                                            color: comment
                                                ? "#0F172A"
                                                : "#9CA3AF",
                                        },
                                    ]}
                                    editable
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Viết bình luận của bạn..."
                                    placeholderTextColor="#D1D5DB"
                                    onChangeText={setComment}
                                    value={comment}
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setShowCommentModal(false)}
                            >
                                <Text style={styles.cancelBtnText}>Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleAddComment}
                            >
                                <Text style={styles.submitBtnText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
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
