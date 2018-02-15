// @flow
import defineType, {
  assertEach,
  assertNodeType,
  assertValueType,
  chain,
} from "./utils";
import { classMethodOrPropertyCommon } from "./es2015";
import { functionCommon } from "./core";

defineType("AwaitExpression", {
  builder: ["argument"],
  visitor: ["argument"],
  aliases: ["Expression", "Terminatorless"],
  fields: {
    argument: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("BindExpression", {
  visitor: ["object", "callee"],
  aliases: ["Expression"],
  fields: {
    // todo
  },
});

defineType("ClassProperty", {
  visitor: ["key", "value", "typeAnnotation", "decorators"],
  builder: ["key", "value", "typeAnnotation", "decorators", "computed"],
  aliases: ["Property"],
  fields: {
    ...classMethodOrPropertyCommon,
    value: {
      validate: assertNodeType("Expression"),
      optional: true,
    },
    typeAnnotation: {
      validate: assertNodeType("TypeAnnotation", "TSTypeAnnotation", "Noop"),
      optional: true,
    },
    decorators: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("Decorator")),
      ),
      optional: true,
    },
    readonly: {
      validate: assertValueType("boolean"),
      optional: true,
    },
  },
});

defineType("OptionalMemberExpression", {
  builder: ["object", "property", "computed", "optional"],
  visitor: ["object", "property"],
  aliases: ["Expression"],
  fields: {
    object: {
      validate: assertNodeType("Expression"),
    },
    property: {
      validate: (function() {
        const normal = assertNodeType("Identifier");
        const computed = assertNodeType("Expression");

        return function(node, key, val) {
          const validator = node.computed ? computed : normal;
          validator(node, key, val);
        };
      })(),
    },
    computed: {
      default: false,
    },
    optional: {
      validate: assertValueType("boolean"),
    },
  },
});

defineType("OptionalCallExpression", {
  visitor: ["callee", "arguments", "typeParameters"],
  builder: ["callee", "arguments", "optional"],
  aliases: ["Expression"],
  fields: {
    callee: {
      validate: assertNodeType("Expression"),
    },
    arguments: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType("Expression", "SpreadElement", "JSXNamespacedName"),
        ),
      ),
    },
    optional: {
      validate: assertValueType("boolean"),
    },
    typeParameters: {
      validate: assertNodeType(
        "TypeParameterInstantiation",
        "TSTypeParameterInstantiation",
      ),
      optional: true,
    },
  },
});

defineType("Import", {
  aliases: ["Expression"],
});

defineType("Decorator", {
  visitor: ["expression"],
  fields: {
    expression: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("DoExpression", {
  visitor: ["body"],
  aliases: ["Expression"],
  fields: {
    body: {
      validate: assertNodeType("BlockStatement"),
    },
  },
});

defineType("ExportDefaultSpecifier", {
  visitor: ["exported"],
  aliases: ["ModuleSpecifier"],
  fields: {
    exported: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ExportNamespaceSpecifier", {
  visitor: ["exported"],
  aliases: ["ModuleSpecifier"],
  fields: {
    exported: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ProtocolRequiredMethodName", {
  visitor: ["key"],
  builder: ["key"],
  aliases: ["Property"],
  fields: {
    static: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    key: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ProtocolRequiredMethodNameLegacy", {
  visitor: ["key"],
  builder: ["key"],
  aliases: ["Property"],
  fields: {
    static: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    key: {
      validate: assertNodeType("StringLiteral"),
    },
  },
});

defineType("ProtocolProvidedMethod", {
  aliases: ["Function", "Scopable", "BlockParent", "FunctionParent", "Method"],
  builder: ["kind", "key", "params", "body", "static"],
  visitor: ["key", "params", "body"],
  fields: {
    ...functionCommon,
    static: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    body: {
      validate: assertNodeType("BlockStatement"),
    },
    key: {
      validate: chain(
        (function() {
          const normal = assertNodeType(
            "Identifier",
            "StringLiteral",
            "NumericLiteral",
          );
          const computed = assertNodeType("Expression");

          return function(node: Object, key: string, val: any) {
            const validator = node.computed ? computed : normal;
            validator(node, key, val);
          };
        })(),
        assertNodeType(
          "Identifier",
          "StringLiteral",
          "NumericLiteral",
          "Expression",
        ),
      ),
    },
  },
});

defineType("ProtocolBody", {
  visitor: ["body"],
  fields: {
    body: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType(
            "ProtocolRequiredMethodName",
            "ProtocolProvidedMethod",
            "ProtocolRequiredMethodNameLegacy",
          ),
        ),
      ),
    },
  },
});

const protocolCommon = {
  body: {
    validate: assertNodeType("ProtocolBody"),
  },
  superProtocol: {
    optional: true,
    validate: assertNodeType("Expression"),
  },
};

defineType("ProtocolDeclaration", {
  builder: ["id", "superProtocol", "body", "decorators"],
  visitor: ["id", "body", "superProtocol"],
  aliases: ["Scopable", "Protocol", "Statement", "Declaration", "Pureish"],
  fields: {
    ...protocolCommon,
    declare: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    id: {
      validate: assertNodeType("Identifier"),
      optional: true, // Missing if this is the child of an ExportDefaultDeclaration.
    },
  },
});

defineType("ProtocolExpression", {
  inherits: "ProtocolDeclaration",
  aliases: ["Scopable", "Protocol", "Expression", "Pureish"],
  fields: {
    ...protocolCommon,
    id: {
      optional: true,
      validate: assertNodeType("Identifier"),
    },
    body: {
      validate: assertNodeType("ProtocolBody"),
    },
    superProtocol: {
      optional: true,
      validate: assertNodeType("Expression"),
    },
  },
});
