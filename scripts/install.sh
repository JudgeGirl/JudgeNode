#!/bin/bash


echo "Install Package"
sudo apt-get install nodejs-legacy npm -y
sudo apt-get install mysql-server -y

# install JudgeNode package from npm

echo "Nodejs Package"

cd ../ && npm install
cd -

sudo npm install -g bower
sudo npm install -g gulp

cd ../ && bower install
cd -
cd ../ && gulp build

## setting https for test

echo "https keygen"

cd -
./https_keygen.sh

## end

echo 'Please write the _config.yml like _DEFAULTconfig.yml'
