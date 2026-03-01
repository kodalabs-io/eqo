import type { Translations } from "./types.js";

const enUS: Translations = {
  themes: {
    1: "Images",
    2: "Frames",
    3: "Colors",
    4: "Multimedia",
    5: "Tables",
    6: "Links",
    7: "Scripts",
    8: "Mandatory Elements",
    9: "Structure",
    10: "Presentation",
    11: "Forms",
    12: "Navigation",
    13: "Consultation",
  },

  criteria: {
    "1.1": "Does each informative image have a text alternative?",
    "1.2": "Is each decorative image correctly ignored by assistive technologies?",
    "1.3": "For each informative image with a text alternative, is the alternative relevant?",
    "1.4":
      "For each image used as a CAPTCHA or test, is the text alternative describing its nature and function?",
    "1.5":
      "For each CAPTCHA image, is there an alternative access method that does not rely on visual identification?",
    "1.6": "Does each informative image have a detailed description if necessary?",
    "1.7": "For each image with a detailed description, is the description relevant?",
    "1.8":
      "Does each text image carrying information have the same information in styled text (when no replacement mechanism exists)?",
    "1.9": "Is each image caption correctly linked to the corresponding image?",
    "2.1": "Does each frame have a title attribute?",
    "2.2": "For each frame with a title, is the title relevant?",
    "3.1": "Is information not conveyed by color alone?",
    "3.2": "Does the contrast between text color and background meet the minimum required level?",
    "3.3":
      "Does the contrast of user interface components and graphical elements meet the minimum required level?",
    "4.1":
      "Does each pre-recorded time-based media have, if necessary, a text transcript or audio description?",
    "4.2":
      "For each pre-recorded time-based media with a text transcript or audio description, is it relevant?",
    "4.3": "Does each pre-recorded synchronized media have, if necessary, synchronized captions?",
    "4.4":
      "For each pre-recorded synchronized media with synchronized captions, are the captions relevant?",
    "4.5": "Does each pre-recorded time-based media have, if necessary, an audio description?",
    "4.6": "For each pre-recorded time-based media with an audio description, is it relevant?",
    "4.7": "Is each time-based media clearly identifiable?",
    "4.8": "Does each non-time-based media have, if necessary, an alternative?",
    "4.9": "For each non-time-based media with an alternative, is the alternative relevant?",
    "4.10": "Is each automatically triggered sound controllable by the user?",
    "4.11": "Can each time-based media be controlled by the keyboard and any pointing device?",
    "4.12": "Can each non-time-based media be controlled by the keyboard and any pointing device?",
    "4.13": "Is each time-based and non-time-based media compatible with assistive technologies?",
    "5.1": "Does each complex data table have a summary?",
    "5.2": "For each complex data table with a summary, is the summary relevant?",
    "5.3": "For each layout table, does the linearized content remain comprehensible?",
    "5.4": "For each data table with a title, is the title correctly associated with the table?",
    "5.5": "For each data table with a title, is the title relevant?",
    "5.6": "For each data table, are column and row headers properly identified?",
    "5.7": "For each data table, is the appropriate technique used to associate data with headers?",
    "5.8": "Does each layout table refrain from using structural table elements?",
    "6.1": "Is each link explicit?",
    "6.2": "Does each link have a label?",
    "7.1": "Is each script, if necessary, compatible with assistive technologies?",
    "7.2": "For each script with an alternative, is the alternative relevant?",
    "7.3": "Is each script controllable by the keyboard and any pointing device?",
    "7.4": "For each script that triggers a context change, is the user warned?",
    "7.5": "In each web page, are status messages correctly rendered by assistive technologies?",
    "8.1": "Is each web page defined by a document type?",
    "8.2":
      "For each web page, is the generated source code valid according to the specified document type?",
    "8.3": "In each web page, is the default language present?",
    "8.4": "For each web page with a default language, is the language code relevant?",
    "8.5": "Does each web page have a page title?",
    "8.6": "For each web page with a title, is the title relevant?",
    "8.7": "In each web page, is each language change indicated in the source code?",
    "8.8": "In each web page, is each language change code valid and relevant?",
    "8.9": "In each web page, tags must not be used solely for presentational purposes.",
    "8.10": "In each web page, are reading direction changes indicated?",
    "9.1": "In each web page, is information structured through the appropriate use of headings?",
    "9.2": "In each web page, is the document structure coherent?",
    "9.3": "In each web page, is each list correctly structured?",
    "9.4": "In each web page, is each quotation correctly indicated?",
    "10.1": "In the website, are style sheets used to control the presentation of information?",
    "10.2":
      "In each web page, does visible informative content remain present when stylesheets are disabled?",
    "10.3":
      "In each web page, does information remain comprehensible when stylesheets are disabled?",
    "10.4": "In each web page, does text remain legible when text size is increased by 200%?",
    "10.5": "In each web page, are background and foreground color declarations present together?",
    "10.6":
      "In each web page, is each link whose nature is not obvious visually distinguishable from surrounding text?",
    "10.7":
      "In each web page, is focus visibility ensured for each element receiving keyboard focus?",
    "10.8":
      "For each web page, are hidden contents intended to be ignored by assistive technologies?",
    "10.9":
      "In each web page, information must not be conveyed solely by shape, size, or position.",
    "10.10": "In each web page, information must not be given by shape or size alone.",
    "10.11":
      "For each web page, can contents be presented without horizontal scrolling when viewport is 320 CSS pixels wide?",
    "10.12":
      "In each web page, can text spacing properties be adjusted without loss of content or functionality?",
    "10.13":
      "In each web page, are additional contents appearing on keyboard focus or pointer hover dismissible, hoverable, and persistent?",
    "10.14": "In each web page, are additional contents triggered via CSS visible to all users?",
    "11.1": "Does each form field have a label?",
    "11.2": "Is each label associated with a form field relevant?",
    "11.3": "In each form, is each label associated with a field visible?",
    "11.4": "In each form, are labels and their associated fields adjacent?",
    "11.5": "In each form, are fields of the same nature grouped together when necessary?",
    "11.6": "In each form, does each group of fields of the same nature have a legend?",
    "11.7": "In each form, is each legend associated with a group of fields relevant?",
    "11.8": "In each form, are options of the same nature in a choice list grouped?",
    "11.9": "In each form, is each button label relevant?",
    "11.10": "In each form, is input validation used appropriately?",
    "11.11": "In each form, is input validation accompanied by suggestions when needed?",
    "11.12":
      "For each form that modifies or deletes data, or transmits answers to a test, can the user verify, correct, and confirm the data before submission?",
    "11.13": "Can the purpose of a form input field be determined to facilitate autocomplete?",
    "12.1": "Does each set of pages have at least two navigation systems?",
    "12.2": "In each set of pages, are the navigation menu and navigation bars consistent?",
    "12.3": "Is the site map page relevant?",
    "12.4": "In each set of pages, is the site map accessible from any page?",
    "12.5": "In each set of pages, is the search engine accessible from any page?",
    "12.6":
      "Are grouping areas of content present on multiple web pages identifiable with HTML structural elements?",
    "12.7":
      "In each web page, is a skip link or quick access link to the main content area present?",
    "12.8": "In each web page, is the tab order coherent?",
    "12.9": "In each web page, does navigation not contain a keyboard trap?",
    "12.10":
      "In each web page, do keyboard shortcuts using a single character key meet requirements?",
    "12.11":
      "In each web page, are additional contents appearing on hover, focus, or interaction controllable?",
    "13.1": "For each web page, does the user have control over each time limit?",
    "13.2": "In each web page, must the opening of a new window not be triggered automatically?",
    "13.3":
      "In each web page, does each downloadable office document have, if necessary, an accessible version?",
    "13.4":
      "For each downloadable document with an accessible version, is this version up to date?",
    "13.5": "In each web page, does each cryptic content have an alternative?",
    "13.6": "In each web page, is each cryptic content alternative visible?",
    "13.7": "In each web page, are sudden brightness changes or flash effects controlled?",
    "13.8": "In each web page, is each moving or blinking content controllable by the user?",
    "13.9":
      "In each web page, can the proposed content be consulted regardless of screen orientation?",
    "13.10":
      "In each web page, are multi-point or path-based gestures operable with a single pointer?",
    "13.11": "In each web page, can actions triggered by a pointing device be cancelled?",
    "13.12":
      "In each web page, can functionalities using device motion be operated with user interface components?",
  },

  tests: {
    "1.1.1": 'Each informative <img> or role="img" element has a text alternative',
    "1.1.2": "Each informative <area> element has a text alternative",
    "1.1.3": 'Each <input type="image"> element has a text alternative',
    "1.1.5": 'Each informative <svg role="img"> has an accessible name',
    "1.1.6": 'Each informative <object type="image/..."> has a text alternative',
    "1.1.7": 'Each informative <embed type="image/..."> has a text alternative',
    "1.1.8": "Each informative <canvas> has a text alternative",
    "1.2.1": 'Each decorative <img> has alt="" and no other text alternative attribute',
    "1.2.4": 'Each decorative <svg> has aria-hidden="true" and no text alternative',
    "1.9.1": "Each image caption is linked to the image via <figure> and <figcaption>",
    "2.1.1": "Each <iframe> has a title attribute",
    "2.2.1": "Each <iframe> title is non-empty and relevant",
    "5.4.1": "Each data table title is associated via <caption> or aria-labelledby",
    "5.6.1": "Each column header uses <th> or appropriate role",
    "5.6.2": 'Each row header uses <th> with scope="row" or appropriate role',
    "5.8.1": "Layout tables do not use <th>, <caption>, or headers attributes",
    "6.2.1": "Each link has a non-empty accessible name",
    "8.1.1": "Each page has a DOCTYPE declaration",
    "8.2.1": "No duplicate id attributes exist on the same page",
    "8.3.1": "The <html> element has a lang attribute",
    "8.4.1": "The lang attribute value is a valid BCP 47 language code",
    "8.5.1": "Each page has a <title> element",
    "8.6.1": "Each page <title> is non-empty",
    "8.9.1": "Presentational tags (b, i, u, blink, marquee) are not used for pure styling",
    "9.1.1": "Headings are present on the page",
    "9.1.2": "Heading levels are not skipped",
    "9.1.3": "Only one <h1> exists per page",
    "9.3.1": "<ul>, <ol>, and <dl> are correctly structured",
    "11.1.1": "Each <input> has an associated <label> or ARIA label",
    "11.1.2": "Each <textarea> has an associated <label> or ARIA label",
    "11.1.3": "Each <select> has an associated <label> or ARIA label",
    "11.6.1": "Each <fieldset> has a <legend>",
    "11.6.2": 'Each group with role="group" or role="radiogroup" has aria-labelledby or aria-label',
    "11.9.1": "Each <button> has a non-empty accessible name",
    "11.9.2": 'Each <input type="submit"> and <input type="button"> has a non-empty value',
    "11.13.1": "Form inputs with personal data have an appropriate autocomplete attribute",
    "12.6.1": "Main landmark regions use <header>, <nav>, <main>, <footer> or role equivalents",
    "12.7.1": "A skip link to the main content is present and functional",
    "12.9.1": "Keyboard navigation does not create a focus trap",
  },

  issues: {
    "img.missing-alt": "Image is missing a text alternative (alt attribute)",
    "img.missing-alt-on-role-img":
      'Element with role="img" is missing an accessible name (aria-label or aria-labelledby)',
    "img.empty-alt-missing": "Informative image has no text alternative",
    "img.input-image-missing-alt":
      '<input type="image"> is missing a text alternative (alt attribute)',
    "img.svg-missing-accessible-name": '<svg role="img"> is missing an accessible name',
    "img.decorative-has-alt":
      'Decorative image should have alt="" (empty) and no other text alternative',
    "img.decorative-svg-not-hidden": 'Decorative <svg> must have aria-hidden="true"',
    "img.figcaption-not-in-figure": "<figcaption> must be a direct child of <figure>",
    "img.figure-missing-img": "<figure> containing a <figcaption> should also contain an image",
    "frame.missing-title": "<iframe> is missing a title attribute",
    "frame.empty-title": "<iframe> has an empty title attribute",
    "table.missing-caption": "Data table is missing a <caption> or accessible name",
    "table.th-missing-scope": "<th> is missing a scope attribute",
    "table.layout-has-th": 'Layout table (role="presentation") contains <th> element',
    "table.layout-has-caption": 'Layout table (role="presentation") contains a <caption> element',
    "link.missing-label":
      "Link has no accessible name (no text content, aria-label, or aria-labelledby)",
    "link.empty-label": "Link has an empty accessible name",
    "html.missing-lang": "<html> element is missing a lang attribute",
    "html.empty-lang": "<html> element has an empty lang attribute",
    "html.invalid-lang": "Invalid language code on <html> element: {lang}",
    "html.missing-title": "Page is missing a <title> element",
    "html.empty-title": "Page <title> is empty",
    "html.presentational-tag": "<{tag}> used for purely presentational purposes",
    "html.duplicate-id": 'Duplicate id="{id}" found on the page',
    "heading.skipped-level": "Heading level skipped: <h{from}> followed by <h{to}>",
    "heading.multiple-h1": "Multiple <h1> elements found on the same page",
    "heading.no-headings": "No headings found on the page",
    "list.invalid-child": "<{parent}> contains an invalid direct child <{child}> (expected <li>)",
    "list.item-outside-list": "<li> is not a child of <ul> or <ol>",
    "form.missing-label":
      "<{tag}> is missing an accessible label (no <label>, aria-label, or aria-labelledby)",
    "form.fieldset-missing-legend": "<fieldset> is missing a <legend> element",
    "form.group-missing-label": 'Element with role="{role}" is missing an accessible name',
    "form.button-missing-label": "<button> is missing an accessible name",
    "form.submit-empty-value": '<input type="{type}"> is missing a value attribute',
    "form.missing-autocomplete":
      'Form field collecting "{purpose}" data is missing an autocomplete attribute',
    "a11y.color-contrast": "Insufficient color contrast ratio: {ratio} (required: {required})",
    "a11y.focus-not-visible": "Element does not have a visible focus indicator",
    "a11y.keyboard-trap": "Keyboard focus is trapped inside this element",
    "a11y.missing-skip-link": "No skip navigation link found",
    "a11y.missing-landmark": 'Page is missing main landmark region (<main> or role="main")',
    "a11y.status-message-missing-role":
      'Status message container is missing aria-live or role="status"',
  },

  remediation: {
    "img.missing-alt": 'Add alt="Description of the image" or alt="" if the image is decorative',
    "img.missing-alt-on-role-img":
      'Add aria-label="Description" or aria-labelledby pointing to a visible text element',
    "img.input-image-missing-alt":
      'Add alt="Button action description" to describe the button purpose',
    "img.svg-missing-accessible-name": "Add <title> inside the SVG or aria-label on the element",
    "img.decorative-has-alt":
      'Set alt="" and remove title, aria-label, and aria-labelledby attributes',
    "img.decorative-svg-not-hidden": 'Add aria-hidden="true" to the <svg> element',
    "frame.missing-title": 'Add a title attribute: <iframe title="Frame description">',
    "frame.empty-title": "Provide a meaningful, non-empty title describing the frame content",
    "table.missing-caption": "Add <caption>Table title</caption> as the first child of <table>",
    "table.th-missing-scope": 'Add scope="col" for column headers or scope="row" for row headers',
    "table.layout-has-th": 'Replace <th> with <td> in layout tables, or remove role="presentation"',
    "link.missing-label":
      "Add visible text content, an aria-label attribute, or use aria-labelledby",
    "html.missing-lang": '<html lang="en"> (or your page language code)',
    "html.invalid-lang": "Use a valid BCP 47 language code (e.g., en, fr, en-US, fr-FR)",
    "html.missing-title": "Add a <title>Page title — Site name</title> in the <head>",
    "html.empty-title": "Provide a descriptive page title",
    "html.presentational-tag": "Use CSS for styling instead of presentational HTML elements",
    "html.duplicate-id": "Ensure each id attribute is unique within the page",
    "heading.skipped-level": "Maintain a logical heading hierarchy without skipping levels",
    "heading.multiple-h1": "Use only one <h1> per page to identify the main topic",
    "heading.no-headings": "Add headings to structure your page content",
    "list.invalid-child": "Use only <li> as direct children of <ul> and <ol>",
    "form.missing-label":
      'Use <label for="inputId"> or add aria-label / aria-labelledby to the input',
    "form.fieldset-missing-legend":
      "Add <legend>Group title</legend> as the first child of <fieldset>",
    "form.button-missing-label": "Add text content or an aria-label to the button",
    "form.missing-autocomplete": 'Add autocomplete="{purpose}" to help users fill in personal data',
    "a11y.color-contrast":
      "Adjust text or background color to achieve a minimum 4.5:1 contrast ratio (3:1 for large text)",
    "a11y.focus-not-visible":
      "Ensure :focus styles are not removed (outline: none is not allowed without a custom indicator)",
    "a11y.missing-skip-link":
      'Add <a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>',
    "a11y.missing-landmark": 'Wrap the main content in a <main> element or add role="main"',
  },

  automationLevel: {
    full: "Fully automated",
    partial: "Partially automated",
    manual: "Requires manual review",
  },

  criterionStatus: {
    validated: "Validated",
    invalidated: "Invalidated",
    "not-applicable": "Not applicable",
    "needs-review": "Needs review",
  },

  severity: {
    error: "Error",
    warning: "Warning",
    notice: "Notice",
  },

  report: {
    title: "RGAA v4.1.2 Accessibility Report",
    generated: "Generated",
    project: "Project",
    pages: "Pages analyzed",
    summary: "Summary",
    totalCriteria: "Total criteria",
    applicable: "Applicable",
    validated: "Validated",
    invalidated: "Invalidated",
    notApplicable: "Not applicable",
    needsReview: "Needs review",
    complianceRate: "Compliance rate",
    themes: "Themes",
    issues: "Issues",
    noIssues: "No issues found",
    file: "File",
    line: "Line",
    element: "Element",
    page: "Page",
    criterion: "Criterion",
    test: "Test",
    severity: "Severity",
    remediation: "How to fix",
    automationDisclaimer:
      "Note: This report covers only automatically verifiable criteria. " +
      "Criteria marked as 'Needs review' require manual inspection. " +
      "The compliance rate reflects automated checks only.",
  },

  cli: {
    analyzing: "Analyzing RGAA v4.1.2 compliance…",
    staticPhase: "Static analysis (source files)",
    runtimePhase: "Runtime analysis (rendered pages)",
    reportWritten: "Report written to {path}",
    done: "Analysis complete",
    failed: "Analysis failed",
    thresholdExceeded: "Compliance rate {rate}% is below the required threshold of {threshold}%",
    noConfig: "No configuration file found. Run `eqo init` to create one.",
    configCreated: "Configuration file created at {path}",
  },
};

export default enUS;
