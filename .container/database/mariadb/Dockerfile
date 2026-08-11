ARG MARIADB_BASE_IMAGE
FROM ${MARIADB_BASE_IMAGE}

ARG CXSHOP_VERSION
LABEL org.opencontainers.image.title="CODEXSUN MariaDB" \
      org.opencontainers.image.version="$CXSHOP_VERSION"

COPY .container/database/mariadb/50-cxshop-server.cnf /etc/mysql/mariadb.conf.d/50-cxshop-server.cnf
COPY .container/database/mariadb/10-cxshop-grants.sh /docker-entrypoint-initdb.d/10-cxshop-grants.sh
