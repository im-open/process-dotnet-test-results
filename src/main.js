const core = require('@actions/core');
const { findTrxFiles, transformAllTrxToJson, areThereAnyFailingTests } = require('./utils');
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
const commentIdentifier = core.getInput('comment-identifier') || '';

async function run() {
  try {
    const trxFiles = findTrxFiles(baseDir);
    const trxToJson = await transformAllTrxToJson(trxFiles);
    const failingTestsFound = areThereAnyFailingTests(trxToJson);
    let markupForComment = [];
    for (const data of trxToJson) {
      const markupData = getMarkupForTrx(data);

      let conclusion = 'success';
      if (data.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
        conclusion = ignoreTestFailures ? 'neutral' : 'failure';
      }
      if (shouldCreateStatusCheck) {
        await createStatusCheck(token, data, markupData, conclusion);
      }
      if (shouldCreatePRComment) {
        markupForComment.push(markupData); //Do it this way so we only have one comment per pr
      }
    }

    if (markupForComment.length > 0) {
      await createPrComment(token, markupForComment.join('\n'), updateCommentIfOneExists, commentIdentifier);
    }

    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed');
    core.setOutput('trx-files', trxFiles);
  } catch (error) {
    if (error instanceof RangeError) {
      core.info(error.message);
      core.setOutput('test-outcome', 'Failed');
      return;
    } else {
      core.setFailed(`An error occurred processing the trx files: ${error.message}`);
      core.setOutput('test-outcome', 'Failed');
    }
  }
}

run();
