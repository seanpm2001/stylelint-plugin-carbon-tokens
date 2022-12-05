/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule, { messages, ruleName } from "..";

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptValues: ["/((--)|[$])my-value-accept/", "*"]
    }
  ],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { color: none; }",
      description: "Accept reset using none"
    },
    {
      code: ".foo { color: inherit; }",
      description: "Accept reset using inherit"
    },
    {
      code: ".foo { color: initial; }",
      description: "Accept reset using initial"
    },
    {
      code: ".foo { color: unset; }",
      description: "Accept reset using unset"
    },
    {
      code: ".foo { color: transparent; }",
      description: "Accept using transparent"
    },
    {
      code: ".foo { color: $layer-01; }",
      description: "Carbon theme token expected."
    },
    {
      code: ".foo { box-shadow: 0 0 5px $layer-01, 0 0 10px $layer-02; }",
      description: "All color tokens in split are Carbon theme tokens."
    },
    {
      code: "$my-value-accept: $layer-01; .foo { color: $my-value-accept; }",
      description:
        "Accept $variable declared before use with Carbon theme tokens."
    },
    {
      code: ":root {--my-value-accept: $layer-01;} .foo { color: var(--my-value-accept); }",
      description:
        "Accept --variable declared before use with Carbon theme tokens."
    },
    {
      code: "$block: 'block'; :root {--block-value-accept: $layer-01;} .foo { color: var(--#{$block}-value-accept); }",
      description:
        "Accept --#{block}-variable declared before use with Carbon theme tokens. Cheats on custom property declaration"
    },
    // {
    //   // TODO: fix this - fails to even get into
    //   code: "$block: 'block'; :root {--#{$block}__value-accept: $layer-01;} .foo { color: var(--#{$block}__value-accept); }",
    //   description:
    //     "Accept --#{block}-variable declared before use with Carbon theme tokens."
    // },
    {
      code: ".foo { box-shadow: $layout-01 $layout-01 $layer-01; }",
      description:
        "Position one and two can can be non color variables three of three matches"
    },
    {
      code: ".foo { box-shadow: 0 0 $layout-01 $layer-01; }",
      description:
        "Position three of four can can be non color variables four of four matches"
    },
    {
      code: ".foo { border: 1px solid get-light-value('layer-01'); }",
      description: "Permitted function get-light-value passes"
    },
    {
      code: ".foo { color: $my-value-accept; }",
      description: "Accept undeclared $variable of defined format"
    },
    {
      code: ".foo { color: var(--my-value-accept); }",
      description: "Reject undeclared --variable by of defined format."
    }
  ],

  reject: [
    {
      code: ".foo { background-color: #f4f4f4; }",
      description: "Used #color instead of Carbon theme token expected.",
      message: messages.expected
    },
    {
      code: ".foo { box-shadow: 0 0 5px $layer-01, 0 0 10px #fefefe; }",
      description: "Used #color in a split property not Carbon theme tokens.",
      message: messages.expected
    },
    {
      code: ".foo { border: 1px solid my-value-fun($layer-01); }",
      description: "Other functions should fail my-value-fn fails"
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonColorTokens: true,
      acceptIBMColorTokensCarbonV10Only: true
    }
  ],
  accept: [],
  reject: [
    {
      code: ".foo { background-color: $carbon--blue-90; }",
      description:
        "Reject using a carbon color token without v10 testOnlyVersion",
      message: messages.expected
    },
    {
      code: ".foo { background-color: $ibm-color__blue-90; }",
      description: "Reject using a ibm color token without v10 testOnlyVersion",
      message: messages.expected
    }
  ]
});

// // verify use of v10 carbon color tokens
testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonColorTokens: true,
      carbonPath: "node_modules/@carbon",
      carbonModulePostfix: "-10"
    }
  ],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { background-color: $carbon--blue-90; }",
      description: "Accept using a carbon color token"
    },
    {
      code: ".foo { background-color: $hover-selected-ui; }",
      description: "Accept using a carbon hoverSelectedUI token"
    }
  ],
  reject: [
    {
      code: ".foo { background-color: $ibm-color__blue-80; }",
      description: "Reject using a ibm color token",
      message: messages.expected
    }
  ]
});

