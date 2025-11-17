import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    FlatList,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function AllBlogsScreen() {
    const navigation = useNavigation<any>();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("blogs")
                .select("id, tieude, hinhanh, loai, luongxem, ngaytao")
                .order("ngaytao", { ascending: false });

            if (error) console.error("Lỗi khi lấy blogs:", error.message);
            else {
                setBlogs(data || []);
                // Extract unique categories
                const uniqueCategories = [
                    ...new Set((data || []).map((blog) => blog.loai)),
                ];
                setCategories(uniqueCategories as string[]);
            }
            setLoading(false);
        })();
    }, []);

    // Filter blogs based on search and category
    useMemo(() => {
        let filtered = blogs;

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (blog) =>
                    blog.tieude
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    blog.loai.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(
                (blog) => blog.loai === selectedCategory
            );
        }

        setFilteredBlogs(filtered);
    }, [searchQuery, selectedCategory, blogs]);

    const renderBlogCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.blogCard}
            onPress={() =>
                navigation.navigate("BlogDetailScreen", {
                    title: item.tieude,
                    tag: item.loai,
                    views: item.luongxem,
                    image: item.hinhanh,
                    content: `Bài viết chi tiết về chủ đề ${item.tieude}.`,
                })
            }
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.hinhanh }}
                    style={styles.blogImage}
                />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.loai}</Text>
                </View>
            </View>
            <View style={styles.blogContent}>
                <Text numberOfLines={2} style={styles.blogTitle}>
                    {item.tieude}
                </Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <AntDesign name="eye" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{item.luongxem}</Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.dateText}>
                        {new Date(item.ngaytao).toLocaleDateString("vi-VN")}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrow-left" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blogs</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <AntDesign name="search" size={16} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm bài viết..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <AntDesign name="close" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContainer}
            >
                <TouchableOpacity
                    style={[
                        styles.categoryBtn,
                        selectedCategory === null && styles.categoryBtnActive,
                    ]}
                    onPress={() => setSelectedCategory(null)}
                >
                    <Text
                        style={[
                            styles.categoryBtnText,
                            selectedCategory === null &&
                                styles.categoryBtnTextActive,
                        ]}
                    >
                        Tất cả
                    </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryBtn,
                            selectedCategory === category &&
                                styles.categoryBtnActive,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryBtnText,
                                selectedCategory === category &&
                                    styles.categoryBtnTextActive,
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results info */}
            {!loading && filteredBlogs.length > 0 && (
                <View style={styles.resultInfo}>
                    <Text style={styles.resultText}>
                        Tìm thấy {filteredBlogs.length} bài viết
                    </Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#5865F2"
                    style={{ marginTop: 40 }}
                />
            ) : filteredBlogs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <AntDesign name="inbox" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>
                        {blogs.length === 0
                            ? "Chưa có bài viết nào"
                            : "Không tìm thấy bài viết"}
                    </Text>
                    <Text style={styles.emptySubText}>
                        {searchQuery || selectedCategory
                            ? "Hãy thử tìm kiếm với từ khóa khác"
                            : "Hãy quay lại sau"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBlogs}
                    renderItem={renderBlogCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },

    // Header Styles
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
    },

    // Search Bar Styles
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
        padding: 0,
    },

    // Category Filter Styles
    categoryScroll: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
    },
    categoryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    categoryBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
    },
    categoryBtnActive: {
        backgroundColor: "#5865F2",
        borderColor: "#5865F2",
    },
    categoryBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },
    categoryBtnTextActive: {
        color: "#fff",
    },

    // Result Info
    resultInfo: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#F3F4F6",
    },
    resultText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B7280",
    },

    // Blog Card Styles
    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 100,
    },
    blogCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 200,
        backgroundColor: "#F3F4F6",
    },
    blogImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    categoryBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(88, 101, 242, 0.9)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#fff",
    },
    blogContent: {
        padding: 12,
    },
    blogTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B7280",
    },
    dot: {
        fontSize: 12,
        color: "#D1D5DB",
    },
    dateText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#6B7280",
    },

    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginTop: 16,
        textAlign: "center",
    },
    emptySubText: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 8,
        textAlign: "center",
    },
});
