#!/bin/bash

PROJ_DIR=$(pwd)/contract

# Test the contract
cd $PROJ_DIR
cargo test
