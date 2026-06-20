const baseUrl = "http://localhost:3001";
const cookieJar = new Map();

function updateCookies(response) {
  const raw = response.headers.raw?.();
  const setCookieHeaders =
    raw?.["set-cookie"] || response.headers.get("set-cookie");
  if (!setCookieHeaders) return;
  const cookies = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : String(setCookieHeaders).split(/, (?=[^\s]+=)/);
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
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }
  const response = await fetch(url, {
    ...options,
    headers,
    redirect: "manual",
  });
  updateCookies(response);
  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch (err) {
    // ignore
  }
  return { response, body };
}

(async () => {
  try {
    console.log("1) Fetch CSRF token...");
    const csrfResp = await request("/api/auth/csrf");
    console.log(csrfResp.response.status, csrfResp.body);
    const csrfToken = csrfResp.body?.csrfToken;
    if (!csrfToken) throw new Error("Missing CSRF token");

    const email = `testuser+${Date.now()}@example.com`;
    const password = "TestPass123!";
    const name = "Test User";

    console.log("2) Register new user...");
    const registerResp = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    console.log(registerResp.response.status, registerResp.body);
    if (registerResp.response.status !== 201)
      throw new Error("Registration failed");

    console.log("3) Sign in with credentials...");
    const formData = new URLSearchParams();
    formData.set("csrfToken", csrfToken);
    formData.set("callbackUrl", "/");
    formData.set("json", "true");
    formData.set("email", email);
    formData.set("password", password);

    const signinResp = await request("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    console.log(signinResp.response.status, signinResp.body);
    if (signinResp.response.status !== 200 || signinResp.body?.error) {
      throw new Error(`Sign in failed: ${JSON.stringify(signinResp.body)}`);
    }

    console.log("4) Verify session...");
    const sessionResp = await request("/api/auth/session");
    console.log(sessionResp.response.status, sessionResp.body);
    if (!sessionResp.body?.user?.email)
      throw new Error("Session not established");

    console.log("5) Create workout...");
    const workoutData = {
      title: "Test Workout",
      description: "Full body test",
      date: new Date().toISOString(),
      duration: 45,
      repetitions: 10,
    };
    const createWorkoutResp = await request("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workoutData),
    });
    console.log(createWorkoutResp.response.status, createWorkoutResp.body);
    if (createWorkoutResp.response.status !== 201)
      throw new Error("Workout creation failed");
    const workoutId = createWorkoutResp.body?.id;

    console.log("6) Fetch workouts...");
    const workoutsResp = await request("/api/workouts");
    console.log(workoutsResp.response.status, workoutsResp.body);
    if (!Array.isArray(workoutsResp.body) || workoutsResp.body.length === 0) {
      throw new Error("Workout list missing");
    }

    console.log("7) Mark workout complete...");
    const updateWorkoutResp = await request("/api/workouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: workoutId, completed: true }),
    });
    console.log(updateWorkoutResp.response.status, updateWorkoutResp.body);
    if (updateWorkoutResp.body?.completed !== true) {
      throw new Error("Workout completion failed");
    }

    console.log("8) Fetch goals before save...");
    const goalsBeforeResp = await request("/api/goals");
    console.log(goalsBeforeResp.response.status, goalsBeforeResp.body);

    console.log("9) Save goals...");
    const saveGoalsResp = await request("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveGoals",
        weeklyTarget: 5,
        monthlyTarget: 20,
      }),
    });
    console.log(saveGoalsResp.response.status, saveGoalsResp.body);
    if (!saveGoalsResp.body?.success) throw new Error("Saving goals failed");

    console.log("10) Fetch goals after save...");
    const goalsAfterResp = await request("/api/goals");
    console.log(goalsAfterResp.response.status, goalsAfterResp.body);
    if (
      !Array.isArray(goalsAfterResp.body?.goals) ||
      goalsAfterResp.body.goals.length === 0
    ) {
      throw new Error("Goals retrieval failed");
    }

    console.log("11) Delete workout...");
    const deleteWorkoutResp = await request(
      `/api/workouts?id=${encodeURIComponent(workoutId)}`,
      {
        method: "DELETE",
      },
    );
    console.log(deleteWorkoutResp.response.status, deleteWorkoutResp.body);
    if (!deleteWorkoutResp.body?.success)
      throw new Error("Deleting workout failed");

    console.log("12) Fetch workouts after delete...");
    const workoutsAfterDeleteResp = await request("/api/workouts");
    console.log(
      workoutsAfterDeleteResp.response.status,
      workoutsAfterDeleteResp.body,
    );
    console.log("End-to-end test complete.");
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
})();
