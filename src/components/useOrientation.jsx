// src/hooks/useOrientation.js

import { useState, useEffect } from "react";

export default function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const { innerHeight, innerWidth } = window;

      // Check if height is greater than width and height is around 1330px
      if (innerHeight > innerWidth && innerHeight >= 1300 && innerHeight <= 1360) {
        setIsLandscape(true);
      } else {
        setIsLandscape(false);
      }
    };

    // Initial check on component mount
    checkOrientation();

    // Listen for window resize events
    window.addEventListener("resize", checkOrientation);

    // Clean up the event listener
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  return isLandscape;
}
