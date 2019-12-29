FROM node:8-slim as builder

WORKDIR /cocos

COPY creator/package.json creator/package.json

RUN apt-get -y update && apt-get -y install git python2.7 python-pip build-essential

RUN cd /cocos/creator && npm i

FROM node:8-slim

COPY . /cocos
COPY --from=builder /cocos/creator/node_modules /cocos/creator/node_modules
COPY docker-entrypoint.sh /usr/local/bin/

RUN apt-get -y update \
  && apt-get -y install wget \
  unzip \
  fontconfig \
  locales \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libnss3 \
  lsb-release \
  xdg-utils \
  xvfb \
  libvips42 \
  curl

RUN chmod a+x /usr/local/bin/docker-entrypoint.sh

WORKDIR /cocos/creator

VOLUME [ "/project" ]

ENV PLATFORM="web-mobile"

ENTRYPOINT ["docker-entrypoint.sh"]



