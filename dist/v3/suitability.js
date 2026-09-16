// src/sections/suitability.jsx
var fields = [
  "riskExposure",
  "investmentObjectives",
  "timeHorizon",
  "liquidityNeeds",
  "annualExpensesRecurring",
  "anyOtherInvestmentsIndicator",
  "additionalInvestments"
];
function create(React) {
  return function Suitability({
    form,
    watch,
    hostErrors,
    locked,
    readOnly,
    ui,
    SelectField,
    DateField,
    MoneyField,
    TextAreaField,
    RadioYesNoField,
    EntryCard,
    helpers,
    codeLists,
    investmentsArray,
    maxInvestments = 17
  }) {
    const {
      Card,
      CardHeader,
      CardTitle,
      CardContent,
      Separator,
      Button
    } = ui;
    const {
      RISK_EXPOSURE_LEVELS = [],
      INVESTMENT_OBJECTIVES = [],
      LIQUIDITY_NEEDS = [],
      ANNUAL_EXPENSE_RANGES = [],
      ADDITIONAL_INVESTMENT_TYPES = []
    } = codeLists ?? {};
    const { entryHeading, entryName, tomorrowIso } = helpers ?? {};
    const anyOtherInvestments = watch("suitability.anyOtherInvestmentsIndicator");
    const rows = investmentsArray?.fields ?? [];
    return /* @__PURE__ */ React.createElement(Card, { id: "suitability", style: { scrollMarginTop: "9rem" } }, /* @__PURE__ */ React.createElement(CardHeader, { className: "border-b" }, /* @__PURE__ */ React.createElement(CardTitle, { className: "text-base font-semibold tracking-tight" }, "Suitability")), /* @__PURE__ */ React.createElement(CardContent, { className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.riskExposure",
        label: "Risk exposure",
        options: RISK_EXPOSURE_LEVELS
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.investmentObjectives",
        label: "Investment Objective",
        options: INVESTMENT_OBJECTIVES
      }
    ), /* @__PURE__ */ React.createElement(
      DateField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.timeHorizon",
        label: "Time horizon",
        min: tomorrowIso ? tomorrowIso() : void 0
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
        path: "suitability.annualExpensesRecurring",
        label: "Annual expenses (Recurring)",
        options: ANNUAL_EXPENSE_RANGES
      }
    )), /* @__PURE__ */ React.createElement(Separator, null), /* @__PURE__ */ React.createElement(
      RadioYesNoField,
      {
        form,
        hostErrors,
        locked,
        path: "suitability.anyOtherInvestmentsIndicator",
        label: "Are there any other investments?"
      }
    ), anyOtherInvestments === "Yes" && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-4" }, rows.map((field, index) => {
      const investment = watch(
        `suitability.additionalInvestments.${index}.investment`
      );
      return /* @__PURE__ */ React.createElement(
        EntryCard,
        {
          key: field.id,
          ...entryHeading ? entryHeading(
            entryName(investment),
            `Investment ${index + 1}`
          ) : { title: `Investment ${index + 1}` },
          onRemove: readOnly ? void 0 : () => investmentsArray.remove(index)
        },
        /* @__PURE__ */ React.createElement(
          SelectField,
          {
            form,
            hostErrors,
            locked,
            path: `suitability.additionalInvestments.${index}.investment`,
            label: "Investment",
            options: ADDITIONAL_INVESTMENT_TYPES
          }
        ),
        /* @__PURE__ */ React.createElement(
          MoneyField,
          {
            form,
            hostErrors,
            locked,
            path: `suitability.additionalInvestments.${index}.value`,
            label: "Value"
          }
        ),
        investment === "Other" && /* @__PURE__ */ React.createElement(
          TextAreaField,
          {
            form,
            hostErrors,
            locked,
            path: `suitability.additionalInvestments.${index}.investmentDescription`,
            label: "Investment description"
          }
        )
      );
    }), !readOnly && rows.length < maxInvestments && /* @__PURE__ */ React.createElement(
      Button,
      {
        type: "button",
        variant: "outline",
        className: "w-fit",
        onClick: () => investmentsArray.append({
          investment: "",
          investmentDescription: "",
          value: void 0
        })
      },
      "Add investment"
    ))));
  };
}
export {
  create as default,
  fields
};
