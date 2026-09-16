/*
Renders the built modules the way the form does: import the file, call the
factory with React, mount the component with a host-shaped set of props. This
exercises dist/, not src/, because dist/ is what the browser fetches.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const DIST = resolve('dist/v3');
const manifest = JSON.parse(await readFile(resolve(DIST, 'manifest.json'), 'utf8'));

/** Stand-ins for the host's shadcn-ish primitives. Each keeps enough of its
 *  props in the markup for a test to tell whether a field was rendered. */
function makeUi() {
  const box = (tag) => ({ children, ...rest }) =>
    React.createElement(tag, { 'data-ui': rest.id ?? undefined, ...strip(rest) }, children);
  const strip = ({ className, style, id }) => ({ className, style, id });

  return {
    Card: box('section'),
    CardHeader: box('header'),
    CardTitle: box('h2'),
    CardContent: box('div'),
    Label: ({ children, htmlFor, className }) =>
      React.createElement('label', { htmlFor, className }, children),
    RadioGroup: null, // filled in per-test so props can be captured
    RadioGroupItem: ({ value, id }) =>
      React.createElement('input', { type: 'radio', value, id, readOnly: true }),
    Separator: () => React.createElement('hr', null),
    Button: ({ children, onClick, className }) =>
      React.createElement('button', { type: 'button', onClick, className }, children),
  };
}

const field = (kind) => ({ path, label, options }) =>
  React.createElement('div', {
    'data-field': kind,
    'data-path': path,
    'data-label': label,
    'data-options': options ? String(options.length) : undefined,
  });

/** Every code list either section reads, with plausible values. */
const codeLists = {
  CASH_MANAGEMENT_SWEEPS: ['DIDVX', 'NOSWP'],
  SWEEP_TYPES: ['Primary', 'Alternative'],
  REDEEM_SEQUENCES: ['First', 'Second'],
  RISK_EXPOSURE_LEVELS: ['Conservative', 'Moderate', 'Aggressive'],
  INVESTMENT_OBJECTIVES: ['Capital Preservation', 'Income', 'Growth', 'Speculation'],
  LIQUIDITY_NEEDS: ['Low', 'Medium', 'High'],
  ANNUAL_EXPENSE_RANGES: ['Under $50,000', '$50,000-$99,999', '$100,000+'],
  ADDITIONAL_INVESTMENT_TYPES: ['Real Estate', 'Annuity', 'Other'],
};

/** Renders one section and returns the markup plus what it did to the form. */
function mount(
  createSection,
  { lists = codeLists, locked = false, readOnly = false, watched = {}, rows = [] } = {},
) {
  const setValueCalls = [];
  const radioGroups = [];
  const ui = makeUi();
  ui.RadioGroup = (props) => {
    radioGroups.push(props);
    return React.createElement('div', { role: 'radiogroup', className: props.className }, props.children);
  };

  const Section = createSection(React);
  const arrayCalls = [];
  const markup = renderToStaticMarkup(
    React.createElement(Section, {
      form: { setValue: (...args) => setValueCalls.push(args) },
      watch: (path) => watched[path],
      hostErrors: {},
      locked,
      readOnly,
      ui,
      SelectField: field('select'),
      DateField: field('date'),
      MoneyField: field('money'),
      TextAreaField: field('textarea'),
      RadioYesNoField: field('yesno'),
      EntryCard: ({ children }) => React.createElement('article', null, children),
      helpers: {
        entryHeading: (name, fallback) => ({ title: name || fallback }),
        entryName: (v) => v ?? '',
        tomorrowIso: () => '2026-01-01',
      },
      codeLists: lists,
      investmentsArray: {
        fields: rows,
        append: (v) => arrayCalls.push(['append', v]),
        remove: (i) => arrayCalls.push(['remove', i]),
      },
    }),
  );

  return { markup, setValueCalls, radioGroups, arrayCalls };
}

