const core = require('@actions/core');
const github = require('@actions/github');

async function createStatusCheck(repoToken, reportData, markupData, conclusion) {
  try {
    core.info(`Creating Status check for ${reportData.ReportMetaData.ReportTitle}...`);
    const octokit = github.getOctokit(repoToken);

    let git_sha =
      github.context.eventName === 'pull_request' ? github.context.payload.pull_request.head.sha : github.context.sha;
    core.info(`Creating status check for GitSha: ${git_sha} on a ${github.context.eventName} event.`);

    const checkTime = new Date().toUTCString();
    core.info(`Check time is: ${checkTime}`);
    const response = await octokit.rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: `status check - ${reportData.ReportMetaData.ReportName.toLowerCase()}`,
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

async function createPrComment(repoToken, markupData) {
  try {
    if (github.context.eventName != 'pull_request') {
      core.info('This event was not triggered by a pull_request.  No comment will be created.');
    }

    core.info(`Creating PR Comment...`);
    const octokit = github.getOctokit(repoToken);

    const markupDataPrefix = `<!-- im-open/process-dotnet-test-results -->
    `;

    const comments = await octokit.rest.issues.listComments({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo
    });

    if (response.status !== 201) {
      core.setFailed(`Failed to list PR comments. Error code: ${response.status}`);
      return;
    }
  
    const existingComment = comments.data.find(comment => comment.body.startsWith(markupDataPrefix));

    const response = existingComment === undefined 
    ? await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.payload.pull_request.number,
      body: markupDataPrefix + markupData,
    })
    : await octokit.rest.issue.updateComment({
      comment_id: existingComment.id,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      body: markupDataPrefix + markupData,
    });

    if (response.status !== 201) {
      core.setFailed(`Failed to create PR comment. Error code: ${response.status}`);
    } else {
      core.info(`Created PR comment: ${response.data.id} with response status ${response.status}`);
    }
  } catch (error) {
    core.setFailed(`An error occurred trying to create the PR comment: ${error}`);
  }
}

module.exports = {
  createStatusCheck,
  createPrComment
};
