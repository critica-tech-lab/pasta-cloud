#### BUILD PHASE ####
FROM node:lts-alpine AS builder
ARG ETHERSYNC_VERSION=v0.8.0
WORKDIR /pasta-cloud/node

# Install Ethersync
ADD install.sh /tmp
RUN sh /tmp/install.sh

# Build Pasta Cloud
ADD node /pasta-cloud
RUN npm ci && npm run build

#### FINAL IMAGE ####
FROM node:lts-alpine
WORKDIR /pasta

COPY --from=builder /pasta-cloud/dist/main.js /usr/local/bin/pasta-cloud
COPY --from=builder /pasta-cloud/ethersync /usr/local/bin/ethersync

# Ensure binaries can be executed
RUN chmod +x /usr/local/bin/pasta-cloud
RUN chmod +x /usr/local/bin/ethersync

USER node
EXPOSE 8000
ENTRYPOINT ["pasta-cloud", "start", "-d", "/pasta", "-p", "8000"]
