FROM node:latest

RUN apt-get update
RUN apt-get install -y git

RUN git clone https://github.com/AdrianDabAGH/deltachat-desktop-fork.git

WORKDIR deltachat-desktop
RUN git checkout devops7
RUN npm install
RUN npm run build
