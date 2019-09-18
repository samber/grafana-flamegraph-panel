# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/bionic64"
  config.vm.box_check_update = false

  config.vm.define :grafana_flamegraph do |grafana_flamegraph|
        grafana_flamegraph.vm.network "private_network", ip: "172.16.2.77"
        grafana_flamegraph.vm.host_name = "local-grafana-flamegraph-clickhouse-pro"
  end

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    vb.gui = false

    # Customize the amount of memory on the VM:
    vb.memory = "2048"
  end
  config.vm.provision "shell", inline: <<-SHELL
    set -xeuo pipefail
    sysctl net.ipv6.conf.all.forwarding=1
    apt-get update
    apt-get install -y apt-transport-https ca-certificates software-properties-common curl
    # clickhouse
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E0C56BD4
    # gophers
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 136221EE520DDFAF0A905689B9316A7BC7917B12
    # docker
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8D81803C0EBFCD88
    add-apt-repository "deb http://repo.yandex.ru/clickhouse/deb/stable/ main/"
    add-apt-repository "deb https://download.docker.com/linux/ubuntu bionic edge"
    apt-get update
    apt-get install -y docker-ce
    apt-get install -y clickhouse-client
    apt-get install -y python-pip
    apt-get install -y htop ethtool mc
    python -m pip install -U pip
    pip install -U docker-compose
    cd /vagrant/demo
    docker-compose down
    docker system prune -f
    docker-compose up -d
  SHELL
end
