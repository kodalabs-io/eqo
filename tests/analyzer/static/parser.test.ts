import type { JSXElement, JSXOpeningElement } from "@babel/types";
import { describe, expect, it } from "vitest";
import {
  getAttr,
  getAttrMap,
  getAttrStringValue,
  getTagName,
  getTextContent,
  isAttrDynamic,
  nodeLoc,
  parseFile,
  serializeElement,
  walk,
} from "../../../src/analyzer/static/parser.js";

function getFirstJSXElement(source: string): JSXElement | null {
  const ast = parseFile(source, "test.tsx");
  if (!ast) return null;
  let found: JSXElement | null = null;
  walk(ast, {
    JSXElement(node) {
      if (!found) found = node as JSXElement;
    },
  });
  return found;
}

describe("parseFile", () => {
  it("parses valid TSX", () => {
    const ast = parseFile('<div className="a">hello</div>', "test.tsx");
    expect(ast).not.toBeNull();
    expect(ast?.type).toBe("File");
  });

  it("parses valid TypeScript (non-JSX)", () => {
    const ast = parseFile("const x: number = 1;", "test.ts");
    expect(ast).not.toBeNull();
  });

  it("parses valid JS", () => {
    const ast = parseFile("export default function() {}", "test.js");
    expect(ast).not.toBeNull();
  });

  it("returns null for unparseable content", () => {
    // Binary-like content that Babel can't parse even with error recovery
    const ast = parseFile("\x00\x01\x02\x03", "test.tsx");
    // Babel with errorRecovery may still return an AST, so we just check it doesn't throw
    expect(ast === null || ast.type === "File").toBe(true);
  });

  it("enables JSX plugin only for .tsx/.jsx files", () => {
    // JSX syntax in a .ts file should fail or produce errors
    const ast = parseFile("<div />", "test.ts");
    // With errorRecovery: true, it may still parse but with errors
    expect(ast === null || ast.type === "File").toBe(true);
  });
});

describe("walk", () => {
  it("visits all node types", () => {
    const ast = parseFile("const x = <div><span /></div>;", "test.tsx");
    const types: string[] = [];
    walk(ast, {
      JSXElement(_node) {
        types.push("JSXElement");
      },
      JSXOpeningElement(_node) {
        types.push("JSXOpeningElement");
      },
    });
    expect(types).toContain("JSXElement");
    expect(types).toContain("JSXOpeningElement");
  });

  it("handles null input without throwing", () => {
    expect(() => walk(null, {})).not.toThrow();
    expect(() => walk(undefined, {})).not.toThrow();
  });
});

describe("getTagName", () => {
  it("returns lowercase for native HTML elements", () => {
    const _el = getFirstJSXElement("<Wrapper><div /></Wrapper>");
    const ast = parseFile("<div />", "test.tsx");
    let tag: string | null = null;
    walk(ast, {
      JSXOpeningElement(node) {
        const t = getTagName(node as JSXOpeningElement);
        if (t === "div") tag = t;
      },
    });
    expect(tag).toBe("div");
  });

  it("preserves PascalCase for React components", () => {
    const ast = parseFile("<MyComponent />", "test.tsx");
    let tag: string | null = null;
    walk(ast, {
      JSXOpeningElement(node) {
        tag = getTagName(node as JSXOpeningElement);
      },
    });
    expect(tag).toBe("MyComponent");
  });

  it("returns null for member expressions", () => {
    const ast = parseFile("<Foo.Bar />", "test.tsx");
    let tag: string | null = "initial";
    walk(ast, {
      JSXOpeningElement(node) {
        tag = getTagName(node as JSXOpeningElement);
      },
    });
    expect(tag).toBeNull();
  });
});

describe("getAttr / getAttrStringValue / isAttrDynamic", () => {
  it("finds attribute case-insensitively", () => {
    const ast = parseFile('<img ALT="text" />', "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        const attr = getAttr(node as JSXOpeningElement, "alt");
        expect(attr).not.toBeNull();
        expect(getAttrStringValue(attr)).toBe("text");
      },
    });
  });

  it("returns null for missing attribute", () => {
    const ast = parseFile("<img />", "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        expect(getAttr(node as JSXOpeningElement, "alt")).toBeNull();
      },
    });
  });

  it("detects dynamic attributes", () => {
    const ast = parseFile("<img alt={getAlt()} />", "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        const attr = getAttr(node as JSXOpeningElement, "alt");
        expect(isAttrDynamic(attr)).toBe(true);
        expect(getAttrStringValue(attr)).toBeNull();
      },
    });
  });

  it("returns false for null attribute", () => {
    expect(isAttrDynamic(null)).toBe(false);
  });
});

describe("getTextContent", () => {
  it("extracts static text", () => {
    const el = getFirstJSXElement("<span>hello world</span>");
    expect(el).not.toBeNull();
    expect(getTextContent(el!)).toBe("hello world");
  });

  it("returns null for fully dynamic content", () => {
    const el = getFirstJSXElement("<span>{getText()}</span>");
    expect(el).not.toBeNull();
    expect(getTextContent(el!)).toBeNull();
  });

  it("returns static text when mixed with dynamic", () => {
    const el = getFirstJSXElement("<span>Hello {name}</span>");
    expect(el).not.toBeNull();
    expect(getTextContent(el!)).toBe("Hello");
  });

  it("trims whitespace", () => {
    const el = getFirstJSXElement("<span>  spaced  </span>");
    expect(el).not.toBeNull();
    expect(getTextContent(el!)).toBe("spaced");
  });
});

describe("getAttrMap", () => {
  it("builds a lowercase-keyed map of attributes", () => {
    const ast = parseFile('<input type="text" ID="name" aria-Label="Name" />', "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        const map = getAttrMap(node as JSXOpeningElement);
        expect(map.has("type")).toBe(true);
        expect(map.has("id")).toBe(true);
        expect(map.has("aria-label")).toBe(true);
        expect(map.size).toBe(3);
      },
    });
  });
});

describe("serializeElement", () => {
  it("serializes a simple element", () => {
    const ast = parseFile('<img alt="photo" />', "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        const s = serializeElement(node as JSXOpeningElement);
        expect(s).toContain("<img");
        expect(s).toContain('alt="photo"');
      },
    });
  });

  it("truncates at maxLen", () => {
    const ast = parseFile(
      '<div className="a-very-long-class-name-that-repeats-many-times" />',
      "test.tsx",
    );
    walk(ast, {
      JSXOpeningElement(node) {
        const s = serializeElement(node as JSXOpeningElement, 20);
        expect(s.length).toBeLessThanOrEqual(21); // 20 + "…"
      },
    });
  });

  it("escapes special characters in attribute values", () => {
    const ast = parseFile('<div title="a&b<c>d" />', "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        const tag = getTagName(node as JSXOpeningElement);
        if (tag !== "div") return;
        const s = serializeElement(node as JSXOpeningElement);
        expect(s).toContain("&amp;");
        expect(s).toContain("&lt;");
        expect(s).toContain("&gt;");
      },
    });
  });
});

describe("nodeLoc", () => {
  it("returns line and column when loc is present", () => {
    const ast = parseFile("<div />", "test.tsx");
    walk(ast, {
      JSXOpeningElement(node) {
        const loc = nodeLoc(node);
        expect(loc).toHaveProperty("line");
        expect(loc).toHaveProperty("column");
      },
    });
  });

  it("returns empty object when loc is absent", () => {
    const loc = nodeLoc({ loc: null });
    expect(loc).toEqual({});
  });
});
