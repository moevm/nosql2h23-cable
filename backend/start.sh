#!/bin/sh
while ! nc -z db 7687; do sleep 5; done
node main