import {expect, assert} from 'chai'
import * as fs from 'fs'

const transform = (str, options = {}) => {
  return require(`babel-core`).transform(str, {
    plugins: [[`./src`, options]],
  }).code
}
const TEST_CASE_PATH = `./test/test-cases/`
const CODIR = `utf8`

const dropLastBreak = str => str.replace(/\n$/, '')
const readCase = (caseFolder, options = {}) => {
  const input = dropLastBreak(fs.readFileSync(
    `${TEST_CASE_PATH}${caseFolder}/input.js`,
    CODIR
  ))
  if (options.onlyInput) {
    return input
  } else {
    const output = dropLastBreak(fs.readFileSync(
      `${TEST_CASE_PATH}${caseFolder}/output.js`,
      CODIR
    ))
    return [input, output]
  }
}

/* eslint-disable */

describe(`Compile query with different options`, () => {
  describe(`With default options`, () => {
    it(`compile ok`, () => {
      const [input, output] = readCase(`staticWithDefaultOptions`)
      assert.equal(transform(input), output)
    });
  });

  describe(`With vanilla mori and template string`, () => {
    it(`compile ok`, () => {
      const [input, output] = readCase(`withVanillaMoriAndTemplate`)
      assert.equal(transform(input, {library: `mori`}), output)
    });
  });

  describe(`With other tag and Pull query`, () => {
    it(`compile ok`, () => {
      const [input, output] = readCase(`withOtherSymbol`)
      assert.equal(transform(input, {library: `mori`, tag: `Ds`}), output)
    });
  });

  describe(`Some different edn`, () => {
    it(`compile ok`, () => {
      const [input, output] = readCase(`someEdnTest`)
      assert.equal(transform(input), output)
    });
  });
});

describe(`Check bad query or EDN`, () => {
  describe(`Not correct EDN`, () => {
    it(`compile with throw Syntax Error`, () => {
      const input = readCase(`badEdn`, {onlyInput: true})
      assert.throws(() => transform(input), SyntaxError, /EOF while reading/)
    })
  });
  describe(`Not correct Query`, () => {
    it(`compile with throw Syntax Error`, () => {
      const input = readCase(`badQuery`, {onlyInput: true})
      assert.throws(() => transform(input), SyntaxError, `#error {:message "Query for unknown vars: [?f]", :data {:error :parser/query, :vars #{#datascript.parser.Variable{:symbol ?f}}, :form [:find ?e :with ?f :where [?e]]}}`)
    });
  });
});

describe(`With caching parse`, () => {
  it(`Use memoized_parse instead parse`, () => {
    const [input, output] = readCase(`withCache`)
    assert.equal(transform(input, {cache: true}), output);
  });
});
