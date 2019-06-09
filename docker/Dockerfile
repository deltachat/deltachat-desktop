FROM debian:stretch

# Update apt repositories
RUN apt-get update && \
    apt-get upgrade -y \
    && apt-get install -y zip \
                          curl \
                          python \
                          python3-pip \
                          build-essential \
                          git \
                          pkg-config \
                          autoconf \
                          libtool \
                          zlib1g-dev \
                          libbz2-dev \
                          libsqlite3-dev \
                          libssl-dev

# Install meson and ninja
ENV NINJA_VERSION v1.9.0
ENV NINJA_SHA256 1b1235f2b0b4df55ac6d80bbe681ea3639c9d2c505c7ff2159a3daf63d196305
RUN curl -L -o ninja-linux-${NINJA_VERSION}.zip https://github.com/ninja-build/ninja/releases/download/${NINJA_VERSION}/ninja-linux.zip
RUN echo "${NINJA_SHA256}  ninja-linux-${NINJA_VERSION}.zip" | sha256sum -c -
RUN unzip ninja-linux-${NINJA_VERSION}.zip
RUN mv ninja /usr/bin/ninja
RUN chmod +x /usr/bin/ninja
RUN pip3 install meson

# Need a new zlib because node does not get on with the one shipped in
# debian stretch
ENV ZLIB_VERSION 1.2.11
ENV ZLIB_SHA256 c3e5e9fdd5004dcb542feda5ee4f0ff0744628baf8ed2dd5d66f8ca1197cb1a1
RUN curl -O https://www.zlib.net/zlib-${ZLIB_VERSION}.tar.gz
RUN echo "${ZLIB_SHA256}  zlib-${ZLIB_VERSION}.tar.gz" | sha256sum -c -
RUN tar -xzf zlib-${ZLIB_VERSION}.tar.gz
RUN cd zlib-${ZLIB_VERSION} && ./configure
RUN cd zlib-${ZLIB_VERSION} && make
RUN cd zlib-${ZLIB_VERSION} && make install
RUN ldconfig -v

# Install node.js using shared zlib and libssl.  This is important
# because these libraries are a shared dependency between libssl and
# libdeltchat and they all end up in the same address space.
ENV NODEJS_VERSION v10.15.3
ENV NODEJS_SHA256 db460a63d057ac015b75bb6a879fcbe2fefaaf22afa4b6f6445b9db61ce2270d
RUN curl -L -O https://nodejs.org/dist/v10.15.3/node-${NODEJS_VERSION}.tar.gz
RUN tar -xzf node-${NODEJS_VERSION}.tar.gz
RUN cd node-${NODEJS_VERSION} && \
    ./configure --shared-openssl \
                --shared-zlib
RUN cd node-${NODEJS_VERSION} && make -j $(nproc)
RUN cd node-${NODEJS_VERSION} && make install
RUN ldconfig -v

# Install cyrus-sasl
ENV SASL_VERSION 2.1.27
ENV SASL_SHA256 26866b1549b00ffd020f188a43c258017fa1c382b3ddadd8201536f72efb05d5
RUN curl -O https://www.cyrusimap.org/releases/cyrus-sasl-${SASL_VERSION}.tar.gz
RUN echo "${SASL_SHA256}  cyrus-sasl-${SASL_VERSION}.tar.gz" | sha256sum -c -
RUN tar zxf cyrus-sasl-${SASL_VERSION}.tar.gz
RUN cd cyrus-sasl-${SASL_VERSION} && \
    ./configure --enable-shared \
                --disable-cmulocal \
                --disable-sample \
                --disable-obsolete_cram_attr \
                --disable-obsolete_digest_attr \
                --disable-alwaystrue \
                --enable-checkapop \
                --enable-cram \
                --enable-digest \
                --enable-scram \
                --enable-plain \
                --enable-anon \
                --enable-login
RUN cd cyrus-sasl-${SASL_VERSION} && make -j $(nproc)
RUN cd cyrus-sasl-${SASL_VERSION} && make install
RUN ldconfig -v

# Install libetpan
ENV ETPAN_VERSION 1.9.1
ENV ETPAN_SHA256 f5e354ccf1014c6ee313ade1009b8a82f28043d2504655e388bb4c1328700fcd
RUN curl -L -o libetpan-${ETPAN_VERSION}.tar.gz \
    https://github.com/dinhviethoa/libetpan/archive/${ETPAN_VERSION}.tar.gz
RUN echo "${ETPAN_SHA256}  libetpan-${ETPAN_VERSION}.tar.gz" | sha256sum -c -
RUN tar xzf libetpan-${ETPAN_VERSION}.tar.gz
RUN cd libetpan-${ETPAN_VERSION} && \
    ./autogen.sh && \
    ./configure --disable-silent-rules \
                --enable-ipv6 \
                --enable-iconv \
                --disable-db \
                --with-openssl \
                --with-sasl \
                --with-zlib \
                --without-curl \
                --without-expat
RUN cd libetpan-${ETPAN_VERSION} && make -j $(nproc)
RUN cd libetpan-${ETPAN_VERSION} && make install
RUN ldconfig -v

# Configure ld.so to look in /usr/local/lib/x86_64-linux-gnu/
RUN echo /usr/local/lib/x86_64-linux-gnu/ > /etc/ld.so.conf.d/local.conf

# Install rust for rpgp
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh -s -- --default-toolchain nightly -y
ENV PATH=/root/.cargo/bin:$PATH

# Install rpgp
RUN RPGP_VERSION 0.2.1
RUN git clone --branch $RPGP_VERSION --depth 1 https://github.com/rpgp/rpgp.git
RUN echo "rpgp ${RPGP_VERSION}"
RUN cd rpgp/pgp-ffi && make install
RUN ldconfig -v

CMD /usr/bin/tail -f /dev/null
