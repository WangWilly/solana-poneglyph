#!/bin/bash

export PROJ_DIR=$(pwd)/backend

isDev=$(echo $1 | tr '[:upper:]' '[:lower:]')

# Load environment variables from the .env file
if [ "$isDev" = "dev" ]; then
    echo "Running in development mode"
    set -a && source ${PROJ_DIR}/dev.env && set +a

    # Start the backend server
    cd ${PROJ_DIR}
    cargo run
else
    echo "Running in production mode"
fi
