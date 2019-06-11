FROM debian:stretch

# Configure ld.so to look in /usr/local/lib/x86_64-linux-gnu/
RUN echo /usr/local/lib/x86_64-linux-gnu/ > /etc/ld.so.conf.d/local.conf

# Install nvm & node
COPY ./install-nvm-node.sh /tmp
RUN chmod +x ./tmp/install-nvm-node.sh && /tmp/install-nvm-node.sh

# Install dependencies for deltachat-node
RUN apt -y install python

# Install rust
COPY ./install-rust.sh /tmp
RUN chmod +x ./tmp/install-rust.sh && /tmp/install-rust.sh
ENV PATH=/root/.cargo/bin:$PATH

CMD tail -f /dev/null
