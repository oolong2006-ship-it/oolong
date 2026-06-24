"use client";

import { useApp } from "@/context/AppContext";
import WelcomeScreen from "./WelcomeScreen";
import OnboardingFlow from "./OnboardingFlow";
import ChatScreen from "./ChatScreen";

/** Top-level screen router for the single-page Waleef experience. */
export default function WaleefApp() {
  const { screen } = useApp();

  switch (screen) {
    case "onboarding":
      return <OnboardingFlow />;
    case "chat":
      return <ChatScreen />;
    case "welcome":
    default:
      return <WelcomeScreen />;
  }
}
