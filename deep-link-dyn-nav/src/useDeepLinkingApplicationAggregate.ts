import useLinkingAggregate from './use_linking_aggregate';

/**
 * Deep Linking Use Cases mapped to specific methods and parameters
 */
type DeepLinkingUseCases = {
  deepLinkFromAnotherApp: (screen: string, params?: Record<string, string>) => Promise<void>;
  openFromQRCode: (screen: string, params?: Record<string, string>) => Promise<void>;
  openFromPushNotification: (screen: string, params?: Record<string, string>) => Promise<void>;
  privateAppToAppCommunication: (screen: string, params?: Record<string, string>) => Promise<void>;
  openWithoutInternet: (screen: string, params?: Record<string, string>) => Promise<void>;
  ensureLegacySupport: (screen: string, params?: Record<string, string>) => Promise<void>;
  openFromWebsite: (screen: string, params?: Record<string, string>) => Promise<void>;
  shareAcrossPlatforms: (screen: string, params?: Record<string, string>) => Promise<void>;
  optimizeForSEO: (screen: string, params?: Record<string, string>) => Promise<void>;
};

const useDeepLinkingApplication = (): DeepLinkingUseCases => {
  const linking = useLinkingAggregate();

  const deepLinkFromAnotherApp = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "custom"));
  };

  const openFromQRCode = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "custom"));
  };

  const openFromPushNotification = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "custom"));
  };

  const privateAppToAppCommunication = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "custom"));
  };

  const openWithoutInternet = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "custom"));
  };

  const ensureLegacySupport = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "custom"));
  };

  const openFromWebsite = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "universal"));
  };

  const shareAcrossPlatforms = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "universal"));
  };

  const optimizeForSEO = async (screen: string, params: Record<string, string> = {}) => {
    await linking.openExternalLink(linking.generateDeepLink(screen, params, "universal"));
  };

  return {
    deepLinkFromAnotherApp,
    openFromQRCode,
    openFromPushNotification,
    privateAppToAppCommunication,
    openWithoutInternet,
    ensureLegacySupport,
    openFromWebsite,
    shareAcrossPlatforms,
    optimizeForSEO,
  };
};

export useDeepLinkingApplication;