// verify use of v10 carbon color tokens
testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptIBMColorTokensCarbonV10Only: true,
      carbonPath: "node_modules/@carbon",
      carbonModulePostfix: "-10"
    }
  ],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { background-color: $ibm-color__blue-90; }",
      description: "Accept using a ibm color token"
    }
  ],
  reject: [
    // an ibm color token
    {
      code: ".foo { background-color: $carbon--blue-90; }",
      description: "Reject using a carbon color token",
      message: messages.expected
    }
  ]
});

// verify use of v10 theme tokens
testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptIBMColorTokensCarbonV10Only: true,
      carbonPath: "node_modules/@carbon",
      carbonModulePostfix: "-10"
    }
  ],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { background-color: $ui-01; }",
      description: "Accept v10 theme token in v10 test"
    }
  ],
  reject: [
    // an ibm color token
    {
      code: ".foo { background-color: $layer-01; }",
      description: "Reject v11 theme token in v10 test",
      message: messages.expected
    }
  ]
});

// verify rejection of undeclared variables
testRule(rule, {
  ruleName,
  config: [true],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: "$my-value-accept: $layer-01; .foo { color: $my-value-accept; }",
      description:
        "Accept $variable declared before use when acceptUndefinedVariables is false."
    },
    {
      code: "--my-value-accept: $layer-01; .foo { color: var(--my-value-accept); }",
      description:
        "Accept --variable declared before use when acceptUndefinedVariables is false."
    }
  ],

  reject: [
    // an ibm color token
    {
      code: ".foo { color: $my-value-reject; }",
      description:
        "Reject undeclared $variable  when acceptUndefinedVariables is false.",
      message: messages.expected
    },
    {
      code: ".foo { color: var(--my-value-reject); }",
      description:
        "Reject undeclared --variable when acceptUndefinedVariables is false.",
      message: messages.expected
    }
  ]
});

// verify use of rgba with carbon theme token
testRule(rule, {
  ruleName,
  config: true,
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { background-color: rgba($layer-01, 0.5); }",
      description: "Accept using a carbon theme token with rgba()",
      message: messages.expected
    }
  ],

  reject: [
    // an ibm color token
    {
      code: ".foo { background-color: rgba(100, 100, 255, 0.5); }",
      description: "Reject using a non-carbon theme token with rgba()",
      message: messages.expected
    }
  ]
});

// verify use of full and stroke with carbon theme token
testRule(rule, {
  ruleName,
  config: true,
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { fill: $layer-01; }",
      description: "Accept carbon theme token for fill property by default",
      message: messages.expected
    },
    {
      code: ".foo { stroke: $layer-01; }",
      description: "Accept carbon theme token for stroke property by default",
      message: messages.expected
    }
  ],
  reject: [
    {
      code: ".foo { fill: #fefefe; }",
      description: "Reject non-carbon theme token for fill property by default",
      message: messages.expected
    },
    {
      code: ".foo { stroke: red; }",
      description:
        "Reject non-carbon theme token for stroke property by default",
      message: messages.expected
    }
  ]
});

