const baseUrl = "http://localhost:3001";
const cookieJar = new Map();

function updateCookies(response) {
  const setCookieHeader = response.headers.get("set-cookie");
  console.log("set-cookie header raw:", setCookieHeader);
  if (!setCookieHeader) return;
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];
  for (const cookieString of cookies) {
    const [cookiePair] = cookieString.split(";");
    const [name, ...rest] = cookiePair.split("=");
    cookieJar.set(name.trim(), rest.join("=").trim());
  }
}

function getCookieHeader() {
  if (cookieJar.size === 0) return undefined;
  return Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = new Headers(options.headers || {});
  const cookieHeader = getCookieHeader();
  if (cookieHeader) headers.set("cookie", cookieHeader);

  const response = await fetch(url, {
    ...options,
    headers,
    redirect: "manual",
  });
  console.log(`\nREQUEST ${options.method || "GET"} ${url}`);
  console.log("status", response.status);
  console.log("request cookies", cookieHeader);
  response.headers.forEach((value, key) => console.log(key, value));
  updateCookies(response);
  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch (err) {}
  console.log("body", body);
  return { response, body };
}

(async () => {
  const csrf = await request("/api/auth/csrf");
  const csrfToken = csrf.body?.csrfToken;
  const email = `testuser+${Date.now()}@example.com`;
  const password = "TestPass123!";
  const name = "Test User";

  const register = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const signin = await request("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: "http://localhost:3001/",
      json: "true",
      email,
      password,
    }),
  });

  const session = await request("/api/auth/session");
  console.log("final cookies", Array.from(cookieJar.entries()));
})();
