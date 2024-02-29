module.exports = async (github, context, core, statusCheckIdsString) => {
  core.info(`\nAsserting that checks with the following ids exist: '${statusCheckIdsString}'`);

  const actualChecks = [];
  const statusCheckIds = statusCheckIdsString.split(',');

  for (const statusCheckId of statusCheckIds) {
    if (!statusCheckId || statusCheckId.trim() === '') {
      continue;
    }

    core.info(`\nChecking for the existence of status check ${statusCheckId}.`);
    await github.rest.checks
      .get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        check_run_id: statusCheckId.trim()
      })
      .then(checkResponse => {
        core.info(`Status Check ${statusCheckId} exists.`);
        const rawCheck = checkResponse.data;

        const statusCheckToReturn = {
          id: rawCheck.id,
          name: rawCheck.name,
          status: rawCheck.status,
          conclusion: rawCheck.conclusion,
          startedAt: rawCheck.started_at,
          completedAt: rawCheck.completed_at,
          title: rawCheck.output.title,
          summary: rawCheck.output.summary,
          prNumber: rawCheck.pull_requests.length > 0 ? rawCheck.pull_requests[0].number : null,
          text: rawCheck.output.text
        };
        core.startGroup(`Check ${statusCheckId} details:`);
        console.log(statusCheckToReturn);
        core.endGroup();
        actualChecks.push(statusCheckToReturn);
      })
      .catch(error => {
        core.setFailed(`An error occurred retrieving status check ${statusCheckId}.  Error: ${error.message}`);
      });
  }
  return actualChecks;
};
