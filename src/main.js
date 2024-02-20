const core = require('@actions/core');
const { findTrxFiles, transformAllTrxToJson, areThereAnyFailingTests, createResultsFile } = require('./utils');
const { createStatusCheck, createPrComment } = require('./github');
const { getMarkupForTrx } = require('./markup');

const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const token = core.getInput('github-token', requiredArgOptions);
const baseDir = core.getInput('base-directory') || '.';
const ignoreTestFailures = core.getBooleanInput('ignore-test-failures');
const shouldCreateStatusCheck = core.getBooleanInput('create-status-check');
const shouldCreatePRComment = core.getBooleanInput('create-pr-comment');
const shouldCreateResultsFile = core.getBooleanInput('create-results-file');
const updateCommentIfOneExists = core.getBooleanInput('update-comment-if-one-exists');
const commentIdentifier = core.getInput('comment-identifier') || '';

async function createResultsFileIfRequested(testResultsMarkup) {
  if (!shouldCreateResultsFile) {
    return;
  }

  // TODO:  if this is called multiple times in one job they will overlap.  Should we fix that?
  //        Also not sure if the post-job step that deletes this would be working as designed.
  //        It is only deleted after each step is run, so the first post-step deletes it then
  //        the rest are run without anything to delete.  (adding something step specific makes sense)
  const resultsFile = './test-results.md';
  const resultsFilePath = createResultsFile(resultsFile, testResultsMarkup);
  core.setOutput('test-results-file-path', resultsFilePath);
  core.exportVariable('TEST_RESULTS_FILE_PATH', resultsFilePath);
}

async function createPRCommentIfRequested(testResultsMarkup) {
  if (testResultsMarkup.length === 0 || !shouldCreatePRComment) {
    return;
  }

  // The README.md indicates only one per comment per run
  // so all the trx markup will be combined into one comment
  let markup = testResultsMarkup;

  // GitHub API has a limit of 65535 characters for a comment so truncate the markup if we need to
  const charLimit = 65535;
  let truncated = false;
  if (markup.length > charLimit) {
    const message = `Truncating markup data due to character limit exceeded for GitHub API.  Markup data length: ${markup.length}/${charLimit}`;
    core.info(message);

    markup = markup.substring(0, charLimit - 100);
    markup = 'Test results truncated due to character limit. See full report in output. \n' + markup;
    truncated = true;
  }
  core.setOutput('test-results-truncated', truncated);

  // TODO:  implement steve's change for cypress
  const commentId = await createPrComment(token, markup, updateCommentIfOneExists, commentIdentifier);
  if (commentId && commentId.length > 0) {
    core.setOutput('pr-comment-id', commentId); // This is mainly for testing purposes
  }
}

async function getMarkupAndCreateStatusCheckForEachTrxFile(trxToJson) {
  let markupForResults = [];
  let statusCheckIds = [];
  for (const data of trxToJson) {
    const markupData = getMarkupForTrx(data);

    // The README.md indicates one status check will be created per trx file
    if (shouldCreateStatusCheck) {
      let conclusion = 'success';
      if (data.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
        conclusion = ignoreTestFailures ? 'neutral' : 'failure';
      }
      const checkId = await createStatusCheck(token, data, markupData, conclusion);
      if (checkId && checkId.length > 0) {
        statusCheckIds.push(checkId);
      }
    }

    markupForResults.push(markupData);
  }
  if (shouldCreateStatusCheck && statusCheckIds.length > 0) {
    core.setOutput('status-check-ids', statusCheckIds.join(','));
  }
  return markupForResults.join('\n');
}

function setTestOutcomeBasedOnFailingTests(trxToJson) {
  const failingTestsFound = areThereAnyFailingTests(trxToJson);
  core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed');
}

async function convertTrxToJson() {
  const trxFiles = findTrxFiles(baseDir);
  const trxToJson = await transformAllTrxToJson(trxFiles);
  if (trxToJson.some(trx => !trx)) {
    core.setFailed('\nOne or more files could not be parsed.  Please check the logs for more information.');
    core.setOutput('test-outcome', 'Failed');
    core.setOutput('test-results-file-path', null);
    return;
  }
  core.setOutput('trx-files', trxFiles);
  return trxToJson;
}

async function run() {
  try {
    const trxToJson = await convertTrxToJson();
    if (!trxToJson) return;

    setTestOutcomeBasedOnFailingTests(trxToJson);

    const testResultsMarkup = await getMarkupAndCreateStatusCheckForEachTrxFile(trxToJson);
    await createPRCommentIfRequested(testResultsMarkup);
    await createResultsFileIfRequested(testResultsMarkup);
  } catch (error) {
    core.setOutput('test-outcome', 'Failed');
    core.setOutput('test-results-file-path', null);

    if (error instanceof RangeError) {
      // TODO:  It seems inconsistent that we're saying the step is a success (core.info instead of core.setFailed)
      //        but the test-outcome is Failed.  Do we need to reconcile this?  That's probably a breaking change.
      core.info(`An error occurred processing the trx files: ${error.message}`);
    } else {
      core.setFailed(`An error occurred processing the trx files: ${error.message}`);
    }
  }
}

run();
