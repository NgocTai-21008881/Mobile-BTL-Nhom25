import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SharingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sharing</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#FF6B6B" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Keep your health in check</Text>
            <Text style={styles.desc}>
              Keep loved ones informed about your condition.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#6C63FF" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Protect your privacy</Text>
            <Text style={styles.desc}>
              Share key conclusions. Stop anytime.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={24} color="#4ECDC4" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.desc}>
              Get notified of updates to shared dashboards.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton}>
        <Ionicons name="share-outline" size={20} color="#fff" />
        <Text style={styles.primaryButtonText}>Start sharing</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Ionicons name="settings-outline" size={20} color="#333" />
        <Text style={styles.secondaryButtonText}>Setting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  desc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#00B7FF',
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
