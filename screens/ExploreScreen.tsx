import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" />
        <TextInput
          placeholder="Search topic"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
        <Image
        //   source={{ uri: 'https://....jpg' }}
          style={styles.avatar}
        />
      </View>

      {/* For You Section */}
      <Text style={styles.sectionTitle}>For you</Text>
      <View style={styles.forYouRow}>
        <View style={styles.forYouItem}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/96/healthy-food.png' }}
            style={styles.forYouIcon}
          />
          <Text style={styles.forYouLabel}>Nutrition</Text>
        </View>

        <View style={styles.forYouItem}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/96/training.png' }}
            style={styles.forYouIcon}
          />
          <Text style={styles.forYouLabel}>Sports</Text>
        </View>

        <View style={styles.forYouItem}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/96/running.png' }}
            style={styles.forYouIcon}
          />
          <Text style={styles.forYouLabel}>Running</Text>
        </View>
      </View>

{/* Newest blogs */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Newest blogs</Text>
  <TouchableOpacity>
    <Text style={styles.viewMore}>View more →</Text>
  </TouchableOpacity>
</View>

<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View style={styles.blogCard}>
    <Image
      source={require('../assets/apple.jpg')}
      style={styles.blogImage}
    />
    <Text style={styles.blogCategory}>Nutrition</Text>
    <Text style={styles.blogTitle}>
      More about Apples: Benefits, nutrition, and tips
    </Text>
    <View style={styles.blogFooter}>
      <Ionicons name="thumbs-up-outline" size={16} color="#00B7FF" />
      <Text style={styles.blogVotes}>78 votes</Text>
      <Text style={styles.blogMore}>Tell me more</Text>
    </View>
  </View>

  <View style={styles.blogCard}>
    <Image
      source={require('../assets/time.jpg')}
      style={styles.blogImage}
    />
    <Text style={styles.blogCategory}>Lifestyle</Text>
    <Text style={styles.blogTitle}>
      The simplest guide to mastering wellness
    </Text>
    <View style={styles.blogFooter}>
      <Ionicons name="thumbs-up-outline" size={16} color="#00B7FF" />
      <Text style={styles.blogVotes}>54 votes</Text>
      <Text style={styles.blogMore}>Tell me more</Text>
    </View>
  </View>
</ScrollView>

      {/* Collection */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Collection</Text>
        <TouchableOpacity>
          <Text style={styles.viewMore}>View more →</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 25,
  },
  forYouRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  forYouItem: {
    alignItems: 'center',
  },
  forYouIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  forYouLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  viewMore: {
    color: '#00B7FF',
    fontWeight: '600',
  },
  blogCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 10,
  },
  blogImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  blogCategory: {
    color: '#888',
    fontSize: 13,
    marginTop: 6,
  },
  blogTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  blogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  blogVotes: {
    marginLeft: 4,
    color: '#00B7FF',
    fontSize: 12,
  },
  blogMore: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
});

