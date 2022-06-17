FROM node:16
MAINTAINER sikai.zhang@17zuoye.com
WORKDIR /app
COPY . /app
RUN npm install
USER root
ENTRYPOINT ["pm2", "start", "all"]
