#!/bin/sh
set -e
cd /tmp && cp /code/main.go main.go && go run main.go
