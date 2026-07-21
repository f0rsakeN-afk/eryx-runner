#!/bin/sh
set -e
rustc /code/main.rs -o /tmp/main && /tmp/main
