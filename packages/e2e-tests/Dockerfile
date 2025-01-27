FROM node:20.11-bullseye-slim

ARG uid
ARG gid

RUN apt update && apt upgrade -y && apt install -y git

# add a user "noone" with the same uid and gid as the host user
RUN groupadd -g $gid -o noone
RUN useradd -ms /bin/bash -u $uid -g $gid noone

RUN npm install -g pnpm

# Copy the package.json to install playwright to make sure we use
# the same version as in the project
COPY ./packages/e2e-tests/package.json /tmp/package.json

WORKDIR /tmp

RUN pnpm install

# Install playwright dependencies as root
RUN npx playwright install --with-deps --only-shell chromium

# move headless browsers to noone's home directory
RUN cp -r /root/.cache /home/noone/

# allow noone to use the cached browser binaries
RUN chown -R noone:noone /home/noone/.cache

# Clean up to keep the image small
RUN rm -rf /root/.cache/ms-playwright

RUN rm -rf node_modules

WORKDIR /app
