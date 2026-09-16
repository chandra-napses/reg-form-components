/*
Suitability section.

Loaded at runtime by a registration form via dynamic import(). The same two
rules that govern cash-management.jsx govern this file:

1. No imports. The published form bundle resolves bare specifiers through a
   host-populated registry that a separately-imported module has no access to,
   so anything imported here would reach the browser's own resolver and throw.
   Every dependency arrives as an argument instead.

2. The default export is a factory over React, not a component. Built with the
   classic JSX transform, so `React.createElement` binds to the parameter below
   rather than to a global that may not be set when this module evaluates.

The owning form keeps the zod schema for `suitability`, and the code lists this
section reads are expected on the host's `codeLists`:

  INVESTMENT_OBJECTIVES, RISK_TOLERANCES, TIME_HORIZONS, LIQUIDITY_NEEDS,
  INVESTMENT_EXPERIENCE_LEVELS, ANNUAL_INCOME_RANGES, NET_WORTH_RANGES,
  LIQUID_NET_WORTH_RANGES, TAX_BRACKETS, SOURCE_OF_FUNDS

Each destructures to an empty list if the host has not published it yet. A
missing list then renders an empty control instead of throwing inside the
radio group's map and taking the whole form down with it.
*/

/**
 * What this section renders, checked by the form against its own schema before
 * mounting.
 */
export const fields = [
  'investmentObjective',
  'riskTolerance',
  'timeHorizon',
  'liquidityNeeds',
  'investmentExperience',
  'annualIncome',
  'netWorth',
  'liquidNetWorth',
  'taxBracket',
  'sourceOfFunds',
  'suitabilityNotes',
];

export default function create(React) {
  return function Suitability({
    form,
    watch,
    hostErrors,
    locked,
    ui,
    SelectField,
    TextAreaField,
    codeLists,
  }) {
    const {
      Card,
      CardHeader,
      CardTitle,
      CardContent,
      Label,
      RadioGroup,
      RadioGroupItem,
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
      SOURCE_OF_FUNDS = [],
    } = codeLists;

    return (
      <Card id="suitability" style={{ scrollMarginTop: '9rem' }}>
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold tracking-tight">
            Suitability
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SelectField
            form={form}
            hostErrors={hostErrors}
            locked={locked}
            path="suitability.investmentObjective"
            label="Investment objective"
            options={INVESTMENT_OBJECTIVES}
          />

          {/*
            Risk tolerance is the one field here the reviewer reads first, so
            it stays visible as radios rather than collapsing into a select.
            Unlike the redeem sequence in cash-management it is editable: the
            client picks it, and `locked` is the form's to decide.
          */}
          <div className="flex flex-col gap-2">
            <Label>Risk tolerance</Label>
            <RadioGroup
              value={watch('suitability.riskTolerance')}
              onValueChange={(v) =>
                form.setValue('suitability.riskTolerance', v, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              disabled={locked}
              className="flex flex-row flex-wrap gap-4"
            >
              {RISK_TOLERANCES.map((option) => (
                <div key={option} className="flex items-center gap-2.5">
                  <RadioGroupItem
                    value={option}
                    id={`riskTolerance-${option}`}
                  />
                  <Label
                    htmlFor={`riskTolerance-${option}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.timeHorizon"
              label="Time horizon"
              options={TIME_HORIZONS}
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
              path="suitability.investmentExperience"
              label="Investment experience"
              options={INVESTMENT_EXPERIENCE_LEVELS}
            />
            <SelectField
              form={form}
              hostErrors={hostErrors}
              locked={locked}
              path="suitability.sourceOfFunds"
              label="Source of funds"
              options={SOURCE_OF_FUNDS}
            />
          </div>

          {/*
            Financial profile. Ranges rather than amounts: the schema stores the
            code list value, so the form never has to reason about a currency
            string the client typed.
          */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Financial profile</Label>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectField
                form={form}
                hostErrors={hostErrors}
                locked={locked}
                path="suitability.annualIncome"
                label="Annual income"
                options={ANNUAL_INCOME_RANGES}
              />
              <SelectField
                form={form}
                hostErrors={hostErrors}
                locked={locked}
                path="suitability.netWorth"
                label="Net worth"
                options={NET_WORTH_RANGES}
              />
              <SelectField
                form={form}
                hostErrors={hostErrors}
                locked={locked}
                path="suitability.liquidNetWorth"
                label="Liquid net worth"
                options={LIQUID_NET_WORTH_RANGES}
              />
              <SelectField
                form={form}
                hostErrors={hostErrors}
                locked={locked}
                path="suitability.taxBracket"
                label="Tax bracket"
                options={TAX_BRACKETS}
              />
            </div>
          </div>

          <TextAreaField
            form={form}
            hostErrors={hostErrors}
            locked={locked}
            path="suitability.suitabilityNotes"
            label="Suitability notes"
          />
        </CardContent>
      </Card>
    );
  };
}
