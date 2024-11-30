#!/bin/bash

PROJ_DIR=$(pwd)/contract

# Build the contract
cd $PROJ_DIR
anchor build
