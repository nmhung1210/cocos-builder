#!/bin/bash

Xvfb -ac -screen scrn 640x960x24 :9.0 &
export DISPLAY=:9.0

npx electron . --disable-gpu --path /project $@

exit $?