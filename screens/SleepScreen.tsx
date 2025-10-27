import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function SleepScreen() {
  const sleepData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [6.5, 7, 6.8, 7.2, 7, 8, 7.5],
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <Text style={styles.title}>Sleep</Text>
      <Text style={styles.subtitle}>
        Your average time of sleep a day is{' '}
        <Text style={styles.highlight}>7h 31min</Text>
      </Text>

      
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabTextActive}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Monthly</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.chartContainer}>
        <BarChart
          data={sleepData}
          width={screenWidth - 40}
          height={320} 
          yAxisSuffix="h"
          fromZero
          showValuesOnTopOfBars={false}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(155, 89, 182, ${opacity})`,
            labelColor: () => '#777',
            barPercentage: 0.55,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

  
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💤</Text>
          <Text style={styles.statLabel}>Sleep rate</Text>
          <Text style={styles.statValue}>82%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🌙</Text>
          <Text style={styles.statLabel}>Deepsleep</Text>
          <Text style={styles.statValue}>1h 3min</Text>
        </View>
      </View>

 
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleTitle}>Set your schedule</Text>
        <TouchableOpacity>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.scheduleContainer}>
        <View style={[styles.timeCard, { backgroundColor: '#9B59B6' }]}>
          <Text style={styles.timeLabel}>🛏️ Bedtime</Text>
          <Text style={styles.timeValue}>22:00 pm</Text>
        </View>
        <View style={[styles.timeCard, { backgroundColor: '#4BC7E2' }]}>
          <Text style={styles.timeLabel}>☀️ Wake up</Text>
          <Text style={styles.timeValue}>07:30 am</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginTop: 6,
    fontSize: 14,
  },
  highlight: {
    color: '#9B59B6',
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  tabActive: {
    backgroundColor: '#9B59B6',
  },
  tabText: {
    color: '#777',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20, // giãn dưới cho cân
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30, // giãn thêm khoảng cách
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    color: '#777',
    marginTop: 4,
  },
  statValue: {
    fontWeight: '700',
    color: '#9B59B6',
    marginTop: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  editText: {
    color: '#9B59B6',
    fontWeight: '700',
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40, 
  },
  timeCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 20,
    paddingVertical: 26,
    alignItems: 'center',
  },
  timeLabel: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6,
  },
  timeValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
