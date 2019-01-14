FROM node:10-alpine

# install yarn
RUN apk update && \
  apk upgrade \
  && apk add \
  yarn \
  bash \
  git \
  openssh \
  python \
  g++ \
  make \
  --no-cache

# install simple http server for serving static content
RUN yarn global add http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package.json yarn.lock ./

# install project dependencies
RUN yarn install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN yarn build:dapp

EXPOSE 8080
CMD [ "http-server", "dist" ]