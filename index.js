//var sleep = require("sleep");
//var exec = require('child_process').exec;
//var Storage = require('node-storage');
//var store = new Storage('storage');
var bonjour = require('bonjour')();
var socketio = require('socket.io-client');
var server;

const si = require('systeminformation');

function getSysInfo() {
  var sysinfo = {};
  var interface = "";

  return new Promise((resolve, reject) => {
    si.osInfo()
      .then(data => {
        sysinfo.hostname = data.hostname;
        sysinfo.arch = data.arch;

        return si.networkInterfaceDefault();
      })
      .then(defaultNetworkInterface => {
        interface = defaultNetworkInterface;

        return si.networkInterfaces();
      })
      .then(data => {
        var network = data.find((item) => { return item.iface == interface})
        sysinfo.ip = network.ip4;
        sysinfo.mac = network.mac;

        resolve(sysinfo);
      })
      .catch(error => reject(error))
  });
}

bonjour.findOne({ name: 'device-service-server' }, function (service) {
  if(server === undefined) {
    console.log('kiscica')
    server = socketio(`http://${service.addresses[0]}:${service.port}`);

    server.on('connect', function(){
      console.log("SOCKET SERVER CONNECTED");
    });

    server.on('client-info-request', () => {
      getSysInfo().then(data => server.emit('client-info-response', data));
    });

    server.on('disconnect', function(){
      console.log("SOCKET SERVER DISCONNECTED")
    });
  }
})
