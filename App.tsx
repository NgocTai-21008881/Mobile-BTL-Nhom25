import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

// Screens
import LaunchScreen from './screens/LaunchScreen';
import SignInScreen from './screens/SignInScreen';
import HomeScreen from './screens/HomeScreen';
import AllHealthyScreen from './screens/AllHealthyScreen';
import LoadingScreen from './screens/LoadingScreen';
import AllHealthyStepScreen from './screens/AllHealthyStepScreen';
import DoubleSupportScreen from './screens/DoubleSupportScreen';
import CycleTrackingScreen from './screens/CycleTrackingScreen';
import SleepScreen from './screens/SleepScreen';
import HeartScreen from './screens/HeartScreen';
import CaloriesScreen from './screens/CaloriesScreen';
import BMIScreen from './screens/BMIScreen';

export type RootStackParamList = {
  Launch: undefined;
  Loading: undefined;
  SignIn: undefined;
  Home: undefined;
  AllHealthy: undefined;
  AllHealthyStep: undefined;
  DoubleSupportScreen: undefined;
  CycleTrackingScreen: undefined;
  SleepScreen: undefined;
  HeartScreen: undefined;
  CaloriesScreen: undefined;
  BMIScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log('Error checking user:', error.message);
        setIsLoggedIn(false);
      } else if (data?.user) {
        console.log('User is logged in:', data.user);
        setIsLoggedIn(true);
      }
    };
    checkUser();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Launch'}>
        <Stack.Screen
          name="Launch"
          component={LaunchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: 'Sign In', headerShadowVisible: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            headerShadowVisible: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="AllHealthy"
          component={AllHealthyScreen}
          options={{
            title: 'All Health Data',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="AllHealthyStep"
          component={AllHealthyStepScreen}
          options={{
            title: 'Step Details',
            headerShadowVisible: false,
          }}
        />
        {/* ✅ Các màn hình chi tiết mới thêm */}
        <Stack.Screen name="DoubleSupportScreen" component={DoubleSupportScreen} options={{ title: 'Double Support Time' }} />
        <Stack.Screen name="CycleTrackingScreen" component={CycleTrackingScreen} options={{ title: 'Cycle Tracking' }} />
        <Stack.Screen name="SleepScreen" component={SleepScreen} options={{ title: 'Sleep' }} />
        <Stack.Screen name="HeartScreen" component={HeartScreen} options={{ title: 'Heart Rate' }} />
        <Stack.Screen name="CaloriesScreen" component={CaloriesScreen} options={{ title: 'Calories Burned' }} />
        <Stack.Screen name="BMIScreen" component={BMIScreen} options={{ title: 'BMI' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
