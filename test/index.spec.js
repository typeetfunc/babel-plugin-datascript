import {expect} from 'chai'
import * as fs from 'fs'

const transform = (str, options = {}) => {
  return require(`babel-core`).transform(str, {
    plugins: [[`./src`, options]],
  }).code
}
const TEST_CASE_PATH = `./test/test-cases/`
const CODIR = `utf8`

const readCase = (caseFolder, callback, options = {}) => {
  fs.readFile(`${TEST_CASE_PATH}${caseFolder}/input.js`,
      CODIR, (err, input) => {
        if (err) {
          return console.log(err)
        }
        if (options.onlyInput) {
          callback(input)
        } else {
          fs.readFile(`${TEST_CASE_PATH}${caseFolder}/output.js`,
            CODIR, (errOut, output) => {
              if (errOut) {
                return console.log(errOut)
              }
              callback(input, output)
            })
        }
      })
}
/* eslint-disable */
describe(`Compile query with different options`, () => {
  describe(`With default options`, () => {
    it(`compile ok`, () => {
      readCase(`staticWithDefaultOptions`, (input, output) => {
        except(transform(input)).to.equal(output);
      });
    });
  });
  describe(`With vanilla mori and template string`, () => {
    it(`compile ok`, () => {
      readCase(`withVanillaMoriAndTemplate`, (input, output) => {
        except(transform(input, {library: `mori`})).to.equal(output);
      });
    });
  });
  describe(`With other tag and Pull query`, () => {
    it(`compile ok`, () => {
      readCase(`withOtherSymbol`, (input, output) => {
        except(transform(input, {library: `mori`, tag: `Ds`})).to.equal(output);
      });
    });
  });
  describe(`Some different edn`, () => {
    it(`compile ok`, () => {
      readCase(`someEdnTest`, (input, output) => {
        except(transform(input)).to.equal(output);
      });
    });
  });
});

describe(`Compile query with different options`, () => {
  describe(`Not correct EDN`, () => {
    it(`compile with throw Syntax Error`, () => {
      readCase(`badEdn`, (input) => {
        except(() => transform(input)).to.throw(SyntaxError, /> 2 | ar q1 = Datalog/);
      }, {onlyInput: true});
    });
  });
});
