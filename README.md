# [WIP] Grafana Flamegraph Panel

## Demo with Prometheus

Grafana demo: http://163.172.88.81:3000
- login: admin
- password: admin

To generate metrics on the "demo" service, execute many times:

```
$ curl http://163.172.88.81:8080/
```

You will see some `pow()` calls in the graph.

Metrics are collected every 30 secondes, plz keep waiting if `pow()` is not shown on the flame graph.

## Live profiling

### NodeJS

[Prometheus exporter: Promfiler](github.com/samber/node-promfiler)

```
$ npm install -g promfiler
$ promfiler app.js
```
