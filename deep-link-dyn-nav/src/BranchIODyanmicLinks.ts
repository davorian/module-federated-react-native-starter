export const branchDeepLinkGenerator: DeepLinkGenerator = async (screen, params) => {
  const response = await fetch("https://api.branch.io/v1/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branch_key: "your-branch-key",
      data: { screen, ...params },
    }),
  });
  const data = await response.json();
  return data.url;
};

export const branchDataDescriptor: LinkingDataDescriptor = {
  initialize: (callback) => {
    const branch = require("react-native-branch");
    branch.initSession().then(({ params }) => {
      if (params?.$canonical_url) {
        callback(params.$canonical_url);
      }
    });

    return () => console.log("Branch session cleanup (if needed)");
  },
};
