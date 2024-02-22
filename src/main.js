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

    // 4 - Create a PR comment if requested
    if (markupForResults.length > 0 && shouldCreatePRComment) {
      let markup = markupForResults.join('\n');
      core.info(`\nCreating a PR comment with length ${markup.length}...`);

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

      const commentId = await createPrComment(token, markup, updateCommentIfOneExists, commentIdentifier);
      core.setOutput('pr-comment-id', commentId); // This is mainly for testing purposes
    }

    // 5 - Create a results file if requested
    if (shouldCreateResultsFile) {
      // TODO:  if this is called multiple times in one job the file contents will be replaced for each instance.  Should we fix that?
      //        Along with that, I'm not sure if the post-job step that deletes this file is working as designed or if it makes sense.
      //        This file is only deleted in a post-job step, so if there are multiple iterations the first post-job step deletes
      //        the file, then the rest of the post-job steps have nothing to delete.  I'm not sure what the point of it is since
      //        post-job it doesn't matter whether the file is there are not anyway.  I think we can get rid of post-job step.
      const resultsFile = './test-results.md';
      const resultsFilePath = createResultsFile(resultsFile, markupForResults.join('\n'));
      core.setOutput('test-results-file-path', resultsFilePath);
      core.exportVariable('TEST_RESULTS_FILE_PATH', resultsFilePath);
    }
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
