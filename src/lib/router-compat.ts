// Compatibility shim so ported pages from a react-router-dom codebase can
// use a string-style `navigate("/path?x=1")` API on top of TanStack Router.
import { useNavigate as useTanstackNavigate } from "@tanstack/react-router";

type LegacyNavigate = (to: string | number, opts?: { replace?: boolean }) => void;

export function useCompatNavigate(): LegacyNavigate {
  const navigate = useTanstackNavigate();
  return ((to, opts) => {
    if (typeof to === "number") {
      // back/forward
      if (to < 0) window.history.go(to);
      else window.history.go(to);
      return;
    }
    // Split path / search / hash
    const [pathAndSearch, hash] = to.split("#");
    const [pathname, search] = pathAndSearch.split("?");
    const searchObj: Record<string, string> = {};
    if (search) {
      for (const [k, v] of new URLSearchParams(search)) searchObj[k] = v;
    }
    navigate({
      to: pathname,
      search: search ? searchObj : undefined,
      hash: hash || undefined,
      replace: opts?.replace,
    } as never);
  }) as LegacyNavigate;
}