for (const section of manifest.sections) {
  const url = pathToFileURL(resolve(DIST, section.file)).href;
  const mod = await import(url);
  const code = await readFile(resolve(DIST, section.file), 'utf8');

  test(`${section.name}: honours the no-imports contract`, () => {
    assert.ok(!/^\s*import\b/m.test(code), 'built module must not import anything');
    assert.ok(!/\brequire\s*\(/.test(code), 'built module must not require anything');
    assert.ok(/^export\s*\{/m.test(code), 'built module must be ESM');
  });

  test(`${section.name}: exports a factory and its fields`, () => {
    assert.equal(typeof mod.default, 'function');
    assert.deepEqual(mod.fields, section.fields);
    assert.equal(new Set(mod.fields).size, mod.fields.length, 'fields must be unique');
  });

  test(`${section.name}: renders every field it declares`, () => {
    // Gates that hide a declared field are opened here; a section must be able
    // to render everything it claims, not only its default branch.
    const { markup } = mount(mod.default, {
      watched: { 'suitability.anyOtherInvestmentsIndicator': 'Yes' },
      rows: [{ id: 'row-0' }],
    });
    assert.ok(markup.length > 0);
    for (const name of mod.fields) {
      assert.ok(markup.includes(name), `field \`${name}\` is declared but not rendered`);
    }
  });

  test(`${section.name}: writes through to the form`, () => {
    const { radioGroups, setValueCalls } = mount(mod.default);
    for (const group of radioGroups) {
      group.onValueChange('Moderate');
    }
    for (const [path, value, opts] of setValueCalls) {
      assert.ok(path.startsWith(`${camel(section.name)}.`), `unexpected path ${path}`);
      assert.equal(value, 'Moderate');
      assert.deepEqual(opts, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    assert.equal(setValueCalls.length, radioGroups.length);
  });

  test(`${section.name}: survives a host that has not published its code lists`, () => {
    assert.doesNotThrow(() => mount(mod.default, { lists: {} }));
  });
}

test('suitability: additional investments stay hidden until the gate is Yes', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'suitability.js')).href);
  const rows = [{ id: 'row-0' }];

  const closed = mount(mod.default, { rows });
  assert.ok(!closed.markup.includes('additionalInvestments'));

  const open = mount(mod.default, {
    watched: { 'suitability.anyOtherInvestmentsIndicator': 'Yes' },
    rows,
  });
  assert.ok(open.markup.includes('additionalInvestments.0.investment'));
  assert.ok(open.markup.includes('additionalInvestments.0.value'));
});

test('suitability: investment description appears only for Other', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'suitability.js')).href);
  const base = {
    watched: { 'suitability.anyOtherInvestmentsIndicator': 'Yes' },
    rows: [{ id: 'row-0' }],
  };
  assert.ok(!mount(mod.default, base).markup.includes('investmentDescription'));

  const other = mount(mod.default, {
    ...base,
    watched: {
      ...base.watched,
      'suitability.additionalInvestments.0.investment': 'Other',
    },
  });
  assert.ok(other.markup.includes('investmentDescription'));
});

test('suitability: readOnly hides add and remove', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'suitability.js')).href);
  const opts = {
    watched: { 'suitability.anyOtherInvestmentsIndicator': 'Yes' },
    rows: [{ id: 'row-0' }],
  };
  assert.ok(mount(mod.default, opts).markup.includes('Add investment'));
  assert.ok(
    !mount(mod.default, { ...opts, readOnly: true }).markup.includes('Add investment'),
  );
});

test('suitability: the add button is withheld at the schema maximum', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'suitability.js')).href);
  const rows = Array.from({ length: 17 }, (_, i) => ({ id: `row-${i}` }));
  const { markup } = mount(mod.default, {
    watched: { 'suitability.anyOtherInvestmentsIndicator': 'Yes' },
    rows,
  });
  assert.ok(!markup.includes('Add investment'));
});

test('cash-management: redeem sequence stays locked regardless of `locked`', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'cash-management.js')).href);
  assert.equal(mount(mod.default, { locked: false }).radioGroups[0].disabled, true);
});

function camel(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
