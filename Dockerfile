
#
# 1 single fat container for hosting demo in 1 Clever Cloud instance ;)
#


FROM prom/prometheus:v2.2.1 AS prometheus


# get demo app
FROM samber/node-promfiler-demo

# get prometheus
COPY --from=prometheus /bin/prometheus /bin/prometheus
COPY --from=prometheus /etc/prometheus /etc/prometheus
COPY demo/prometheus.yml /etc/prometheus/prometheus.yml

# get grafana
ARG DOWNLOAD_URL="https://s3-us-west-2.amazonaws.com/grafana-releases/master/grafana_latest_amd64.deb"
RUN apt-get update && \
    apt-get -y --no-install-recommends install libfontconfig curl ca-certificates && \
    apt-get clean && \
    curl ${DOWNLOAD_URL} > /tmp/grafana.deb && \
    dpkg -i /tmp/grafana.deb && \
    rm /tmp/grafana.deb && \
    curl -L https://github.com/tianon/gosu/releases/download/1.10/gosu-amd64 > /usr/sbin/gosu && \
    chmod +x /usr/sbin/gosu && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*
COPY demo/grafana.sh /grafana.sh
COPY demo/grafana.db /var/lib/grafana/grafana.db
COPY dist/ /var/lib/grafana/plugins/grafana-flamegraph-panel

# get containerpilot
RUN wget https://github.com/joyent/containerpilot/releases/download/3.7.0/containerpilot-3.7.0.tar.gz \
    && tar xvf containerpilot-3.7.0.tar.gz \
    && rm containerpilot-3.7.0.tar.gz \
    && mv containerpilot /bin/containerpilot
COPY demo/containerpilot.json /etc/containerpilot.json

CMD /bin/containerpilot -config /etc/containerpilot.json
ENV HTTP_PORT=4242
