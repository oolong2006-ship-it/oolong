"use client";

import { useApp } from "@/context/AppContext";
import WelcomeScreen from "./WelcomeScreen";
import OnboardingFlow from "./OnboardingFlow";
import AppShell from "./AppShell";

/** Top-level stage router for the single-page Waleef experience. */
export default function WaleefApp() {
  const { stage } = useApp();

  switch (stage) {
    case "onboarding":
      return <OnboardingFlow />;
    case "app":
      return <AppShell />;
    case "welcome":
    default:
      return <WelcomeScreen />;
  }
}
