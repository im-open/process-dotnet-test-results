const core = require('@actions/core');
const github = require('@actions/github');
const { getMarkupForTrx } = require('./markup');

async function createCheckRun(repoToken, ignoreTestFailures, reportData) {
  try {
    core.info(`Creating PR check for ${reportData.ReportMetaData.ReportTitle}...`);
    const octokit = github.getOctokit(repoToken);

    let git_sha = github.context.sha;

    if (github.context.eventName === 'push') {
      core.info(`Creating status check for GitSha: ${git_sha} on a push event`);
    } else if (github.context.eventName === 'pull_request') {
      git_sha = github.context.payload.pull_request.head.sha;
      core.info(`Creating status check for GitSha: ${git_sha} on a pull request event`);
    } else {
      core.info(`Creating status check for GitSha: ${git_sha} on a ${github.context.eventName} event`);
    }

    let conclusion = 'success';
    if (reportData.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
      conclusion = ignoreTestFailures ? 'neutral' : 'failure';
    }

    const markupData = getMarkupForTrx(reportData);
    const checkTime = new Date().toUTCString();
    core.info(`Check time is: ${checkTime}`);
    const response = await octokit.rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: reportData.ReportMetaData.ReportName.toLowerCase(),
      head_sha: git_sha,
      status: 'completed',
      conclusion: conclusion,
      output: {
        title: reportData.ReportMetaData.ReportTitle,
        summary: `This test run completed at \`${checkTime}\``,
        text: markupData
      }
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create status check. Error code: ${response.status}`);
    } else {
      core.info(`Created check: ${response.data.name} with response status ${response.status}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = {
  createCheckRun
};
