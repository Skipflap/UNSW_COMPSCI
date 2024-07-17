#!/usr/bin/env bash

WORKING_DIRECTORY="~/www/cs1531forum"

# NOTE: change the credentials below as appropriate. the 
# The SSH_HOST can be found at the top of Remote Access -> SSH in Alwaysdata.
USERNAME="anythingyouwant"
SSH_HOST="ssh-anythingyouwant.alwaysdata.net" 

scp -r ./package.json ./tsconfig.json ./src "$USERNAME@$SSH_HOST:$WORKING_DIRECTORY"
ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --only=production"

