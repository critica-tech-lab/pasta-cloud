ARCH=$(uname -m)
TARBALL_URL=https://github.com/ethersync/ethersync/releases/download/$ETHERSYNC_VERSION/ethersync-$ARCH-unknown-linux-musl.tar.gz

wget -O /tmp/ethersync.tar.gz $TARBALL_URL
tar xvfz /tmp/ethersync.tar.gz -C /pasta-cloud ethersync
