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
                <Text style={styles.headerTitle}>Blogs</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
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
                            selectedCategory === null &&
                                styles.categoryBtnActive,
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
                    <View style={styles.listContainer}>
                        <View style={styles.blogGrid}>
                            {filteredBlogs.map((item) => (
                                <View key={item.id} style={styles.blogGridItem}>
                                    {renderBlogCard({ item })}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FB",
    },

    // Header Styles
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 0,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#1F2937",
    },

    // Search Bar Styles
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginVertical: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 10,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#1F2937",
        padding: 0,
    },

    // Category Filter Styles
    categoryScroll: {
        backgroundColor: "#fff",
        borderBottomWidth: 0,
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    categoryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        alignItems: "center",
    },
    categoryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        backgroundColor: "#fff",
    },
    categoryBtnActive: {
        backgroundColor: "#5865F2",
        borderColor: "#5865F2",
        shadowColor: "#5865F2",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    categoryBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    categoryBtnTextActive: {
        color: "#fff",
        fontWeight: "700",
    },

    // Result Info
    resultInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#transparent",
    },
    resultText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },

    // Blog Card Styles
    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingBottom: 100,
    },
    blogGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
    },
    blogGridItem: {
        width: "48%",
    },
    blogCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 160,
        backgroundColor: "#E5E7EB",
    },
    blogImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    categoryBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(88, 101, 242, 0.95)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        shadowColor: "#5865F2",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
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
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
        lineHeight: 20,
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
        fontSize: 11,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    dot: {
        fontSize: 11,
        color: "#D1D5DB",
        fontWeight: "600",
    },
    dateText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#9CA3AF",
    },

    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1F2937",
        marginTop: 16,
        textAlign: "center",
    },
    emptySubText: {
        fontSize: 15,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
    },
});
