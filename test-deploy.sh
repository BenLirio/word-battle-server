#!/bin/bash
curl \
  --request POST \
  --url https://htbgzenw76.execute-api.us-east-1.amazonaws.com/dev/app \
  --header 'Content-Type: application/json' \
  --data @request_body.json