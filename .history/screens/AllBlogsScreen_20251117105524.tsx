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
                    blog.loai
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter((blog) => blog.loai === selectedCategory);
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
                    <AntDesign name="arrowleft" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blogs</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <AntDesign name="search1" size={16} color="#9CA3AF" />
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
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    backButton: {
        padding: 4,
        borderRadius: 20,
    },
    backText: {
        fontSize: 28,
        color: "#111827",
        fontWeight: "500",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

    blogItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginHorizontal: 18,
        marginTop: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
        overflow: "hidden",
    },
    blogImage: { width: 110, height: 100 },
    blogInfo: { flex: 1, padding: 10, justifyContent: "center" },
    blogTag: { color: "#4BC7E2", fontSize: 12, fontWeight: "700" },
    blogTitle: { color: "#111", fontWeight: "700", fontSize: 15, marginTop: 2 },
    metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    blogMeta: { color: "#6B7280", fontSize: 12 },
    dot: { color: "#9AA0A6", marginHorizontal: 6 },
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        color: "#777",
        fontSize: 15,
    },
});
