import { parse } from "@babel/parser";
import type { File, Node } from "@babel/types";

export type { Node, File };

/**
 * Babel AST VISITOR_KEYS — inlined to avoid bundling the entire @babel/types
 * package in the worker. Only @babel/parser (which is needed at runtime) gets
 * bundled; @babel/types stays a devDependency for type-checking only.
 *
 * Generated from @babel/types v7.29.0.
 * Maps each node type to the property names that contain child AST nodes.
 */
const VISITOR_KEYS: Record<string, readonly string[]> = {
  ArrayExpression: ["elements"],
  AssignmentExpression: ["left", "right"],
  BinaryExpression: ["left", "right"],
  InterpreterDirective: [],
  Directive: ["value"],
  DirectiveLiteral: [],
  BlockStatement: ["directives", "body"],
  BreakStatement: ["label"],
  CallExpression: ["callee", "typeParameters", "typeArguments", "arguments"],
  CatchClause: ["param", "body"],
  ConditionalExpression: ["test", "consequent", "alternate"],
  ContinueStatement: ["label"],
  DebuggerStatement: [],
  DoWhileStatement: ["body", "test"],
  EmptyStatement: [],
  ExpressionStatement: ["expression"],
  File: ["program"],
  ForInStatement: ["left", "right", "body"],
  ForStatement: ["init", "test", "update", "body"],
  FunctionDeclaration: [
    "id",
    "typeParameters",
    "params",
    "predicate",
    "returnType",
    "body",
  ],
  FunctionExpression: [
    "id",
    "typeParameters",
    "params",
    "predicate",
    "returnType",
    "body",
  ],
  Identifier: ["typeAnnotation", "decorators"],
  IfStatement: ["test", "consequent", "alternate"],
  LabeledStatement: ["label", "body"],
  StringLiteral: [],
  NumericLiteral: [],
  NullLiteral: [],
  BooleanLiteral: [],
  RegExpLiteral: [],
  LogicalExpression: ["left", "right"],
  MemberExpression: ["object", "property"],
  NewExpression: ["callee", "typeParameters", "typeArguments", "arguments"],
  Program: ["directives", "body"],
  ObjectExpression: ["properties"],
  ObjectMethod: [
    "decorators",
    "key",
    "typeParameters",
    "params",
    "returnType",
    "body",
  ],
  ObjectProperty: ["decorators", "key", "value"],
  RestElement: ["argument", "typeAnnotation"],
  ReturnStatement: ["argument"],
  SequenceExpression: ["expressions"],
  ParenthesizedExpression: ["expression"],
  SwitchCase: ["test", "consequent"],
  SwitchStatement: ["discriminant", "cases"],
  ThisExpression: [],
  ThrowStatement: ["argument"],
  TryStatement: ["block", "handler", "finalizer"],
  UnaryExpression: ["argument"],
  UpdateExpression: ["argument"],
  VariableDeclaration: ["declarations"],
  VariableDeclarator: ["id", "init"],
  WhileStatement: ["test", "body"],
  WithStatement: ["object", "body"],
  AssignmentPattern: ["left", "right", "decorators"],
  ArrayPattern: ["elements", "typeAnnotation"],
  ArrowFunctionExpression: [
    "typeParameters",
    "params",
    "predicate",
    "returnType",
    "body",
  ],
  ClassBody: ["body"],
  ClassExpression: [
    "decorators",
    "id",
    "typeParameters",
    "superClass",
    "superTypeParameters",
    "mixins",
    "implements",
    "body",
  ],
  ClassDeclaration: [
    "decorators",
    "id",
    "typeParameters",
    "superClass",
    "superTypeParameters",
    "mixins",
    "implements",
    "body",
  ],
  ExportAllDeclaration: ["source", "attributes", "assertions"],
  ExportDefaultDeclaration: ["declaration"],
  ExportNamedDeclaration: [
    "declaration",
    "specifiers",
    "source",
    "attributes",
    "assertions",
  ],
  ExportSpecifier: ["local", "exported"],
  ForOfStatement: ["left", "right", "body"],
  ImportDeclaration: ["specifiers", "source", "attributes", "assertions"],
  ImportDefaultSpecifier: ["local"],
  ImportNamespaceSpecifier: ["local"],
  ImportSpecifier: ["imported", "local"],
  ImportExpression: ["source", "options"],
  MetaProperty: ["meta", "property"],
  ClassMethod: [
    "decorators",
    "key",
    "typeParameters",
    "params",
    "returnType",
    "body",
  ],
  ObjectPattern: ["decorators", "properties", "typeAnnotation"],
  SpreadElement: ["argument"],
  Super: [],
  TaggedTemplateExpression: ["tag", "typeParameters", "quasi"],
  TemplateElement: [],
  TemplateLiteral: ["quasis", "expressions"],
  YieldExpression: ["argument"],
  AwaitExpression: ["argument"],
  Import: [],
  BigIntLiteral: [],
  ExportNamespaceSpecifier: ["exported"],
  OptionalMemberExpression: ["object", "property"],
  OptionalCallExpression: [
    "callee",
    "typeParameters",
    "typeArguments",
    "arguments",
  ],
  ClassProperty: ["decorators", "variance", "key", "typeAnnotation", "value"],
  ClassAccessorProperty: ["decorators", "key", "typeAnnotation", "value"],
  ClassPrivateProperty: [
    "decorators",
    "variance",
    "key",
    "typeAnnotation",
    "value",
  ],
  ClassPrivateMethod: [
    "decorators",
    "key",
    "typeParameters",
    "params",
    "returnType",
    "body",
  ],
  PrivateName: ["id"],
  StaticBlock: ["body"],
  ImportAttribute: ["key", "value"],
  AnyTypeAnnotation: [],
  ArrayTypeAnnotation: ["elementType"],
  BooleanTypeAnnotation: [],
  BooleanLiteralTypeAnnotation: [],
  NullLiteralTypeAnnotation: [],
  ClassImplements: ["id", "typeParameters"],
  DeclareClass: [
    "id",
    "typeParameters",
    "extends",
    "mixins",
    "implements",
    "body",
  ],
  DeclareFunction: ["id", "predicate"],
  DeclareInterface: ["id", "typeParameters", "extends", "body"],
  DeclareModule: ["id", "body"],
  DeclareModuleExports: ["typeAnnotation"],
  DeclareTypeAlias: ["id", "typeParameters", "right"],
  DeclareOpaqueType: ["id", "typeParameters", "supertype"],
  DeclareVariable: ["id"],
  DeclareExportDeclaration: [
    "declaration",
    "specifiers",
    "source",
    "attributes",
  ],
  DeclareExportAllDeclaration: ["source", "attributes"],
  DeclaredPredicate: ["value"],
  ExistsTypeAnnotation: [],
  FunctionTypeAnnotation: [
    "typeParameters",
    "this",
    "params",
    "rest",
    "returnType",
  ],
  FunctionTypeParam: ["name", "typeAnnotation"],
  GenericTypeAnnotation: ["id", "typeParameters"],
  InferredPredicate: [],
  InterfaceExtends: ["id", "typeParameters"],
  InterfaceDeclaration: ["id", "typeParameters", "extends", "body"],
  InterfaceTypeAnnotation: ["extends", "body"],
  IntersectionTypeAnnotation: ["types"],
  MixedTypeAnnotation: [],
  EmptyTypeAnnotation: [],
  NullableTypeAnnotation: ["typeAnnotation"],
  NumberLiteralTypeAnnotation: [],
  NumberTypeAnnotation: [],
  ObjectTypeAnnotation: [
    "properties",
    "indexers",
    "callProperties",
    "internalSlots",
  ],
  ObjectTypeInternalSlot: ["id", "value"],
  ObjectTypeCallProperty: ["value"],
  ObjectTypeIndexer: ["variance", "id", "key", "value"],
  ObjectTypeProperty: ["key", "value", "variance"],
  ObjectTypeSpreadProperty: ["argument"],
  OpaqueType: ["id", "typeParameters", "supertype", "impltype"],
  QualifiedTypeIdentifier: ["qualification", "id"],
  StringLiteralTypeAnnotation: [],
  StringTypeAnnotation: [],
  SymbolTypeAnnotation: [],
  ThisTypeAnnotation: [],
  TupleTypeAnnotation: ["types"],
  TypeofTypeAnnotation: ["argument"],
  TypeAlias: ["id", "typeParameters", "right"],
  TypeAnnotation: ["typeAnnotation"],
  TypeCastExpression: ["expression", "typeAnnotation"],
  TypeParameter: ["bound", "default", "variance"],
  TypeParameterDeclaration: ["params"],
  TypeParameterInstantiation: ["params"],
  UnionTypeAnnotation: ["types"],
  Variance: [],
  VoidTypeAnnotation: [],
  EnumDeclaration: ["id", "body"],
  EnumBooleanBody: ["members"],
  EnumNumberBody: ["members"],
  EnumStringBody: ["members"],
  EnumSymbolBody: ["members"],
  EnumBooleanMember: ["id", "init"],
  EnumNumberMember: ["id", "init"],
  EnumStringMember: ["id", "init"],
  EnumDefaultedMember: ["id"],
  IndexedAccessType: ["objectType", "indexType"],
  OptionalIndexedAccessType: ["objectType", "indexType"],
  JSXAttribute: ["name", "value"],
  JSXClosingElement: ["name"],
  JSXElement: ["openingElement", "children", "closingElement"],
  JSXEmptyExpression: [],
  JSXExpressionContainer: ["expression"],
  JSXSpreadChild: ["expression"],
  JSXIdentifier: [],
  JSXMemberExpression: ["object", "property"],
  JSXNamespacedName: ["namespace", "name"],
  JSXOpeningElement: ["name", "typeParameters", "typeArguments", "attributes"],
  JSXSpreadAttribute: ["argument"],
  JSXText: [],
  JSXFragment: ["openingFragment", "children", "closingFragment"],
  JSXOpeningFragment: [],
  JSXClosingFragment: [],
  Noop: [],
  Placeholder: [],
  V8IntrinsicIdentifier: [],
  ArgumentPlaceholder: [],
  BindExpression: ["object", "callee"],
  Decorator: ["expression"],
  DoExpression: ["body"],
  ExportDefaultSpecifier: ["exported"],
  RecordExpression: ["properties"],
  TupleExpression: ["elements"],
  DecimalLiteral: [],
  ModuleExpression: ["body"],
  TopicReference: [],
  PipelineTopicExpression: ["expression"],
  PipelineBareFunction: ["callee"],
  PipelinePrimaryTopicReference: [],
  VoidPattern: [],
  TSParameterProperty: ["parameter"],
  TSDeclareFunction: ["id", "typeParameters", "params", "returnType"],
  TSDeclareMethod: [
    "decorators",
    "key",
    "typeParameters",
    "params",
    "returnType",
  ],
  TSQualifiedName: ["left", "right"],
  TSCallSignatureDeclaration: [
    "typeParameters",
    "parameters",
    "typeAnnotation",
  ],
  TSConstructSignatureDeclaration: [
    "typeParameters",
    "parameters",
    "typeAnnotation",
  ],
  TSPropertySignature: ["key", "typeAnnotation"],
  TSMethodSignature: ["key", "typeParameters", "parameters", "typeAnnotation"],
  TSIndexSignature: ["parameters", "typeAnnotation"],
  TSAnyKeyword: [],
  TSBooleanKeyword: [],
  TSBigIntKeyword: [],
  TSIntrinsicKeyword: [],
  TSNeverKeyword: [],
  TSNullKeyword: [],
  TSNumberKeyword: [],
  TSObjectKeyword: [],
  TSStringKeyword: [],
  TSSymbolKeyword: [],
  TSUndefinedKeyword: [],
  TSUnknownKeyword: [],
  TSVoidKeyword: [],
  TSThisType: [],
  TSFunctionType: ["typeParameters", "parameters", "typeAnnotation"],
  TSConstructorType: ["typeParameters", "parameters", "typeAnnotation"],
  TSTypeReference: ["typeName", "typeParameters"],
  TSTypePredicate: ["parameterName", "typeAnnotation"],
  TSTypeQuery: ["exprName", "typeParameters"],
  TSTypeLiteral: ["members"],
  TSArrayType: ["elementType"],
  TSTupleType: ["elementTypes"],
  TSOptionalType: ["typeAnnotation"],
  TSRestType: ["typeAnnotation"],
  TSNamedTupleMember: ["label", "elementType"],
  TSUnionType: ["types"],
  TSIntersectionType: ["types"],
  TSConditionalType: ["checkType", "extendsType", "trueType", "falseType"],
  TSInferType: ["typeParameter"],
  TSParenthesizedType: ["typeAnnotation"],
  TSTypeOperator: ["typeAnnotation"],
  TSIndexedAccessType: ["objectType", "indexType"],
  TSMappedType: ["typeParameter", "nameType", "typeAnnotation"],
  TSTemplateLiteralType: ["quasis", "types"],
  TSLiteralType: ["literal"],
  TSExpressionWithTypeArguments: ["expression", "typeParameters"],
  TSInterfaceDeclaration: ["id", "typeParameters", "extends", "body"],
  TSInterfaceBody: ["body"],
  TSTypeAliasDeclaration: ["id", "typeParameters", "typeAnnotation"],
  TSInstantiationExpression: ["expression", "typeParameters"],
  TSAsExpression: ["expression", "typeAnnotation"],
  TSSatisfiesExpression: ["expression", "typeAnnotation"],
  TSTypeAssertion: ["typeAnnotation", "expression"],
  TSEnumBody: ["members"],
  TSEnumDeclaration: ["id", "members"],
  TSEnumMember: ["id", "initializer"],
  TSModuleDeclaration: ["id", "body"],
  TSModuleBlock: ["body"],
  TSImportType: ["argument", "options", "qualifier", "typeParameters"],
  TSImportEqualsDeclaration: ["id", "moduleReference"],
  TSExternalModuleReference: ["expression"],
  TSNonNullExpression: ["expression"],
  TSExportAssignment: ["expression"],
  TSNamespaceExportDeclaration: ["id"],
  TSTypeAnnotation: ["typeAnnotation"],
  TSTypeParameterInstantiation: ["params"],
  TSTypeParameterDeclaration: ["params"],
  TSTypeParameter: ["constraint", "default"],
};

