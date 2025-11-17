import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  const [state, setState] = useState(null);

  return (
    <NavigationContainer>
      <AppNavigator state={state} setState={setState} />
    </NavigationContainer>
  );
}