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

async function run() {
  try {
    const trxFiles = findTrxFiles(baseDir);
    const trxToJson = await transformAllTrxToJson(trxFiles);
    const failingTestsFound = areThereAnyFailingTests(trxToJson);
    let markupForComment = [];

    let fullMarkupComment;
    for (const data of trxToJson) {
      const markupData = getMarkupForTrx(data);

      let conclusion = 'success';
      if (data.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
        conclusion = ignoreTestFailures ? 'neutral' : 'failure';
      }
      if (shouldCreateStatusCheck) {
        await createStatusCheck(token, data, markupData, conclusion);
      }

      markupForComment.push(markupData);
    }

    if (markupForComment.length > 0 && shouldCreatePRComment) {
      const commentCharacterLimit = 65535;
      let markupComment = markupForComment.join('\n');
      if (markupComment.length > commentCharacterLimit) {
        core.info(
          `Truncating markup data due to character limit exceeded for github api.  Markup data length: ${markupComment.length}/${commentCharacterLimit}`
        );
        markupComment = markupComment.substring(0, commentCharacterLimit - 100);
        markupComment = 'Test outcome truncated due to character limit. See full report in output. \n' + markupComment;
        core.setOutput('test-outcome-truncated', 'true');
      } else {
        core.setOutput('test-outcome-truncated', 'false');
      }
      await createPrComment(token, markupComment, updateCommentIfOneExists, commentIdentifier);
    }

    const resultsFile = './test-results.md';
    let resultsFilePath = null;
    if (shouldCreateResultsFile) {
      resultsFilePath = createResultsFile(resultsFile, markupForComment.join('\n'));
    }

    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed');
    core.setOutput('trx-files', trxFiles);
    core.setOutput('test-results-file-path', resultsFilePath);
  } catch (error) {
    if (error instanceof RangeError) {
      core.info(error.message);
      core.setOutput('test-outcome', 'Failed');
      core.setOutput('test-results-file-path', null);
      return;
    } else {
      core.setFailed(`An error occurred processing the trx files: ${error.message}`);
      core.setOutput('test-outcome', 'Failed');
      core.setOutput('test-results-file-path', null);
    }
  }
}

run();
