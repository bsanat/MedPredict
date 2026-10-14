import { useEffect, useState } from 'react';

function currentRoute() {
  return window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : window.location.pathname;
}

export function useNavigation(onNavigate: () => void) {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    function updateRoute() {
      // In-page anchors such as the skip link must not change the current screen.
      if (window.location.hash && !window.location.hash.startsWith('#/')) return;
      onNavigate();
      setRoute(currentRoute());
    }
    window.addEventListener('hashchange', updateRoute);
    window.addEventListener('popstate', updateRoute);
    return () => {
      window.removeEventListener('hashchange', updateRoute);
      window.removeEventListener('popstate', updateRoute);
    };
  }, [onNavigate]);

  return route;
}
