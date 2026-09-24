// The storefront is a separate deployment; build absolute links to it.
export const storeUrl = (path = "/") =>
  (process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000").replace(/\/$/, "") + path;
