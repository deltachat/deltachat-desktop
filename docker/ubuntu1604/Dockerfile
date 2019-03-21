FROM ubuntu:xenial


# Update system
RUN true \
    && apt update \
    && apt -y upgrade

# Install nvm & node
RUN true \
    && apt -y install wget git \
    && wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && nvm install v10

# Install @sqdependencies to build deltachat-core
RUN apt -y install g++- libssl-dev libsqlite3-dev libbz2-dev zlib1g-dev python3.5-dev python-software-properties unzip  cmake pkg-config libsasl2-dev

# Install meson
RUN  true \
     && apt -y install python3-pip python3.5 \
     && pip3 install meson

# Install ninja
RUN true \
    && apt install unzip \
    && wget https://github.com/ninja-build/ninja/releases/download/v1.8.2/ninja-linux.zip \
    && unzip ninja-linux.zip \
    && cp ninja /usr/bin

# Set the working directory to /app
WORKDIR /build

# Copy the current directory contents into the container at /app
COPY . /build

#RUN bash -i -c 'npm install --build-from-source'
#RUN bash -i -c 'npm run build'
#RUN bash -i -c './node-modules/.bin/electron-builder --linux deb'

# Don't stop docker
CMD tail -f /dev/null

