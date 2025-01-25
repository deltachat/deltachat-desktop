FROM node:20.11

ARG uid
ARG gid

RUN apt update && apt upgrade -y
RUN groupadd -g $gid -o noone
RUN useradd -ms /bin/bash -u $uid -g $gid noone

RUN npm install -g pnpm
RUN pnpm config set store-dir /usr/local/pnpm-store

# Copy the package.json to install playwright
# /app is overriden by the volume mount in docker-compose.yml
# to the local WORKDIR
COPY ./packages/e2e-tests/package.json /app/package.json

WORKDIR /app

USER root

RUN git config --global --add safe.directory /app

RUN pnpm install

USER root

# Install playwright dependencies
RUN npx playwright install --with-deps --only-shell chromium

# move headless browsers to noone's home directory
RUN cp -r /root/.cache /home/noone/

RUN chown -R noone:noone /home/noone/.cache

# Clean up to keep the image small
RUN rm -rf /root/.cache/ms-playwright

RUN rm -rf node_modules
