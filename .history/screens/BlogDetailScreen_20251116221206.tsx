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
    TextInput,
    FlatList,
    Dimensions,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1524594227085-4cb851b78d7e?w=1200&auto=format&fit=crop&q=60";
const { width } = Dimensions.get("window");

interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

interface Rating {
    id: string;
    author: string;
    rating: number;
    comment: string;
    timestamp: string;
}

export default function BlogDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { title, tag, views, image, content } = (route.params || {}) as any;

    // State management
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "content" | "comments" | "ratings"
    >("content");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [selectedRating, setSelectedRating] = useState(0);
    const [averageRating, setAverageRating] = useState(4.8);
    const [ratingComment, setRatingComment] = useState("");

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

    // Handle add comment
    const handleAddComment = () => {
        if (comment.trim() === "") {
            Alert.alert("Lỗi", "Vui lòng nhập bình luận");
            return;
        }
        const newComment: Comment = {
            id: Date.now().toString(),
            text: comment,
            author: "Bạn",
            timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
        setComments([newComment, ...comments]);
        setComment("");
        setShowCommentModal(false);
    };

    // Handle add rating
    const handleAddRating = () => {
        if (selectedRating === 0) {
            Alert.alert("Lỗi", "Vui lòng chọn số sao");
            return;
        }
        const newRating: Rating = {
            id: Date.now().toString(),
            author: "Bạn",
            rating: selectedRating,
            comment: ratingComment,
            timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
        setRatings([newRating, ...ratings]);
        // Update average rating
        const allRatings = [newRating, ...ratings];
        const avg = (
            allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        ).toFixed(1);
        setAverageRating(parseFloat(avg));
        setSelectedRating(0);
        setRatingComment("");
        setShowRatingModal(false);
    };

    // Delete comment
    const handleDeleteComment = (id: string) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa bình luận này?", [
            { text: "Hủy", onPress: () => {} },
            {
                text: "Xóa",
                onPress: () => {
                    setComments(comments.filter((c) => c.id !== id));
                },
                style: "destructive",
            },
        ]);
    };

    // Delete rating
    const handleDeleteRating = (id: string) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa đánh giá này?", [
            { text: "Hủy", onPress: () => {} },
            {
                text: "Xóa",
                onPress: () => {
                    const updated = ratings.filter((r) => r.id !== id);
                    setRatings(updated);
                    if (updated.length > 0) {
                        const avg = (
                            updated.reduce((sum, r) => sum + r.rating, 0) /
                            updated.length
                        ).toFixed(1);
                        setAverageRating(parseFloat(avg));
                    }
                },
                style: "destructive",
            },
        ]);
    };

    const renderStars = (
        rating: number,
        onPress?: (rating: number) => void,
        size: number = 20
    ) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onPress?.(star)}
                        disabled={!onPress}
                    >
                        <AntDesign
                            name="star"
                            size={size}
                            color={star <= rating ? "#FFD700" : "#D1D5DB"}
                            style={{
                                marginRight: 4,
                                opacity: star <= rating ? 1 : 0.3,
                            }}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderContentTab = () => (
        <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <AntDesign name="search" size={18} color="#6B7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm trong bài viết..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Article Content */}
            <View style={styles.contentArticle}>
                <Text style={styles.contentTitle}>Nội dung bài viết</Text>
                <Text style={styles.contentText}>
                    {content || (
                        <>
                            Bài viết{" "}
                            <Text style={styles.highlightText}>chi tiết</Text>{" "}
                            về chủ đề {title || "Dinh dưỡng"}.
                        </>
                    )}
                </Text>
            </View>

            {/* Key Takeaways */}
            <View style={styles.takeawayBox}>
                <View style={styles.takeawayHeader}>
                    <MaterialCommunityIcons
                        name="lightbulb-on"
                        size={20}
                        color="#FFA500"
                    />
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
        </>
    );

    const renderCommentsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>
                    Bình luận ({comments.length})
                </Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setShowCommentModal(true)}
                >
                    <AntDesign name="plus" size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
            </View>

            {comments.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                        name="comment-outline"
                        size={48}
                        color="#D1D5DB"
                    />
                    <Text style={styles.emptyText}>
                        Hãy là người bình luận đầu tiên!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.commentCard}>
                            <View style={styles.commentHeader}>
                                <View style={styles.avatarComment}>
                                    <Text style={styles.avatarText}>
                                        {item.author.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.authorName}>
                                        {item.author}
                                    </Text>
                                    <Text style={styles.commentTime}>
                                        {item.timestamp}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeleteComment(item.id)}
                                >
                                    <AntDesign
                                        name="delete"
                                        size={18}
                                        color="#FF6B6B"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.commentText}>{item.text}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );

    const renderRatingsTab = () => (
        <View style={styles.tabContent}>
            {/* Rating Summary */}
            <View style={styles.ratingSummary}>
                <View style={styles.ratingScore}>
                    <Text style={styles.ratingNumber}>{averageRating}</Text>
                    <View style={{ marginLeft: 8 }}>
                        {renderStars(Math.round(averageRating), undefined, 16)}
                        <Text style={styles.ratingCount}>
                            {ratings.length} đánh giá
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.ratingAddBtn}
                    onPress={() => setShowRatingModal(true)}
                >
                    <AntDesign name="plus" size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Đánh giá</Text>
                </TouchableOpacity>
            </View>

            {/* Rating Breakdown */}
            {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter((r) => r.rating === star).length;
                const percentage =
                    ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                return (
                    <View key={star} style={styles.ratingBar}>
                        <View style={styles.ratingLabelBar}>
                            <Text style={styles.ratingLabel}>{star}</Text>
                            <AntDesign name="star" size={14} color="#FFD700" />
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${percentage}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.ratingPercent}>{count}</Text>
                    </View>
                );
            })}

            {/* Rating List */}
            {ratings.length > 0 && (
                <>
                    <Text style={styles.ratingsListTitle}>
                        Đánh giá mới nhất
                    </Text>
                    <FlatList
                        data={ratings}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View style={styles.ratingCard}>
                                <View style={styles.ratingCardHeader}>
                                    <View style={styles.avatarComment}>
                                        <Text style={styles.avatarText}>
                                            {item.author
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.authorName}>
                                            {item.author}
                                        </Text>
                                        {renderStars(
                                            item.rating,
                                            undefined,
                                            14
                                        )}
                                        <Text style={styles.commentTime}>
                                            {item.timestamp}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleDeleteRating(item.id)
                                        }
                                    >
                                        <AntDesign
                                            name="delete"
                                            size={18}
                                            color="#FF6B6B"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {item.comment && (
                                    <Text style={styles.ratingComment}>
                                        {item.comment}
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                </>
            )}
        </View>
    );

    return (
        <>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Bar */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <AntDesign
                            name="arrow-left"
                            size={24}
                            color="#0F172A"
                        />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={handleShare}
                            style={styles.actionButton}
                        >
                            <AntDesign
                                name="share-alt"
                                size={20}
                                color="#5865F2"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleFavorite}
                            style={styles.actionButton}
                        >
                            <AntDesign
                                name={isFavorite ? "heart" : "heart"}
                                size={20}
                                color={isFavorite ? "#FF6B6B" : "#6B7280"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Featured Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: image || FALLBACK_IMG }}
                        style={styles.heroImage}
                    />
                    <View style={styles.imageOverlay} />
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{tag || "BLOG"}</Text>
                    </View>
                </View>

                {/* Title and Meta */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>{title || "Bài viết"}</Text>

                    <View style={styles.metaInfo}>
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
                                name="clock-circle"
                                size={16}
                                color="#6B7280"
                            />
                            <Text style={styles.metaText}>5 phút</Text>
                        </View>
                    </View>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "content" && styles.tabButtonActive,
                        ]}
                        onPress={() => setActiveTab("content")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === "content" &&
                                    styles.tabButtonTextActive,
                            ]}
                        >
                            Nội dung
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "comments" && styles.tabButtonActive,
                        ]}
                        onPress={() => setActiveTab("comments")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === "comments" &&
                                    styles.tabButtonTextActive,
                            ]}
                        >
                            Bình luận ({comments.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "ratings" && styles.tabButtonActive,
                        ]}
                        onPress={() => setActiveTab("ratings")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === "ratings" &&
                                    styles.tabButtonTextActive,
                            ]}
                        >
                            Đánh giá
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === "content" && renderContentTab()}
                {activeTab === "comments" && renderCommentsTab()}
                {activeTab === "ratings" && renderRatingsTab()}

                {/* Related Articles */}
                <View style={styles.relatedSection}>
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
                        <Text style={styles.emptyText}>
                            Không có bài viết liên quan.
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
                                    <View style={styles.relatedInfo}>
                                        <Text
                                            numberOfLines={2}
                                            style={styles.relatedText}
                                        >
                                            {blog.tieude}
                                        </Text>
                                        <Text style={styles.relatedViews}>
                                            👁 {blog.luongxem || 0}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Comment Modal */}
            <Modal
                visible={showCommentModal}
                transparent
                animationType="slide"
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

                        <TextInput
                            style={styles.commentInput}
                            placeholder="Viết bình luận của bạn..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowCommentModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleAddComment}
                            >
                                <Text style={styles.submitButtonText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Rating Modal */}
            <Modal
                visible={showRatingModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRatingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Đánh giá bài viết
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowRatingModal(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={24}
                                    color="#0F172A"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.ratingModalContent}>
                            <Text style={styles.ratingPrompt}>
                                Bạn cảm thấy bài viết thế nào?
                            </Text>
                            {renderStars(selectedRating, setSelectedRating, 32)}

                            <TextInput
                                style={styles.ratingInput}
                                placeholder="Chia sẻ ý kiến của bạn (tùy chọn)..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                                value={ratingComment}
                                onChangeText={setRatingComment}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowRatingModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleAddRating}
                            >
                                <Text style={styles.submitButtonText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        paddingTop: 12,
        backgroundColor: "#fff",
    },
    backBtn: {
        padding: 8,
    },
    headerActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    // Image
    imageContainer: {
        position: "relative",
        backgroundColor: "#E5E7EB",
        marginHorizontal: 20,
        marginVertical: 16,
        borderRadius: 16,
        overflow: "hidden",
    },
    heroImage: {
        width: "100%",
        height: 220,
    },
    imageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.15)",
    },
    tagBadge: {
        position: "absolute",
        bottom: 12,
        left: 12,
        backgroundColor: "rgba(88, 101, 242, 0.9)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    // Title
    titleSection: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
        lineHeight: 32,
    },
    metaInfo: {
        flexDirection: "row",
        gap: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    // Tabs
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#fff",
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    tabButtonActive: {
        borderBottomColor: "#5865F2",
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6B7280",
    },
    tabButtonTextActive: {
        color: "#5865F2",
        fontWeight: "600",
    },
    tabContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    // Content Tab
    searchContainer: {
        marginBottom: 16,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        marginLeft: 8,
        fontSize: 14,
        color: "#0F172A",
    },
    contentArticle: {
        marginBottom: 16,
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
    },
    contentText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 22,
        marginBottom: 16,
    },
    highlightText: {
        color: "#5865F2",
        fontWeight: "600",
    },
    // Key Takeaways
    takeawayBox: {
        backgroundColor: "#FFF8E7",
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#FFA500",
        padding: 12,
        marginBottom: 16,
    },
    takeawayHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    takeawayTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#92400E",
    },
    takeawayContent: {
        gap: 6,
    },
    takeawayItem: {
        fontSize: 13,
        color: "#B45309",
        lineHeight: 20,
    },
    // Comments Tab
    tabHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    tabTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#5865F2",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 12,
    },
    commentCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 10,
    },
    avatarComment: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#5865F2",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    authorName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
    },
    commentTime: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    commentText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        marginLeft: 48,
    },
    // Ratings Tab
    ratingSummary: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    ratingScore: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingNumber: {
        fontSize: 32,
        fontWeight: "700",
        color: "#5865F2",
        marginRight: 12,
    },
    starsContainer: {
        flexDirection: "row",
        marginBottom: 4,
    },
    ratingCount: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
    },
    ratingAddBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#10B981",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    // Rating Breakdown
    ratingBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    ratingLabelBar: {
        width: 30,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
        minWidth: 16,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#FFD700",
        borderRadius: 3,
    },
    ratingPercent: {
        fontSize: 12,
        color: "#6B7280",
        minWidth: 20,
        textAlign: "right",
    },
    ratingsListTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 16,
        marginBottom: 12,
    },
    ratingCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    ratingCardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 10,
    },
    ratingComment: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        marginLeft: 48,
        marginTop: 8,
    },
    // Related Section
    relatedSection: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    relatedTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    relatedCard: {
        width: 160,
        marginRight: 12,
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    relatedImage: {
        width: "100%",
        height: 100,
    },
    relatedInfo: {
        padding: 10,
    },
    relatedText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 6,
    },
    relatedViews: {
        fontSize: 11,
        color: "#9CA3AF",
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    commentInput: {
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        marginTop: 16,
        marginBottom: 16,
        fontSize: 14,
        color: "#0F172A",
        textAlignVertical: "top",
    },
    ratingModalContent: {
        alignItems: "center",
        paddingVertical: 20,
    },
    ratingPrompt: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 16,
    },
    ratingInput: {
        width: "100%",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        marginTop: 16,
        fontSize: 14,
        color: "#0F172A",
        textAlignVertical: "top",
    },
    modalButtons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    submitButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#5865F2",
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
});
