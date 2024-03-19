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
const updateCommentIfOneExists = core.getBooleanInput('update-comment-if-one-exists');

const jobAndStep = `${process.env.GITHUB_JOB}_${process.env.GITHUB_ACTION}`;
const commentIdentifier = core.getInput('comment-identifier') || jobAndStep;

async function run() {
  try {
    // 1 - Convert the trx files to JSON
    const trxFiles = findTrxFiles(baseDir);
    const trxToJson = await transformAllTrxToJson(trxFiles);
    if (trxToJson.some(trx => !trx)) {
      core.setFailed('\nOne or more files could not be parsed.  Please check the logs for more information.');
      core.setOutput('test-outcome', 'Failed');
      core.setOutput('test-results-file-path', null);
      return;
    }
    core.setOutput('trx-files', trxFiles);

    // 2 - Set the test outcome based on failing tests
    const failingTestsFound = areThereAnyFailingTests(trxToJson);
    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed');

    // 3 - Get markup and create status checks for each trx file
    let markupForResults = [];
    let statusCheckIds = [];
    for (const data of trxToJson) {
      const markupData = getMarkupForTrx(data);
      markupForResults.push(markupData);

      if (shouldCreateStatusCheck) {
        let conclusion = 'success';
        if (data.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
          conclusion = ignoreTestFailures ? 'neutral' : 'failure';
        }
        const checkId = await createStatusCheck(token, data, markupData, conclusion);
        statusCheckIds.push(checkId);
      }
    }
    if (shouldCreateStatusCheck && statusCheckIds.length > 0) {
      core.info(`\nThe following status check ids were created: ${statusCheckIds.join(',')}`);
      core.setOutput('status-check-ids', statusCheckIds.join(',')); // This is mainly for testing purposes
    }
    const markupData = markupForResults.join('\n');

    // 4 - Create a PR comment if requested
    if (shouldCreatePRComment) {
      core.info(`\nCreating a PR comment with length ${markupData.length}...`);

      // GitHub API has a limit of 65535 characters for a comment so truncate the markup if we need to
      const characterLimit = 65535;
      let truncated = false;
      let mdForComment = markupData;

      if (mdForComment.length > characterLimit) {
        const message = `Truncating markup data due to character limit exceeded for GitHub API.  Markup data length: ${mdForComment.length}/${characterLimit}`;
        core.info(message);

        truncated = true;
        const truncatedMessage = `> [!Important]\n> Test results truncated due to character limit.  See full report in output.\n`;
        mdForComment = `${truncatedMessage}\n${mdForComment.substring(0, characterLimit - 100)}`;
      }
      core.setOutput('test-results-truncated', truncated);

      const commentId = await createPrComment(token, mdForComment, updateCommentIfOneExists, commentIdentifier);
      core.setOutput('pr-comment-id', commentId); // This is mainly for testing purposes
    }

    // 5 - Create a results file automatically to facilitate testing
    const resultsFilePath = createResultsFile(markupData, jobAndStep);
    core.setOutput('test-results-file-path', resultsFilePath);
  } catch (error) {
    core.setOutput('test-outcome', 'Failed');
    core.setOutput('test-results-file-path', null);

    if (error instanceof RangeError) {
      core.info(`An error occurred processing the trx files: ${error.message}`);
    } else {
      core.setFailed(`An error occurred processing the trx files: ${error.message}`);
    }
  }
}

run();
