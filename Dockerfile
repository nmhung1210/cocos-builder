FROM nmhung1210/node8-x11

LABEL maintainer="nmhung1210@gmail.com"
LABEL version="2.1.4"

COPY . /cocos

RUN cd /cocos \
  && npm i \
  && npm link \
  && cd creator \
  && npm i \
  && ./node_modules/.bin/electron-rebuild \
  && cd /cocos/engine \
  && npm i \
  && npm run build

VOLUME [ "/project" ]
WORKDIR /project

CMD [ "cocos-creator" ]



