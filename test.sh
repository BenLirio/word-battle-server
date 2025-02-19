#!/bin/bash
curl \
  --request POST \
  --url http://localhost:3000/dev/app \
  --header 'Content-Type: application/json' \
  --data @request_body.json