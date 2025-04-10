import { useEffect } from "react";
import { Linking } from "react-native";

/**
 * Defines the interface for deep link generation providers.
 */
export type DeepLinkGenerator = (screen: string, params?: Record<string, string>) => Promise<string>;

/**
 * Defines the interface for deep link event listeners (Firebase, Branch.io, etc.).
 */
export type LinkingDataDescriptor = {
  initialize: (callback: (url: string) => void) => () => void;
};

/**
 * DeepLinkingProvider abstracts deep linking implementations,
 * allowing Firebase, Branch.io, or custom deep linking.
 */
type DeepLinkingProvider = {
  generateDeepLink: (screen: string, params?: Record<string, string>) => Promise<string>;
  openExternalLink: (url: string) => Promise<void>;
  canOpenLink: (url: string) => Promise<boolean>;
  registerDeepLinkListener: (callback: (url: string) => void) => void;
  unregisterDeepLinkListener: () => void;
};

const useDeepLinkingProvider = (
  deepLinkGenerator: DeepLinkGenerator,
  dataDescriptor?: LinkingDataDescriptor
): DeepLinkingProvider => {
  /**
   * Generates a deep link using the injected deep link provider.
   */
  const generateDeepLink = async (screen: string, params: Record<string, string> = {}): Promise<string> => {
    return await deepLinkGenerator(screen, params);
  };

  /**
   * Opens an external deep link.
   */
  const openExternalLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open URL:", url, error);
    }
  };

  /**
   * Checks if the device can open a given deep link.
   */
  const canOpenLink = async (url: string): Promise<boolean> => {
    return await Linking.canOpenURL(url);
  };

  /**
   * Registers deep link listeners for injected providers (Firebase, Branch.io, etc.).
   */
  const registerDeepLinkListener = (callback: (url: string) => void) => {
    useEffect(() => {
      const listener = Linking.addEventListener("url", (event) => {
        callback(event.url);
      });

      let unsubscribeEventListener: (() => void) | undefined;
      if (dataDescriptor) {
        unsubscribeEventListener = dataDescriptor.initialize(callback);
      }

      return () => {
        listener.remove();
        if (unsubscribeEventListener) {
          unsubscribeEventListener();
        }
      };
    }, []);
  };

  /**
   * Unregisters deep link listeners.
   */
  const unregisterDeepLinkListener = () => {
    Linking.removeAllListeners("url");
  };

  return {
    generateDeepLink,
    openExternalLink,
    canOpenLink,
    registerDeepLinkListener,
    unregisterDeepLinkListener,
  };
};

export useDeepLinkingProvider;
