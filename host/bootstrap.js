// bootstrap.js
async function init() {
  // NOTE: We are *not* including `await __webpack_init_sharing__('default');` initially.
  //       Re.Pack *might* handle this internally.  If you still get the "runtime
  //       not ready" error after trying this, you'll need to investigate
  //       Re.Pack's code/docs to see if there's a different initialization
  //       function you need to call, or if you *do* need __webpack_init_sharing__.

  // Dynamically import the main application entry point.
  const { default: startApp } = await import('./index');
  startApp(); // Call the function we're about to define in index.js
}

init().catch(err => {
  console.error("Error bootstrapping application:", err);
  // In a real app, you'd display a user-friendly error message here,
  // possibly a full-screen error view.
});
