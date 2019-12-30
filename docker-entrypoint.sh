#!/bin/bash
set -e

if [ "$1" = 'cocos-creator' ]; then
  Xvfb -ac -screen scrn 1024x768x24 :9.0 &
  export DISPLAY=:9.0
  set -- npm start "$@"
fi

exec "$@"
