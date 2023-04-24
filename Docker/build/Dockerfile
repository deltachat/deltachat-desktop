FROM node:latest

RUN apt-get update
RUN apt-get install -y git

WORKDIR /usr/app
RUN git clone https://github.com/cholewa-p/deltachat.git
WORKDIR /usr/app/deltachat
RUN npm install
RUN npm run build

