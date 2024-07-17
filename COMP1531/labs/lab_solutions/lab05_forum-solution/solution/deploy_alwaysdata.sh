#!/usr/bin/env bash

set -o xtrace

WORKING_DIRECTORY="www/lab05_forum"
USERNAME="comp1531forum"
SSH_HOST="ssh-comp1531forum.alwaysdata.net"

# Can also use scp but this is more efficient.
rsync\
    --archive\
    --verbose\
    --progress\
    package.json package-lock.json ./tsconfig.json ./src\
    $USERNAME@$SSH_HOST:$WORKING_DIRECTORY

ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --only=production"
