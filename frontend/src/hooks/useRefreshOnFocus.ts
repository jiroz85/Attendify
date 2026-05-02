import { useEffect } from "react";

type Options = {
  enabled?: boolean;
};

export function useRefreshOnFocus(
  refresh: () => void | Promise<void>,
  options: Options = {},
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    function onFocus() {
      refresh();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, refresh]);
}
