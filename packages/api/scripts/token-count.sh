#!/usr/bin/env sh

# This counts tokens returned from the server. Useful when checking to see if the database data persists.
API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY1MDA3QTczOWFiN0FDNWM1MzcxNjEyNDliODEyNTBFNDllMjg1M0MiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzOTc1NDczNjYzOCwibmFtZSI6Im1haW4ifQ.wKwJIRXXHsgwVp8mOQp6r3_F4Lz5lnoAkgVP8wqwA_Y
curl -vvvv 'localhost:8787/internal/tokens' -H "Authorization: Bearer $API_KEY" -H 'content-type: application/json' | jq '.value | length'