// accept currentColor can be used as a value
testRule(rule, {
  ruleName,
  config: true,
  customSyntax: "postcss-scss",
  accept: [
    {
      code: ".foo { fill: currentColor; }",
      description: "Accept currentColor on the assumption color is valid",
      message: messages.expected
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      includeProps: ["/\\$.*do-check.*$/", "*"]
    }
  ],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: "$do-check-me: $layer-01;",
      description: "Should check '$do-check-me' using a carbon theme token"
    },
    {
      code: "$also-do-check-me-too: $layer-01;",
      description:
        "Should check '$also-do-check-me-too' using a carbon theme token"
    },
    {
      code: "$do-not-check-me-too: $layer-01;",
      description: "Should ignore '$do-not-check-me' using a carbon theme token"
    }
  ],
  reject: [
    {
      code: "$do-check-me: red;",
      description: "Should check '$do-check-me` not using a carbon theme token'"
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptValues: ["/((--)|[$])my-value-accept/", "*"]
    }
  ],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `
@use '@carbon/theme';

.foo {
  background-color: theme.$layer-01;
};
`,
      description: "Should accept scoped theme token"
    },
    {
      code: `
@use '@carbon/theme' as my_scope;

.foo {
  background-color: my_scope.$layer-01;
};
`,
      description: "Should accept named scoped theme token"
    },
    {
      code: `
@use 'carbon-components/scss/globals/scss/_vars.scss';

.foo {
  background-color: vars.$layer-01;
};
`,
      description: "Should accept named scoped theme token from vars"
    },
    {
      code: `
@use 'carbon-components/scss/globals/scss/_vars.scss' as carbon_vars;

.foo {
  background-color: carbon_vars.$layer-01;
};
`,
      description: "Should accept named scoped theme token from vars"
    }
  ],
  reject: [
    {
      code: "background-color: other.$layer-01;",
      description: "Should reject unrecognized scoped theme token"
    }
  ]
});

// Scope tests
testRule(rule, {
  ruleName,
  config: true,
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: theme.$layer-01; }`,
      description: "Accept theme scope."
    },
    {
      code: `.foo { color: get-light-value(theme.$layer-01)}`,
      description: "Accept theme scope in function."
    }
  ],
  reject: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Reject scope 'th' without acceptScopes setting."
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ["th"] }],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Accept scope 'th' with acceptScopes setting."
    },
    {
      code: `.foo { color: get-light-value(th.$layer-01)}`,
      description: "Accept scope 'th' with acceptScopes setting in function."
    }
  ],
  reject: [
    {
      code: `.foo { color: theme.$layer-01; }`,
      description: "Reject theme scope with scope setting."
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ["th", "*"] }],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Accept scope 'th' with acceptScopes setting."
    },
    {
      code: `.foo { color: get-light-value(th.$layer-01)}`,
      description: "Accept scope 'th' with acceptScopes setting in function."
    },
    {
      code: `.foo { color: theme.$layer-01; }`,
      description: "Accept theme scope with scope setting including default."
    },
    {
      code: `.foo { color: get-light-value(theme.$layer-01)}`,
      description:
        "Accept theme scope in function with scope setting including default."
    }
  ],
  reject: [
    {
      code: `.foo { color: reject.$layer-01; }`,
      description: "Reject scope not included in scope setting."
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ["/^th(eme)?$/"] }],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Accept scope 'th' with acceptScopes regex setting."
    },
    {
      code: `.foo { color: get-light-value(th.$layer-01)}`,
      description:
        "Accept scope 'th' with acceptScopes regex setting in function."
    },
    {
      code: `.foo { color: theme.$layer-01; }`,
      description:
        "Accept theme scope with scope regex setting including default."
    },
    {
      code: `.foo { color: get-light-value(theme.$layer-01)}`,
      description:
        "Accept theme scope in function with scope regex setting including default."
    }
  ],
  reject: [
    {
      code: `.foo { color: reject.$layer-01; }`,
      description: "Reject scope not included in scope regex setting."
    }
  ]
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ["**"] }],
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: abc.$layer-01; border-color: zyx.$layer-01; }`,
      description: "All scopes ['**']."
    }
  ]
});

