#!/bin/bash

rm -rf bin
mkdir bin
g++ -march=native -Ofast *.c -o bin/beamsum
