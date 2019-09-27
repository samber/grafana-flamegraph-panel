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
    # docker
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8D81803C0EBFCD88
    echo "deb https://download.docker.com/linux/ubuntu bionic edge" > /etc/apt/sources.list.d/docker.lst
    # nodejs
    curl -sL https://deb.nodesource.com/setup_10.x | bash -
		
    apt-get install -y docker.io
    apt-get install -y python-pip
    apt-get install -y htop ethtool mc
    python -m pip install -U pip
    pip install -U docker-compose
    cd /vagrant/
    npm install
    npm run-script build
    cd /vagrant/demo
    docker-compose down
    docker system prune -f
    docker-compose up -d
  SHELL
end