testRule(rule, {
  ruleName,
  config: true,
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: $button-danger-primary; }`,
      description: "Accept theme token button danger primary."
    },
    {
      code: `.foo { color: theme.$button-danger-primary; }`,
      description: "Accept theme token button danger primary with theme."
    }
  ]
});

// test v10 to 11 updated fixes
testRule(rule, {
  ruleName,
  config: true,
  customSyntax: "postcss-scss",
  fix: true,
  reject: [
    {
      code: ".foo { color: $active-danger; }",
      description: "Reject v10 theme token $active-danger",
      fixed: ".foo { color: $button-danger-active; }"
    },
    {
      code: ".foo { color: $danger; }",
      description: "Reject v10 theme token $danger",
      fixed: ".foo { color: $button-danger-primary; }"
    },
    {
      code: ".foo { color: $hover-row; }",
      description: "Reject v10 theme token $hover-row",
      fixed: ".foo { color: $layer-hover-01; }"
    },
    {
      code: ".foo { border-color: $decorative-01; }",
      description: "Reject v10 theme token $decorative-01",
      fixed: ".foo { border-color: $border-subtle-02; }"
    },
    {
      code: ".foo { color: $active-ui; }",
      description: "Reject v10 theme token $active-ui and fix color",
      fixed: ".foo { color: $layer-active-01; }"
    },
    {
      code: ".foo { background-color: $active-ui; }",
      description: "Reject v10 theme token $active-ui and fix background-color",
      fixed: ".foo { background-color: $background-active; }"
    },
    {
      code: ".foo { color: $disabled-02; }",
      description: "Reject v10 theme token $disabled-02 and fix color",
      fixed: ".foo { color: $text-disabled; }"
    },
    {
      code: ".foo { box-shadow: 2px 2px 10px 10px $disabled-02; }",
      description: "Reject v10 theme token $disabled-02 and fix box-shadow",
      fixed: ".foo { box-shadow: 2px 2px 10px 10px $border-disabled; }"
    },
    {
      code: ".foo { border: 2px 2px 10px 10px solid $disabled-02; }",
      description: "Reject v10 theme token $disabled-02 and fix border",
      fixed: ".foo { border: 2px 2px 10px 10px solid $border-disabled; }"
    },
    {
      code: ".foo { outline: 2px $disabled-02; }",
      description: "Reject v10 theme token $disabled-02 and fix outline",
      fixed: ".foo { outline: 2px $border-disabled; }"
    },
    {
      code: "@use '@carbon/theme'; .foo { color: $active-danger; }",
      description: "Reject v10 theme token $active-danger but fix with scope",
      fixed:
        "@use '@carbon/theme'; .foo { color: theme.$button-danger-active; }"
    },
    {
      code: "@use '@carbon/theme' as carbon_theme; .foo { color: $active-danger; }",
      description:
        "Reject v10 theme token $active-danger but fix with carbon_theme scope",
      fixed:
        "@use '@carbon/theme' as carbon_theme; .foo { color: carbon_theme.$button-danger-active; }"
    },
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as carbon_theme; .foo { color: $active-danger; }",
      description:
        "Reject v10 theme token $active-danger but fix with carbon_theme scope ignoring other scopes",
      fixed:
        "@use '@carbon/layout'; @use '@carbon/theme' as carbon_theme; .foo { color: carbon_theme.$button-danger-active; }"
    }
  ]
});

// test v10 to 11 updated fixes preferring context
// NOTE: Does not appear to currently be exported or well defined
// ^^^^^
// testRule(rule, {
//   ruleName,
//   config: [true, { preferContextFixes: true }],
//   customSyntax: "postcss-scss",
//   fix: true,
//   reject: [
//     {
//       code: ".foo { border-color: $decorative-01; }",
//       description: "Reject v10 theme token $decorative-01 preferring context",
//       fixed: ".foo { border-color: $border-subtle; }"
//     }
//   ]
// });

testRule(rule, {
  ruleName,
  config: {
    carbonPath: "node_modules/@carbon",
    carbonModulePostfix: "-11-4"
  },
  customSyntax: "postcss-scss",
  accept: [
    {
      code: `.foo { color: $button-danger-primary; }`,
      description:
        "Accept theme token button danger primary in 11-4 pre unstable_metadata."
    },
    {
      code: `.foo { color: theme.$button-danger-primary; }`,
      description:
        "Accept theme token button danger primary with theme. in 11-4 pre unstable_metadata."
    }
  ]
});
