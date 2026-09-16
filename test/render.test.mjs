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
  CASH_MANAGEMENT_SWEEPS: ['None', 'Insured Deposit', 'Money Market'],
  SWEEP_TYPES: ['Automatic', 'Manual'],
  REDEEM_SEQUENCES: ['First', 'Last'],
  INVESTMENT_OBJECTIVES: ['Capital Preservation', 'Income', 'Growth', 'Speculation'],
  RISK_TOLERANCES: ['Conservative', 'Moderate', 'Aggressive'],
  TIME_HORIZONS: ['Under 3 years', '3-5 years', '6-10 years', 'Over 10 years'],
  LIQUIDITY_NEEDS: ['Low', 'Medium', 'High'],
  INVESTMENT_EXPERIENCE_LEVELS: ['None', 'Limited', 'Good', 'Extensive'],
  ANNUAL_INCOME_RANGES: ['Under $50,000', '$50,000-$99,999', '$100,000+'],
  NET_WORTH_RANGES: ['Under $100,000', '$100,000-$499,999', '$500,000+'],
  LIQUID_NET_WORTH_RANGES: ['Under $50,000', '$50,000-$249,999', '$250,000+'],
  TAX_BRACKETS: ['0-15%', '16-25%', '26-35%', 'Over 35%'],
  SOURCE_OF_FUNDS: ['Salary', 'Inheritance', 'Sale of Business', 'Investments'],
};

/** Renders one section and returns the markup plus what it did to the form. */
function mount(createSection, { lists = codeLists, locked = false } = {}) {
  const setValueCalls = [];
  const radioGroups = [];
  const ui = makeUi();
  ui.RadioGroup = (props) => {
    radioGroups.push(props);
    return React.createElement('div', { role: 'radiogroup', className: props.className }, props.children);
  };

  const Section = createSection(React);
  const markup = renderToStaticMarkup(
    React.createElement(Section, {
      form: { setValue: (...args) => setValueCalls.push(args) },
      watch: () => undefined,
      hostErrors: {},
      locked,
      ui,
      SelectField: field('select'),
      TextAreaField: field('textarea'),
      codeLists: lists,
    }),
  );

  return { markup, setValueCalls, radioGroups };
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
    const { markup } = mount(mod.default);
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

test('suitability: risk tolerance follows `locked`', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'suitability.js')).href);
  assert.equal(mount(mod.default, { locked: true }).radioGroups[0].disabled, true);
  assert.equal(mount(mod.default, { locked: false }).radioGroups[0].disabled, false);
});

test('cash-management: redeem sequence stays locked regardless of `locked`', async () => {
  const mod = await import(pathToFileURL(resolve(DIST, 'cash-management.js')).href);
  assert.equal(mount(mod.default, { locked: false }).radioGroups[0].disabled, true);
});

function camel(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
