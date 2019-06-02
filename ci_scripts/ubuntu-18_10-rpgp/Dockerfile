FROM ubuntu:18.10

ENV BUILDER_NAME="ubuntu-18_10-rpgp"

# Update system
RUN true \
    && apt update \
    && apt -y upgrade

# Install nvm & node
COPY ./install-nvm-node.sh /tmp
RUN chmod +x ./tmp/install-nvm-node.sh && /tmp/install-nvm-node.sh

# Install @sqdependencies to build deltachat-core
RUN apt -y install g++- libssl-dev libsqlite3-dev libbz2-dev zlib1g-dev python3-dev unzip  cmake pkg-config libsasl2-dev

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

# Install dependencies for deltachat-node
RUN apt -y install python2


# Install rust for rpgp
RUN true \
    && apt -y install curl \
    && curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly-2019-03-23 -y

ENV PATH=/root/.cargo/bin:$PATH

# Install rust
COPY ./install-rust.sh /tmp
RUN chmod +x ./tmp/install-rust.sh && /tmp/install-rust.sh
ENV PATH=/root/.cargo/bin:$PATH

# Build and install rpgp
COPY ./build-install-rpgp.sh /tmp
RUN chmod +x ./tmp/build-install-rpgp.sh && /tmp/build-install-rpgp.sh
