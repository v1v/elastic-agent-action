[![GitHub release](https://img.shields.io/github/release/v1v/elastic-agent-action.svg?style=flat-square)](https://github.com/v1v/elastic-agent-action/releases/latest)
[![CI Workflow](https://github.com/v1v/elastic-agent-action/actions/workflows/ci.yml/badge.svg)](https://github.com/v1v/elastic-agent-action/actions/workflows/ci.yml)
[![Test workflow](https://github.com/v1v/elastic-agent-action/actions/workflows/test.yml/badge.svg)](https://github.com/v1v/elastic-agent-action/actions/workflows/test.yml)

## About

This action installs the [Elastic Agent](https://www.elastic.co/elastic-agent) to add monitoring for logs, metrics, and other types of data to the GitHub runner.

## What's new

Please refer to the [release page](https://github.com/v1v/elastic-agent-action//releases/latest) for the latest release notes.

## Usage

### Configuration

To authenticate against [Fleet Server](https://www.elastic.co/guide/en/fleet/current/fleet-server.html).

<!-- start usage -->
```yaml
- uses: v1v/elastic-agent-action@v2
  with:

    # The server address of Fleet Server
    #
    # We recommend using a GitHub secret.
    fleetUrl: ''

    # The enrollment token used to log against the Fleet Server
    #
    # We recommend using a GitHub secret.
    enrollmentToken: ''

    # What Elastic Agent is to be installed?
    # Default: latest
    version: ''

    # What Elastic Agent name
    # Default: ${GITHUB_RUN_NUMBER}.${GITHUB_RUN_ID}
    agentName: ''

    # Log out from the Fleet Server at the end of a job
    # Default: true
    logout: ''
```
<!-- end usage -->


## Fleet UI

Every single runner will be presented as below in the Elastic Fleet UI.

![image info](docs/images/fleet-ui.png)
