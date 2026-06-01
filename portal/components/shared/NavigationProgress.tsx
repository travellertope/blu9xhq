"use client";
import { AppProgressBar } from "next-nprogress-bar";

export default function NavigationProgress() {
  return (
    <AppProgressBar
      height="3px"
      color="#1875F2"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
