#!/bin/bash

./build.sh
CHECK=$(./bin/beamsum *.txt)
VALUE=$(basename *.txt .txt)
if [[ $CHECK -eq $VALUE ]]; then
  echo "Looks good."
else
  echo "Check value is wrong. Should be $VALUE"
fi

