const core = require('@actions/core');
const { findTrxFiles, transformAllTrxToJson, areThereAnyFailingTests } = require('./utils');

const { createCheckRun } = require('./github');

const token = core.getInput('gh-token');
const baseDir = core.getInput('base-directory') || '.';
const ignoreTestFailures = core.getInput('ignore-failures-in-check') == 'true';

async function run() {
  try {
    const trxFiles = findTrxFiles(baseDir);
    const trxToJson = await transformAllTrxToJson(trxFiles);
    const failingTestsFound = areThereAnyFailingTests(trxToJson);

    for (const data of trxToJson) {
      await createCheckRun(token, ignoreTestFailures, data);
    }

    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed');
    core.setOutput('trx-files', trxFiles);
  } catch (error) {
    if (error instanceof RangeError) {
      core.info(error.message);
      return;
    } else {
      core.setFailed(`An error occurred processing the trx files: ${error.message}`);
    }
  }
}

run();
