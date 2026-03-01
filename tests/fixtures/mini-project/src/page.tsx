/**
 * Test fixture — minimal page with intentional accessibility issues.
 */
export default function Page() {
  return (
    <div>
      <h1>Home</h1>
      <img src="/hero.jpg" />
      <a href="/about"></a>
      <iframe src="https://example.com" />
      <h3>Skipped heading level</h3>
    </div>
  );
}
