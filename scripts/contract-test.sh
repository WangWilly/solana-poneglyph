#!/bin/bash

PROJ_DIR=$(pwd)/contract

# Test the contract
cd $PROJ_DIR

# anchor build

# cargo test
anchor test
