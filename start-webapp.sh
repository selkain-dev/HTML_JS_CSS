#!/bin/bash

# Dodaj pełną ścieżkę do nvm Node/npm/nodemon
export PATH=/Users/s/.nvm/versions/node/v20.20.0/bin:$PATH

cd /Users/s/webapp

# Uruchom backend z nodemon w trybie foreground
nodemon server.js
