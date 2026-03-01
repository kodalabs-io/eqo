/** @type {import('../../../src/types.js').KodaRGAAConfig} */
export default {
  baseUrl: "http://localhost:3000",
  pages: [{ path: "/", name: "Home" }],
  output: [{ format: "json", path: "./report.json" }],
};
