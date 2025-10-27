import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const healthData = [
  {
    id: '1',
    title: 'Double Support Time',
    value: '29.7 %',
    icon: 'clockcircleo',
    color: '#7E4DFF', 
    screen: 'DoubleSupportScreen',
  },
  {
    id: '2',
    title: 'Steps',
    value: '11,875 steps',
    icon: 'foot',
    color: '#4BC7E2', 
    screen: 'AllHealthyStep',
  },
  {
    id: '3',
    title: 'Cycle tracking',
    value: '08 April',
    icon: 'calendar',
    color: '#FF7F00', 
    screen: 'CycleTrackingScreen',
  },
  {
    id: '4',
    title: 'Sleep',
    value: '7 hr 31 min',
    icon: 'bed',
    color: '#9B59B6', 
    screen: 'SleepScreen',
  },
  {
    id: '5',
    title: 'Heart',
    value: '68 BPM',
    icon: 'hearto',
    color: '#E74C3C', 
    screen: 'HeartScreen',
  },
  {
    id: '6',
    title: 'Burned calories',
    value: '850 kcal',
    icon: 'fire',
    color: '#F39C12', 
    screen: 'CaloriesScreen',
  },
  {
    id: '7',
    title: 'Body mass index',
    value: '18.69 BMI',
    icon: 'pushpin',
    color: '#3498DB',
    screen: 'BMIScreen',
  },
];

export default function HealthDataScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Health Data</Text>
      <FlatList
        data={healthData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.cardIcon, { backgroundColor: item.color }]}>
              <AntDesign name={item.icon} size={24} color="#fff" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
            <AntDesign name="right" size={18} color={item.color} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardValue: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
