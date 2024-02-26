module.exports = async (github, core, statusCheckId) => {
  core.info(`\nUpdate purposely failing status checks: '${statusCheckId}'`);

  if (!statusCheckId || statusCheckId.trim() === '') {
    return;
  }

  let actualCheck;
  await github.rest.checks
    .get({
      owner: 'im-open',
      repo: 'process-dotnet-test-results',
      check_run_id: statusCheckId
    })
    .then(response => {
      core.info(`Status Check ${statusCheckId} exists.`);
      console.log('respose:');
      console.log(response.data);
      actualCheck = response.data;
    })
    .catch(error => {
      core.setFailed(`An error occurred retrieving status check ${statusCheckId}.  Error: ${error.message}`);
    });

  if (!actualCheck) {
    core.info('Returning since status check was not found.');
    return;
  }

  await github.rest.checks
    .update({
      owner: 'im-open',
      repo: 'process-dotnet-test-results',
      check_run_id: statusCheckId,
      name: `${actualCheck.name} - UPDATED`,
      conclusion: 'neutral',
      output: {
        title: `${actualCheck.output.title} - Updated`,
        summary: `${actualCheck.output.summary} - Updated`,
        text: `# Test Update\n> [!IMPORTANT]\n> This status check has been modified with a \`neutral\` status.  It was purposely created with a 'failure' conclusion but we don't want this to prevent the PR from being merged.\n${actualCheck.output.text}`
      }
    })
    .then(() => {
      core.info(`The status check '${statusCheckId}' was updated successfully.`);
    })
    .catch(error => {
      core.info(`An error occurred updating status check '${statusCheckId}'.  Error: ${error.message}`);
      core.info(`This status check can be ignored when determining whether the PR is ready to merge.`);
    });
};
