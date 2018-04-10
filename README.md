# [WIP] Grafana Flamegraph Panel

## Building flame graphs

[![Flame Graph Example](https://media.giphy.com/media/l41JMjBaxrZw1bqpi/giphy.gif)](http://spiermar.github.io/d3-flame-graph/)

Please read [Brendan Gregg's post](http://www.brendangregg.com/flamegraphs.html)

## Demo

**[Grafana live demo](http://grafana.flamegraph.samuel-berthe.fr/d/000000001/demo-flamegraph?orgId=1)**

To generate metrics on the "demo" service (docker samber/node-promfiler-demo), a cronjob executes requests on API regulary.

You will see some `pow()` calls in the graph.

## Live profiling

### Prometheus + NodeJS

[Prometheus exporter: Promfiler](github.com/samber/node-promfiler)

```
$ npm install -g promfiler
$ promfiler app.js
```

## Credits

This Grafana panel is based on the great library [d3-flamegraph](https://github.com/spiermar/d3-flame-graph), wrote by Spiermar. :clap: :clap:
