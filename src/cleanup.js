const core = require('@actions/core');
const { deleteResultsFile } = require('./utils');

const shouldCreateResultsFile = core.getBooleanInput('create-results-file');
const resultsFilePath = process.env.TEST_RESULTS_FILE_PATH;

async function cleanup() {
  try {
    if (shouldCreateResultsFile) {
      deleteResultsFile(resultsFilePath);
    } else {
      core.info('No results file created.  No cleanup required.');
    }
  } catch (error) {
    core.info(`Error in cleaning action files. Error: ${error.message}`);
  }
}

cleanup();
