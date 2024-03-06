#!/bin/bash

replicaSetId=rs0
mongo=mongo
port=27017

echo "###### Waiting for ${mongo} instance startup..."

until mongosh --host ${mongo}:${port} --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
  printf '.'
  sleep 1
done

echo "###### Working ${mongo} instance found, initiating user setup & initializing rs setup..."

mongosh --host ${mongo}:${port} -u root -p pwd --authenticationDatabase admin /mongo-init-replica-set.js
