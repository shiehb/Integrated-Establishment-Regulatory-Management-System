"use client";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * A hook that provides safe navigation using React Router's navigate function.
 */
export function useSafeNavigation() {
  const navigate = useNavigate();

  /**
   * Navigate to a new location safely
   */
  const safeNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return { navigate: safeNavigate };
}
