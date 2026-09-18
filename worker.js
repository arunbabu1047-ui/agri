export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isPageRequest = request.method === "GET" && !url.pathname.includes(".");

    if (isPageRequest) {
      const fallbackUrl = new URL("/index.html", request.url);
      return env.ASSETS.fetch(new Request(fallbackUrl, request));
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status === 404 && request.method === "GET") {
      const fallbackUrl = new URL("/index.html", request.url);
      return env.ASSETS.fetch(new Request(fallbackUrl, request));
    }

    return response;
  },
};