/**
 * Parse a JSX/TSX/JS/TS file into a Babel AST.
 * Returns null if the file cannot be parsed (binary, unsupported syntax, etc.).
 */
export function parseFile(source: string, filePath: string): File | null {
  const isTypeScript = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
  const isJSX = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");

  try {
    return parse(source, {
      sourceType: "module",
      strictMode: false,
      plugins: [
        ...(isTypeScript ? (["typescript"] as const) : []),
        ...(isJSX ? (["jsx"] as const) : []),
        "decorators-legacy",
        "classProperties",
      ],
      errorRecovery: true,
    });
  } catch {
    return null;
  }
}

/**
 * Walk an AST node recursively, calling the visitor for each matching node type.
 * Uses inlined VISITOR_KEYS for precise child-key enumeration without
 * requiring @babel/types at runtime.
 */
export function walk(
  node: Node | null | undefined,
  visitors: Partial<Record<string, (node: Node) => void>>
): void {
  if (!node || typeof node !== "object") return;

  const visitor = visitors[node.type];
  if (visitor) {
    visitor(node);
  }

  const keys = VISITOR_KEYS[node.type];
  if (!keys) return;

  for (const key of keys) {
    const child = (node as unknown as Record<string, unknown>)[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && "type" in item) {
          walk(item as Node, visitors);
        }
      }
    } else if (
      child &&
      typeof child === "object" &&
      "type" in (child as object)
    ) {
      walk(child as Node, visitors);
    }
  }
}

