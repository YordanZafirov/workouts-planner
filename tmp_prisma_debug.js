const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
console.log("resolve", require.resolve("@prisma/client"));
console.log("has goal", "goal" in p);
console.log("has workout", "workout" in p);
console.log("goal typeof", typeof p.goal);
console.log("workout typeof", typeof p.workout);
console.log(
  "goal delegate props",
  p.goal ? Object.keys(p.goal).slice(0, 10) : null,
);
console.log(
  "workout delegate props",
  p.workout ? Object.keys(p.workout).slice(0, 10) : null,
);
p.$disconnect()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
