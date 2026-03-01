/**
 * Test fixture — intentionally contains accessibility violations for unit testing.
 * DO NOT use this file as a reference for accessible code.
 */

// ── Violations ────────────────────────────────────────────────────────────────

// 1.1 — missing alt
export const MissingAlt = () => <img src="/hero.jpg" />;

// 1.1 — role="img" without accessible name
export const RoleImgNoLabel = () => <div role="img" />;

// 1.1 — input type="image" without alt
export const InputImageNoAlt = () => <input type="image" src="/submit.png" />;

// 1.2 — decorative SVG not hidden
export const DecorativeSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);

// 2.1 — iframe without title
export const IframeNoTitle = () => <iframe src="https://example.com" />;

// 2.2 — iframe with empty title
export const IframeEmptyTitle = () => <iframe src="https://example.com" title="" />;

// 6.2 — link without label
export const EmptyLink = () => <a href="/about" />;

// 8.9 — presentational tags
export const PresentationalTag = () => <b>Bold text for decoration only</b>;
export const BoldMarquee = () => <marquee>Scrolling text</marquee>;

// 9.1 — heading level skip (h1 → h3)
export const HeadingSkip = () => (
  <div>
    <h1>Main title</h1>
    <h3>Skipped h2</h3>
  </div>
);

// 9.1 — multiple h1
export const MultipleH1 = () => (
  <div>
    <h1>First h1</h1>
    <h1>Second h1</h1>
  </div>
);

// 9.3 — invalid list child
export const InvalidList = () => (
  <ul>
    <li>Valid item</li>
    <div>Invalid child</div>
  </ul>
);

// 11.1 — input without label
export const InputNoLabel = () => <input type="text" name="username" />;

// 11.1 — placeholder is NOT a label
export const InputPlaceholderOnly = () => <input type="text" placeholder="Enter your name" />;

// 11.6 — fieldset without legend
export const FieldsetNoLegend = () => (
  <fieldset>
    <input type="radio" name="choice" value="a" />
    <input type="radio" name="choice" value="b" />
  </fieldset>
);

// 11.9 — button without label
export const EmptyButton = () => <button />;

// 11.13 — email input without autocomplete
export const EmailNoAutocomplete = () => <input type="email" name="email" />;

// ── Correct examples ──────────────────────────────────────────────────────────

export const GoodImg = () => <img src="/hero.jpg" alt="A person standing in a field" />;
export const GoodDecorativeImg = () => <img src="/decoration.svg" alt="" />;
export const GoodIframe = () => <iframe src="https://example.com" title="Example page" />;
export const GoodLink = () => <a href="/about">About us</a>;
export const GoodButton = () => <button>Submit form</button>;
export const GoodInput = () => (
  <>
    <label htmlFor="username">Username</label>
    <input id="username" type="text" name="username" />
  </>
);
export const GoodFieldset = () => (
  <fieldset>
    <legend>Preferred contact method</legend>
    <input type="radio" name="contact" value="email" />
    <input type="radio" name="contact" value="phone" />
  </fieldset>
);
export const GoodEmailInput = () => <input type="email" name="email" autocomplete="email" />;
export const GoodSvgDecorative = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);
export const GoodSvgInformative = () => (
  <svg role="img" aria-label="Upload icon" width="24" height="24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);
