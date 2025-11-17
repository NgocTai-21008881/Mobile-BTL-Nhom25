import React, { useState, useEffect } from "react";
import AppNavigator from "./navigation/AppNavigator";
import { supabase } from "./lib/supabase";

export default function App() {
  const [state, setState] = useState<"launch" | "loading" | "signin" | "home">(
    "launch"
  );

  useEffect(() => {
    // Check authentication status on app load
    (async () => {
      setState("loading");
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setState("home");
        } else {
          setState("signin");
        }
      } catch (error) {
        console.error("Auth error:", error);
        setState("signin");
      }
    })();
  }, []);

  return <AppNavigator state={state} setState={setState} />;
}