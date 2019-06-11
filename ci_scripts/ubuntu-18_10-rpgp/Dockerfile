FROM ubuntu:18.10

ENV BUILDER_NAME="ubuntu-18_10-rpgp"

# Update system
RUN true \
    && apt update \
    && apt -y upgrade

# Install nvm & node
COPY ./install-nvm-node.sh /tmp
RUN chmod +x ./tmp/install-nvm-node.sh && /tmp/install-nvm-node.sh

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
