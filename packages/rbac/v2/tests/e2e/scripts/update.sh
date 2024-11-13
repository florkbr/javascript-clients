#!/usr/bin/env bash

#
# Updates the OpenAPI spec with the necessary CORS headers so that the e2e tests will function properly.
#
# The script expects to execute from the packages/rbac/tests/e2e folder.
#
# The process looks like this:
#   1. produce a mockoon config from the OpenAPI spec.
#   2. adds the CORS headers to the Mockoon config, taken from cors_headers.json
#   3. it re-exports the Mockoon config as an OpenAPI spec to be used at run time.
#
# The final, updated OpenAPI spec is kept in /tmp/workspaces_openapi.json
#

# Clean up temp files
rm -f /tmp/workspaces.json
rm -f /tmp/workspaces_openapi.json
rm -f /tmp/workspaces_updated.json

echo "Updating the Mockoon config from the latest spec"
npx mockoon-cli import -i https://raw.githubusercontent.com/RedHatInsights/insights-rbac/refs/heads/master/docs/source/specs/v2/openapi.v2.yaml -o /tmp/workspaces.json -p

echo "Adding CORS headers to the Mockoon config"
jq -n 'input | .headers += [inputs.newHeaders][]' /tmp/workspaces.json cors_headers.json > /tmp/workspaces_updated.json

echo "Updated header values are:"
jq '.headers' /tmp/workspaces_updated.json

#echo "Re-exporting the OpenAPI spec"
#npx mockoon-cli export --input /tmp/workspaces_updated.json --output /tmp/workspaces_openapi.json --prettify