// ─── JSX helpers ─────────────────────────────────────────────────────────────

import type {
  JSXAttribute,
  JSXElement,
  JSXOpeningElement,
  StringLiteral,
} from "@babel/types";

/**
 * Get the tag name of a JSX element.
 * Returns lowercase for native HTML elements (start with a lowercase letter).
 * Returns the original name for React components (PascalCase) to avoid false positives.
 */
export function getTagName(node: JSXOpeningElement): string | null {
  const { name } = node;
  if (name.type === "JSXIdentifier") {
    const raw = name.name;
    // PascalCase or any uppercase-starting name → React component, preserve case
    return /^[a-z]/.test(raw) ? raw.toLowerCase() : raw;
  }
  if (name.type === "JSXMemberExpression") return null; // e.g., <Foo.Bar>
  return null;
}

/**
 * Get a JSX attribute by name, case-insensitive.
 */
export function getAttr(
  node: JSXOpeningElement,
  attrName: string
): JSXAttribute | null {
  const lower = attrName.toLowerCase();
  for (const attr of node.attributes) {
    if (attr.type === "JSXAttribute") {
      const name =
        attr.name.type === "JSXIdentifier"
          ? attr.name.name.toLowerCase()
          : attr.name.name.name.toLowerCase();
      if (name === lower) return attr;
    }
  }
  return null;
}

