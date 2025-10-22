import { useState, useEffect } from 'react';

// 1. Define an interface for the shape of our location state
interface WindowLocationState {
  pathname: string;
  search: string;
  hash: string;
  href: string;
}

/**
 * A custom hook that returns the current window location object 
 * and re-renders the component when the URL changes.
 * @returns {WindowLocationState} The current location object.
 */
export const useWindowLocation = (): WindowLocationState => {
  // 2. Use the interface to type the state
  const [location, setLocation] = useState<WindowLocationState>({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    href: window.location.href,
  });

  useEffect(() => {
    // This handler will be called on 'popstate' or our custom 'locationchange' event
    const handleLocationChange = (): void => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        href: window.location.href,
      });
    };

    // Listen for the browser's back/forward navigation
    window.addEventListener('popstate', handleLocationChange);

    // Listen for our custom event that we'll dispatch on programmatic navigation
    window.addEventListener('locationchange', handleLocationChange);

    // Clean up the event listeners on component unmount
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return location;
};


/**
 * A helper function to programmatically navigate and trigger the useWindowLocation hook's update.
 * Use this function instead of `window.history.pushState`.
 * @param {string} url - The new URL to navigate to (e.g., '/about').
 */
export const push = (url: string): void => {
  // Use the native History API to change the URL in the browser
  window.history.pushState({}, '', url);
  // Dispatch a custom event to notify the hook that the location has changed
  window.dispatchEvent(new Event('locationchange'));
};