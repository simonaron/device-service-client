var bonjour = require('bonjour')();
var socketio = require('socket.io-client');
var si = require('systeminformation');
var server;


function getSysInfo() {
  var sysinfo = {};
  var iface = "";

  return new Promise((resolve, reject) => {
    si.osInfo()
      .then(data => {
        sysinfo.hostname = data.hostname;
        sysinfo.arch = data.arch;

        return si.networkInterfaceDefault();
      })
      .then(defaultNetworkInterface => {
        iface = defaultNetworkInterface;

        return si.networkInterfaces();
      })
      .then(data => {
        var network = data.find((item) => { return item.iface == iface})
        sysinfo.ip = network.ip4;
        sysinfo.mac = network.mac;

        resolve(sysinfo);
      })
      .catch(error => reject(error))
  });
}

bonjour.findOne({ type: 'device-service-server' }, function (service) {
  if(server === undefined) {
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
