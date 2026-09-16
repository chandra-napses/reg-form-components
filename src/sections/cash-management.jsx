/*
Cash Management section — AAW-131.

Loaded at runtime by a registration form via dynamic import(). Two rules govern
this file and both are load-bearing:

1. No imports. The published form bundle resolves bare specifiers through a
   host-populated registry that a separately-imported module has no access to,
   so anything imported here would reach the browser's own resolver and throw.
   Every dependency arrives as an argument instead.

2. The default export is a factory over React, not a component. Built with the
   classic JSX transform, so `React.createElement` binds to the parameter below
   rather than to a global that may not be set when this module evaluates.

The owning form keeps the zod schema for `cashManagement`. Field values are
extracted from the schema at publish time, before this module is ever fetched,
so a field defined here would not be validated server-side.
*/

/**
 * What this section renders, checked by the form against its own schema before
 * mounting. `purchasePercentage` and `redeemFundsToCoverMarginDebit` are
 * deliberately absent: AAW-131 sends them to Pershing locked and says not to
 * display them.
 */
export const fields = [
  'cashManagementSweep',
  'sweepType',
  'redeemSequence',
  'sweepInstructions',
];

export default function create(React) {
  return function CashManagement({
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
    // Each list defaults to empty: a host that has not published one yet
    // renders an empty control instead of throwing inside the map below and
    // taking the whole form down with it.
    const {
      CASH_MANAGEMENT_SWEEPS = [],
      SWEEP_TYPES = [],
      REDEEM_SEQUENCES = [],
    } = codeLists;

    return (
      <Card id="cash-management" style={{ scrollMarginTop: '9rem' }}>
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold tracking-tight">
            Cash Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SelectField
            form={form}
            hostErrors={hostErrors}
            locked={locked}
            path="cashManagement.cashManagementSweep"
            label="Cash management sweep"
            options={CASH_MANAGEMENT_SWEEPS}
          />
          <SelectField
            form={form}
            hostErrors={hostErrors}
            locked={locked}
            path="cashManagement.sweepType"
            label="Sweep type"
            options={SWEEP_TYPES}
          />
          {/*
            AAW-131 locks the redeem sequence down with First selected. The
            purchase percentage and the redeem-funds-to-cover-margin-debit
            checkbox are deliberately absent: the ticket says not to display
            them and to send a locked 100% and a locked checked box to
            Pershing, which the schema does with two literal types.
          */}
          <div className="flex flex-col gap-2">
            <Label>Redeem Sequence</Label>
            <RadioGroup
              value={watch('cashManagement.redeemSequence')}
              onValueChange={(v) =>
                form.setValue('cashManagement.redeemSequence', v, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              disabled
              className="flex flex-row gap-4"
            >
              {REDEEM_SEQUENCES.map((option) => (
                <div key={option} className="flex items-center gap-2.5">
                  <RadioGroupItem
                    value={option}
                    id={`redeemSequence-${option}`}
                  />
                  <Label
                    htmlFor={`redeemSequence-${option}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <TextAreaField
            form={form}
            hostErrors={hostErrors}
            locked={locked}
            path="cashManagement.sweepInstructions"
            label="Sweep instructions"
          />
        </CardContent>
      </Card>
    );
  };
}
