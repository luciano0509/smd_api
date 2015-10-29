FROM node:4.2.1

ADD . /smd_api
WORKDIR /smd_api

RUN npm install