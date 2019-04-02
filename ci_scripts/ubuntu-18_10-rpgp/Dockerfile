FROM ubuntu:18.10

ENV BUILDER_NAME="ubuntu-18_10-rpgp"

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
    && curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly -y

ENV PATH=/root/.cargo/bin:$PATH

# Install rpgp
RUN true \
    && cd / \
    && git clone https://github.com/rpgp/rpgp.git

# As rpgp is currently a huge github repo, split built into two layers
RUN true \
    && cd /rpgp/pgp-ffi \
    && PREFIX=/opt/DeltaChat/rpgp make install


# Set the working directory to /app
WORKDIR /build-context

COPY . /build-context

RUN chmod +x /build-context/*.sh


