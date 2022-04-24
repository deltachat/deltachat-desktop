FROM node:latest

RUN apt-get update
RUN apt-get install -y git

RUN git clone -b devops7 https://github.com/AdrianDabAGH/deltachat-desktop-fork.git

WORKDIR deltachat-desktop

RUN npm install
RUN npm run build