/**
 * Get the string value of a JSX attribute.
 * Returns null if the value is dynamic (JSX expression) or missing.
 */
export function getAttrStringValue(
  attr: JSXAttribute | null | undefined
): string | null {
  if (!attr?.value) return null;
  if (attr.value.type === "StringLiteral") return attr.value.value;
  // Template literals, expressions → treat as dynamic (we cannot inspect at static time)
  return null;
}

/**
 * Check if a JSX attribute has a dynamic value (expression or spread).
 */
export function isAttrDynamic(attr: JSXAttribute | null): boolean {
  if (!attr) return false;
  return attr.value?.type === "JSXExpressionContainer";
}

/**
 * Get all text content from a JSX element (concatenated, trimmed).
 * Returns null if content is fully dynamic.
 */
export function getTextContent(node: JSXElement): string | null {
  let text = "";
  let hasDynamic = false;

  for (const child of node.children) {
    if (child.type === "JSXText") {
      text += child.value;
    } else if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "StringLiteral") {
        text += (child.expression as StringLiteral).value;
      } else if (child.expression.type !== "JSXEmptyExpression") {
        hasDynamic = true;
      }
    } else if (child.type === "JSXElement") {
      const childText = getTextContent(child);
      if (childText === null) {
        hasDynamic = true;
      } else {
        text += childText;
      }
    }
  }

  if (hasDynamic && text.trim() === "") return null;
  return text.trim();
}

