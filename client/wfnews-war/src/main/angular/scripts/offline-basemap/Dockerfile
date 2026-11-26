ARG TIPPECANOE_VERSION=2.79.0

FROM ubuntu:24.04 AS tippecanoe-builder
ARG TIPPECANOE_VERSION
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl g++ libsqlite3-dev make zlib1g-dev \
  && curl -fsSL "https://github.com/felt/tippecanoe/archive/refs/tags/${TIPPECANOE_VERSION}.tar.gz" \
     | tar -xz -C /tmp \
  && make -C "/tmp/tippecanoe-${TIPPECANOE_VERSION}" -j"$(nproc)" tile-join

FROM protomaps/go-pmtiles:latest AS pmtiles

FROM ubuntu:24.04
ARG TIPPECANOE_VERSION
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates libsqlite3-0 zlib1g \
  && rm -rf /var/lib/apt/lists/*
COPY --from=pmtiles /go-pmtiles /usr/local/bin/pmtiles
COPY --from=tippecanoe-builder /tmp/tippecanoe-${TIPPECANOE_VERSION}/tile-join /usr/local/bin/tile-join
WORKDIR /work
