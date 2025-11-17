import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ProgressChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function AllHealthyStepScreen() {
  const goalProgress = 0.8; 
  const steps = 11857;
  const goal = 18000;

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [5000, 7000, 8000, 10000, 9000, 8500, 9500],
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Steps</Text>
      <Text style={styles.subtitle}>
        You have achieved <Text style={styles.highlight}>80%</Text> of your goal today
      </Text>

      {/* Progress Circle */}
      <ProgressChart
        data={{ data: [goalProgress] }}
        width={screenWidth - 40}
        height={200}
        strokeWidth={14}
        radius={80}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(75, 199, 226, ${opacity})`, 
        }}
        hideLegend={true}
        style={{ alignSelf: 'center', marginTop: 20 }}
      />
      <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>
      <Text style={styles.stepGoal}>Steps out of {goal / 1000}k</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4BC7E2' }]}>850</Text>
          <Text style={styles.statLabel}>kcal</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4BC7E2' }]}>5</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4BC7E2' }]}>120</Text>
          <Text style={styles.statLabel}>min</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartTabs}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Monthly</Text>
          </TouchableOpacity>
        </View>
        <LineChart
          data={lineData}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundGradientFrom: '#f7f7f7',
            backgroundGradientTo: '#f7f7f7',
            color: (opacity = 1) => `rgba(75, 199, 226, ${opacity})`, 
            labelColor: () => '#777',
          }}
          style={{ marginVertical: 10, borderRadius: 16 }}
          bezier
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
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
    marginTop: 4,
  },
  highlight: {
    color: '#4BC7E2', 
    fontWeight: '700',
  },
  stepCount: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    marginTop: 12,
  },
  stepGoal: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#777',
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  chartTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  tabActive: {
    backgroundColor: '#4BC7E2', 
  },
  tabText: {
    color: '#777',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