/**
 * Return spread-safe `{ line, column }` from an AST node's location.
 * Returns an empty object when loc is absent, satisfying exactOptionalPropertyTypes.
 */
export function nodeLoc(node: {
  loc?: { start: { line: number; column: number } } | null;
}): { line: number; column: number } | Record<never, never> {
  return node.loc
    ? { line: node.loc.start.line, column: node.loc.start.column }
    : {};
}

/**
 * Build a map of attribute names → JSXAttribute for efficient multi-attribute lookups.
 * Prefer this over multiple getAttr() calls when checking 3+ attributes on the same element.
 */
export function getAttrMap(node: JSXOpeningElement): Map<string, JSXAttribute> {
  const map = new Map<string, JSXAttribute>();
  for (const attr of node.attributes) {
    if (attr.type === "JSXAttribute") {
      const name =
        attr.name.type === "JSXIdentifier"
          ? attr.name.name.toLowerCase()
          : attr.name.name.name.toLowerCase();
      map.set(name, attr);
    }
  }
  return map;
}

/** Maximum character length for serialized element strings in reports. */
export const MAX_ELEMENT_SERIALIZATION_LENGTH = 500;

/**
 * Serialize a JSX opening element to a compact HTML-like string for reporting.
 * Limits attribute count and total output length to prevent oversized report entries.
 */
export function serializeElement(
  node: JSXOpeningElement,
  maxLen = MAX_ELEMENT_SERIALIZATION_LENGTH
): string {
  const tag = getTagName(node) ?? "unknown";
  const attrs = node.attributes
    .filter((a) => a.type === "JSXAttribute")
    .slice(0, 20) // cap attribute count to prevent unbounded output
    .map((a) => {
      const attr = a as JSXAttribute;
      const name =
        attr.name.type === "JSXIdentifier"
          ? attr.name.name
          : attr.name.name.name;
      if (!attr.value) return name;
      if (attr.value.type === "StringLiteral") {
        const escaped = attr.value.value
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `${name}="${escaped}"`;
      }
      return `${name}={…}`;
    })
    .join(" ");
  const result = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
  return result.length > maxLen ? `${result.slice(0, maxLen)}…` : result;
}
