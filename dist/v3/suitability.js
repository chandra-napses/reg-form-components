// src/sections/suitability.jsx
var fields = [
  "investmentObjective",
  "riskTolerance",
  "timeHorizon",
  "liquidityNeeds",
  "investmentExperience",
  "annualIncome",
  "netWorth",
  "liquidNetWorth",
  "taxBracket",
  "sourceOfFunds",
  "suitabilityNotes"
];
function create(React) {
  return function Suitability({
    form,
    watch,
    hostErrors,
    locked,
    ui,
    SelectField,
    TextAreaField,
    codeLists
  }) {
    const {
      Card,
      CardHeader,
      CardTitle,
      CardContent,
      Label,
      RadioGroup,
      RadioGroupItem
    } = ui;
    const {
      INVESTMENT_OBJECTIVES = [],
      RISK_TOLERANCES = [],
      TIME_HORIZONS = [],
      LIQUIDITY_NEEDS = [],
      INVESTMENT_EXPERIENCE_LEVELS = [],
      ANNUAL_INCOME_RANGES = [],
      NET_WORTH_RANGES = [],
      LIQUID_NET_WORTH_RANGES = [],
      TAX_BRACKETS = [],
      SOURCE_OF_FUNDS = []
    } = codeLists;
    return /* @__PURE__ */ React.createElement(Card, { id: "suitability", style: { scrollMarginTop: "9rem" } }, /* @__PURE__ */ React.createElement(CardHeader, { className: "border-b" }, /* @__PURE__ */ React.createElement(CardTitle, { className: "text-base font-semibold tracking-tight" }, "Suitability")), /* @__PURE__ */ React.createElement(CardContent, { className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.investmentObjective",
        label: "Investment objective",
        options: INVESTMENT_OBJECTIVES
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(Label, null, "Risk tolerance"), /* @__PURE__ */ React.createElement(
      RadioGroup,
      {
        value: watch("suitability.riskTolerance"),
        onValueChange: (v) => form.setValue("suitability.riskTolerance", v, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }),
        disabled: locked,
        className: "flex flex-row flex-wrap gap-4"
      },
      RISK_TOLERANCES.map((option) => /* @__PURE__ */ React.createElement("div", { key: option, className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
        RadioGroupItem,
        {
          value: option,
          id: `riskTolerance-${option}`
        }
      ), /* @__PURE__ */ React.createElement(
        Label,
        {
          htmlFor: `riskTolerance-${option}`,
          className: "cursor-pointer text-sm font-normal"
        },
        option
      )))
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2" }, /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.timeHorizon",
        label: "Time horizon",
        options: TIME_HORIZONS
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.liquidityNeeds",
        label: "Liquidity needs",
        options: LIQUIDITY_NEEDS
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.investmentExperience",
        label: "Investment experience",
        options: INVESTMENT_EXPERIENCE_LEVELS
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.sourceOfFunds",
        label: "Source of funds",
        options: SOURCE_OF_FUNDS
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(Label, { className: "text-sm font-medium" }, "Financial profile"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2" }, /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.annualIncome",
        label: "Annual income",
        options: ANNUAL_INCOME_RANGES
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.netWorth",
        label: "Net worth",
        options: NET_WORTH_RANGES
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.liquidNetWorth",
        label: "Liquid net worth",
        options: LIQUID_NET_WORTH_RANGES
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.taxBracket",
        label: "Tax bracket",
        options: TAX_BRACKETS
      }
    ))), /* @__PURE__ */ React.createElement(
      TextAreaField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.suitabilityNotes",
        label: "Suitability notes"
      }
    )));
  };
}
export {
  create as default,
  fields
};
