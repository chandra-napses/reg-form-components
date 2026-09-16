/*
Suitability section — AAW-130.

Loaded at runtime by a registration form via dynamic import(). Two rules govern
this file and both are load-bearing:

1. No imports. The published form bundle resolves bare specifiers through a
   host-populated registry that a separately-imported module has no access to,
   so anything imported here would reach the browser's own resolver and throw.
   Every dependency arrives as an argument instead.

2. The default export is a factory over React, not a component. Built with the
   classic JSX transform, so `React.createElement` binds to the parameter below
   rather than to a global that may not be set when this module evaluates.

The owning form keeps the zod schema for `suitability`, including the
`additionalInvestments` array shape and its max of 17. Field values are
extracted from the schema at publish time, before this module is ever fetched,
so a field defined here alone would not be validated server-side.

The additional-investments list is driven by a react-hook-form `useFieldArray`.
Hooks must run inside the form's own React, so the form creates the array and
passes the result in; this module only renders it.
*/

/**
 * What this section renders, checked by the form against its own schema before
 * mounting. `additionalInvestments` is the array field itself - its rows are
 * revealed only when `anyOtherInvestmentsIndicator` is Yes.
 */
export const fields = [
  'riskExposure',
  'investmentObjectives',
  'timeHorizon',
  'liquidityNeeds',
  'annualExpensesRecurring',
  'anyOtherInvestmentsIndicator',
  'additionalInvestments',
];

export default function create(React) {
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
    maxInvestments = 17,
  }) {
    const {
      Card,
      CardHeader,
      CardTitle,
      CardContent,
      Separator,
      Button,
    } = ui;
    // Each list defaults to empty: a host that has not published one yet
    // renders an empty control instead of throwing and taking the form down.
    const {
      RISK_EXPOSURE_LEVELS = [],
      INVESTMENT_OBJECTIVES = [],
      LIQUIDITY_NEEDS = [],
      ANNUAL_EXPENSE_RANGES = [],
      ADDITIONAL_INVESTMENT_TYPES = [],
    } = codeLists ?? {};
    const { entryHeading, entryName, tomorrowIso } = helpers ?? {};

    const anyOtherInvestments = watch('suitability.anyOtherInvestmentsIndicator');
    const rows = investmentsArray?.fields ?? [];

    return (
      <Card id="suitability" style={{ scrollMarginTop: '9rem' }}>
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold tracking-tight">
            Suitability
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <SelectField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.riskExposure"
              label="Risk exposure"
              options={RISK_EXPOSURE_LEVELS}
            />
            <SelectField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.investmentObjectives"
              label="Investment Objective"
              options={INVESTMENT_OBJECTIVES}
            />
            <DateField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.timeHorizon"
              label="Time horizon"
              min={tomorrowIso ? tomorrowIso() : undefined}
            />
            <SelectField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.liquidityNeeds"
              label="Liquidity needs"
              options={LIQUIDITY_NEEDS}
            />
            <SelectField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.annualExpensesRecurring"
              label="Annual expenses (Recurring)"
              options={ANNUAL_EXPENSE_RANGES}
            />
          </div>

          <Separator />

          <RadioYesNoField
            form={form}
            hostErrors={hostErrors}
            locked={locked}
            path="suitability.anyOtherInvestmentsIndicator"
            label="Are there any other investments?"
          />

          {anyOtherInvestments === 'Yes' && (
            <div className="flex flex-col gap-4">
              {rows.map((field, index) => {
                const investment = watch(
                  `suitability.additionalInvestments.${index}.investment`,
                );
                return (
                  <EntryCard
                    key={field.id}
                    {...(entryHeading
                      ? entryHeading(
                          entryName(investment),
                          `Investment ${index + 1}`,
                        )
                      : { title: `Investment ${index + 1}` })}
                    onRemove={
                      readOnly
                        ? undefined
                        : () => investmentsArray.remove(index)
                    }
                  >
                    <SelectField
                      form={form}
                      hostErrors={hostErrors}
                      locked={locked}
                      path={`suitability.additionalInvestments.${index}.investment`}
                      label="Investment"
                      options={ADDITIONAL_INVESTMENT_TYPES}
                    />
                    <MoneyField
                      form={form}
                      hostErrors={hostErrors}
                      locked={locked}
                      path={`suitability.additionalInvestments.${index}.value`}
                      label="Value"
                    />
                    {investment === 'Other' && (
                      <TextAreaField
                        form={form}
                        hostErrors={hostErrors}
                        locked={locked}
                        path={`suitability.additionalInvestments.${index}.investmentDescription`}
                        label="Investment description"
                      />
                    )}
                  </EntryCard>
                );
              })}
              {!readOnly && rows.length < maxInvestments && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() =>
                    investmentsArray.append({
                      investment: '',
                      investmentDescription: '',
                      value: undefined,
                    })
                  }
                >
                  Add investment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
}
