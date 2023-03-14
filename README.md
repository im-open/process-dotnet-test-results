# process-dotnet-test-results

This repository is based on [NasAmin/trx-parser]

This action works in conjunction with another step that runs `dotnet test` and it parses test results from `trx` files.  This action will take the parsed results and create a Status Check or PR Comment depending on the flags set. This action does not run the tests itself.

There should be one status check created per `trx` file.  For comments, one will be created for all `trx` files.  The check and comment headings are named after the test project the `trx` was generated for.

## Index

- [Failures](#failures)
- [Limitations](#limitations)
- [Action Outputs](#action-outputs)
  - [Pull Request Comment](#pull-request-comment)
  - [Pull Request Status Check](#pull-request-status-check)
  - [Workflow Run](#workflow-run)
  - [Failed Test Details](#failed-test-details)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Usage Examples](#usage-examples)
  - [Using the defaults](#using-the-defaults)
  - [Specifying additional behavior](#specifying-additional-behavior)
- [Contributing](#contributing)
  - [Recompiling](#recompiling)
  - [Incrementing the Version](#incrementing-the-version)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
  
## Failures
The status check can be seen as a new item on the workflow run, a PR comment or on the PR Status Check section.  If the test results contain failures, the status check will be marked as failed. Having the status check marked as failed will prevent PRs from being merged. If this status check behavior is not desired, the `ignore-test-failures` input can be set and the outcome will be marked as neutral if test failures are detected. The status badge that is shown in the comment or status check body will still indicate it was a failure though.

## Limitations
GitHub does have a size limitation of 65535 characters for a Status Check body or a PR Comment.  This action will fail if the test results exceed the GitHub [limit].  To mitigate this size issue only failed tests are included in the output.

If you have multiple workflows triggered by the same `pull_request` or `push` event, GitHub creates one checksuite for that commit.  The checksuite gets assigned to one of the workflows randomly and all status checks for that commit are reported to that checksuite. That means if there are multiple workflows with the same trigger, your status checks may show on a different workflow run than the run that created them.

## Action Outputs
### Pull Request Comment
This is shown on the pull request when the `create-pr-comment` is set to `true` and there is a PR associated with the commit.
<kbd><img src="./docs/pr_comment.png"></img></kbd>

### Pull Request Status Check
This is shown on the pull request when the `create-status-check` is set to `true` and there is a PR associated with the commit.
<kbd><img src="./docs/pr_status_check.png"></img></kbd>

### Workflow Run
This is shown on the workflow run when the `create-status-check` is set to `true`.
<kbd><img src="./docs/workflow_status_check.png"></img></kbd>

### Failed Test Details
For failed test runs you can expand each failed test and view more details about the failure
<kbd><img src="./docs/failed_tests.png"></img></kbd>

## Inputs
| Parameter                      | Is Required | Default                          | Description                                                                                                                                                                         |
| ------------------------------ | ----------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-token`                 | true        | N/A                              | Used for the GitHub Checks API.  Value is generally: secrets.GITHUB_TOKEN.                                                                                                          |
| `base-directory`               | false       | `.` Root Directory of repository | The base directory of where to look for `trx` files.                                                                                                                                |
| `create-status-check`          | false       | true                             | Flag indicating whether a status check with code coverage results should be generated.                                                                                              |
| `create-pr-comment`            | false       | true                             | Flag indicating whether a PR comment with dotnet test results should be generated.  When `true` the default behavior is to update an existing comment if one exists.                |
| `create-results-file`          | false       | false                            | Flag indicating whether a results file in markdown format should be generated.                |
| `update-comment-if-one-exists` | false       | true                             | When `create-pr-comment` is true, this flag determines whether a new comment is created or if the action updates an existing comment if one is found which is the default behavior. |
| `ignore-test-failures`         | false       | `false`                          | When set to true the check status is set to `Neutral` when there are test failures and it will not block pull requests.                                                             |
| `timezone`                     | false       | `UTC`                            | IANA time zone name (e.g. America/Denver) to display dates in.                                                                                                                      |
| `comment-identifier`           | false       | ``                               | Used when there are multiple test projects that run separately but are part of the same CI run.                                                                              |
| `report-title-filter`          | false       |                                  | Sets the report title in markdown to the `Unit Test Name`. This splits the Unit Test Name by `.` and gets the next word in the name that you inputed in this field. To find test name(s) run `dotnet test --list-tests`                               |

## Outputs
| Output                   | Description                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test-outcome`           | Test outcome based on presence of failing tests: *Failed,Passed*<br/>If exceptions are thrown or if it exits early because of argument errors, this is set to Failed. |
| `trx-files`              | List of `trx` files that were processed                                                                                                                               |
| `test-results-file-path` | File path for test results file.  This will be `null` when the input `create-results-file` is set to `false`.                                            |

## Usage Examples

### Using the defaults
```yml
jobs:
  ci:
    runs-on: [ubuntu-20.04]
    steps:
      - uses: actions/checkout@v3

      - name: dotnet test with coverage
        run: dotnet test './src/MyProj.sln' --logger trx --configuration Release

      - name: Process trx reports with default
        if: always()
        # You may also reference just the major or major.minor version
        uses: im-open/process-dotnet-test-results@v2.2.7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Specifying additional behavior

```yml
jobs:
  advanced-ci:
    runs-on: [ubuntu-20.04]
    steps:
      - uses: actions/checkout@v3

      - name: Test My Solution
        continue-on-error: true
        run: dotnet test ./src/my-solution.sln --logger "trx" --configuration Release --results-directory ../../test-results
      
      - name: Process trx reports
        id: process-trx
        # You may also reference just the major or major.minor version
        uses: im-open/process-dotnet-test-results@v2.2.7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          base-directory: './test-results'              # Default: .
          create-status-check: true                     # Default: true
          create-pr-comment: true                       # Default: true
          update-comment-if-one-exists: true            # Default: true
          ignore-test-failures: true                    # Default: false
          timezone: 'america/denver'                    # Default: UTC
          comment-identifier: 'bff-tests'               # Default: empty string
      
      - run: ./do-other-advanced-things-in-the-build.sh

      - name: Fail if there were test problems
        if: steps.process-trx.outputs.test-outcome == 'Failed'
        run: |
          echo "There were test failures."
          exit 1
```

### Using create-results-file

```yml
jobs:
  ci:
    runs-on: [ubuntu-20.04]
    steps:
      - uses: actions/checkout@v3

      - name: dotnet test with coverage
        run: dotnet test './src/MyProj.sln' --logger trx --configuration Release

      - name: Process trx reports with default
        if: always()
        id: process-test
        # You may also reference just the major or major.minor version
        uses: im-open/process-dotnet-test-results@v2.2.7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          create-status-check: false        
          create-pr-comment: false
          create-results-file: true
          report-title-filter: "Tests" 
          # Run dotnet test --list-tests to identify which name to put in.  
          # For Example: If the test name is MyProject.Automation.Tests.MyTestGroup.CheckforButton. Use "Tests" for the input and the report will show "MyTestGroup".

      - name: Annotate Test Results
        run: cat ${{ steps.process-test.outputs.test-results-file-path }} > $GITHUB_STEP_SUMMARY
```

## Contributing

When creating new PRs please ensure:

1. For major or minor changes, at least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version](#incrementing-the-version).
1. The action code does not contain sensitive information.

When a pull request is created and there are changes to code-specific files and folders, the build workflow will run and it will recompile the action and push a commit to the branch if the PR author has not done so. The usage examples in the README.md will also be updated with the next version if they have not been updated manually. The following files and folders contain action code and will trigger the automatic updates:

- action.yml
- package.json
- package-lock.json
- src/\*\*
- dist/\*\*

There may be some instances where the bot does not have permission to push changes back to the branch though so these steps should be done manually for those branches. See [Recompiling Manually](#recompiling-manually) and [Incrementing the Version](#incrementing-the-version) for more details.

### Recompiling Manually

If changes are made to the action's code in this repository, or its dependencies, the action can be re-compiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and
its dependencies into a single file located in the `dist` folder.

### Incrementing the Version

Both the build and PR merge workflows will use the strategies below to determine what the next version will be.  If the build workflow was not able to automatically update the README.md action examples with the next version, the README.md should be updated manually as part of the PR using that calculated version.

This action uses [git-version-lite] to examine commit messages to determine whether to perform a major, minor or patch increment on merge.  The following table provides the fragment that should be included in a commit message to active different increment strategies.
| Increment Type | Commit Message Fragment                     |
| -------------- | ------------------------------------------- |
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/master/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2021, Extend Health, LLC. Code released under the [MIT license](LICENSE).

[NasAmin/trx-parser]: https://github.com/NasAmin/trx-parser#%EF%B8%8F-github-actions-limitations-%EF%B8%8F
[limit]: https://github.com/github/docs/issues/3765
[git-version-lite]: https://github.com/im-open/git-version-lite
