import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

export default function CycleTrackingScreen() {
  // Types
  type Cycle = {
    id?: number;
    user_id?: string;
    start_date?: string; // ISO
    end_date?: string | null;
    average_length?: number; // in days
    notes?: string;
  } | null;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<Cycle>(null);
  const [dates, setDates] = useState<string[]>([]);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Build 7-day dates from today
  useEffect(() => {
    const arr: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      arr.push(dd);
    }
    setDates(arr);
  }, []);

  useEffect(() => {
    const loadCycle = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          setError('Người dùng chưa đăng nhập');
          setLoading(false);
          return;
        }

        const userId = userData.user.id;

        // ASSUMPTION: table name is `cycles` with field `user_id` and `start_date` (ISO string)
        const { data, error: qErr } = await supabase
          .from('cycles')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (qErr) {
          console.warn('Supabase cycles error', qErr.message);
          setError('Không thể tải dữ liệu chu kỳ');
        } else if (!data) {
          // No cycles yet
          setCycle(null);
        } else {
          setCycle(data as Cycle);
        }
      } catch (e: any) {
        setError(e.message ?? 'Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    loadCycle();
  }, []);

  // Helper: compute days until next period
  const daysUntilNext = () => {
    if (!cycle?.start_date) return null;
    const avg = cycle.average_length ?? 28;
    const lastStart = new Date(cycle.start_date);
    const nextStart = new Date(lastStart);
    nextStart.setDate(nextStart.getDate() + avg);
    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((nextStart.getTime() - today.getTime()) / msPerDay);
    return diff;
  };

  const daysUntil = daysUntilNext();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Cycle tracking</Text>

      {loading ? (
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <ActivityIndicator size="large" color="#FF7F00" />
        </View>
      ) : error ? (
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.dateRow}>
            {days.map((d, index) => (
              <View key={index} style={styles.dateItem}>
                <Text style={styles.dayText}>{d}</Text>
                <View style={[styles.dateCircle, index === 5 && styles.dateCircleActive]}>
                  <Text style={[styles.dateNumber, index === 5 && styles.dateNumberActive]}>
                    {dates[index] ?? '--'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.periodContainer}>
            <View style={styles.periodCircle}>
              <Text style={styles.periodText}>Period in</Text>
              <Text style={styles.periodDays}>
                {daysUntil == null
                  ? '—'
                  : daysUntil <= 0
                  ? 'Now'
                  : `${daysUntil} days`}
              </Text>
              <Text style={styles.periodSub}>Low chance of getting pregnant</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit period dates</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          </View>
          <View style={styles.feelingRow}>
            <View style={styles.feelingCard}>
              <Text style={styles.feelingIcon}>💬</Text>
              <Text style={styles.feelingText}>{cycle?.notes ?? 'Share your symptoms with us'}</Text>
            </View>
            <View style={styles.feelingCard}>
              <Text style={styles.feelingIcon}>📊</Text>
              <Text style={styles.feelingText}>Here's your daily insights</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menstrual health</Text>
            <TouchableOpacity>
              <Text style={styles.viewMore}>View more ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.articleRow}>
            <View style={styles.articleCard}>
              <Image source={require('../assets/keo.jpg')} style={styles.articleImage} />
              <Text style={styles.articleText}>
                Craving sweets on your period? Here's why & what to do about it
              </Text>
            </View>
            <View style={styles.articleCard}>
              <Image source={require('../assets/thuoc.jpg')} style={styles.articleImage} />
              <Text style={styles.articleText}>
                Is birth control safe for menstrual health?
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  dateItem: {
    alignItems: 'center',
  },
  dayText: {
    color: '#777',
    fontSize: 13,
    marginBottom: 6,
  },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  dateCircleActive: {
    backgroundColor: '#FF7F00',
  },
  dateNumber: {
    color: '#333',
    fontWeight: '600',
  },
  dateNumberActive: {
    color: '#fff',
  },
  periodContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  periodCircle: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: (screenWidth * 0.7) / 2,
    backgroundColor: 'rgba(255,127,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    color: '#444',
    fontSize: 14,
    marginBottom: 4,
  },
  periodDays: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF7F00',
  },
  periodSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
  },
  editButton: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF7F00',
  },
  editButtonText: {
    color: '#FF7F00',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  viewMore: {
    color: '#FF7F00',
    fontWeight: '600',
  },
  feelingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  feelingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '47%',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  feelingIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  feelingText: {
    color: '#444',
    textAlign: 'center',
    fontSize: 13,
  },
  articleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '47%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  articleText: {
    padding: 10,
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
});
