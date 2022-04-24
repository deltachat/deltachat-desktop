FROM node:latest

RUN apt-get update
RUN apt-get install -y git

RUN git clone  https://github.com/AdrianDabAGH/deltachat-desktop-fork.git

WORKDIR deltachat-desktop-fork

RUN npm install
RUN npm run build
