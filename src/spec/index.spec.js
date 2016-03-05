import { expect } from 'chai'
import * as fs from 'fs'
const transform = (str, options = {}) => {
  return require('babel-core').transform(str, {
    plugins: [['./src', options]]
  }).code;
};
const TEST_CASE_PATH = './src/spec/test-cases/'


const readCase = (caseFolder, callback) => {
  fs.readFile(TEST_CASE_PATH + caseFolder + '/input.js', 'utf8', (err, input) => {
    if (err) {
      return console.log(err);
    }
    fs.readFile(TEST_CASE_PATH + caseFolder + '/output.js', 'utf8', (err, output) => {
      if (err) {
        return console.log(err);
      }
      callback(input, output)
    });
  });

}


describe('Compile query with different options', () => {
  describe('With default options', () => {
    it('compile ok', () => {
      readCase('staticWithDefaultOptions', (input, output) => {
        except(transform(input)).to.equal(output);
      });
    });
  });
  describe('With vanilla mori and template string', () => {
    it('compile ok', () => {
      readCase('withVanillaMoriAndTemplate', (input, output) => {
        except(transform(input, {library: 'mori'})).to.equal(output);
      });
    });
  });
  describe('With other tag and Pull query', () => {
    it('compile ok', () => {
      readCase('withOtherSymbol', (input, output) => {
        except(transform(input, {library: 'mori', tag: 'Ds'})).to.equal(output);
      });
    });
  });
});
