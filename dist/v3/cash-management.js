// src/sections/cash-management.jsx
var fields = [
  "cashManagementSweep",
  "sweepType",
  "redeemSequence",
  "sweepInstructions"
];
function create(React) {
  return function CashManagement({
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
      CASH_MANAGEMENT_SWEEPS = [],
      SWEEP_TYPES = [],
      REDEEM_SEQUENCES = []
    } = codeLists;
    return /* @__PURE__ */ React.createElement(Card, { id: "cash-management", style: { scrollMarginTop: "9rem" } }, /* @__PURE__ */ React.createElement(CardHeader, { className: "border-b" }, /* @__PURE__ */ React.createElement(CardTitle, { className: "text-base font-semibold tracking-tight" }, "Cash Management")), /* @__PURE__ */ React.createElement(CardContent, { className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "cashManagement.cashManagementSweep",
        label: "Cash management sweep",
        options: CASH_MANAGEMENT_SWEEPS
      }
    ), /* @__PURE__ */ React.createElement(
      SelectField,
      {
        form,
        hostErrors,
        locked,
        path: "cashManagement.sweepType",
        label: "Sweep type",
        options: SWEEP_TYPES
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(Label, null, "Redeem Sequence"), /* @__PURE__ */ React.createElement(
      RadioGroup,
      {
        value: watch("cashManagement.redeemSequence"),
        onValueChange: (v) => form.setValue("cashManagement.redeemSequence", v, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        }),
        disabled: true,
        className: "flex flex-row gap-4"
      },
      REDEEM_SEQUENCES.map((option) => /* @__PURE__ */ React.createElement("div", { key: option, className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
        RadioGroupItem,
        {
          value: option,
          id: `redeemSequence-${option}`
        }
      ), /* @__PURE__ */ React.createElement(
        Label,
        {
          htmlFor: `redeemSequence-${option}`,
          className: "cursor-pointer text-sm font-normal"
        },
        option
      )))
    )), /* @__PURE__ */ React.createElement(
      TextAreaField,
      {
        form,
        hostErrors,
        locked,
        path: "cashManagement.sweepInstructions",
        label: "Sweep instructions"
      }
    )));
  };
}
export {
  create as default,
  fields
};
