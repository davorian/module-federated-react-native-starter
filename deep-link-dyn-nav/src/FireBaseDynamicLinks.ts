import dynamicLinks from "@react-native-firebase/dynamic-links";
import { DeepLinkGenerator, LinkingDataDescriptor } from './useDeepLinkingProvider'

const firebaseDeepLinkGenerator: DeepLinkGenerator = async (screen, params) => {
  try {
    const firebaseLink = await dynamicLinks().buildShortLink({
      link: `https://myapp.com/${screen}?${new URLSearchParams(params).toString()}`,
      domainUriPrefix: "https://yourapp.page.link",
      android: { packageName: "com.yourapp" },
      ios: { bundleId: "com.yourapp.ios" },
    });
    return firebaseLink;
  } catch (error) {
    console.error("Failed to generate Firebase Dynamic Link:", error);
    return `https://myapp.com/${screen}?${new URLSearchParams(params).toString()}`;
  }
};

const firebaseDataDescriptor: LinkingDataDescriptor = {
  initialize: (callback) => dynamicLinks().onLink(( link) => callback(link.url)),
};
