//var sleep = require("sleep");
//var exec = require('child_process').exec;
//var Storage = require('node-storage');
//var store = new Storage('storage');
var bonjour = require('bonjour')()

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

bonjour.find({ name: 'device-service-server' }, function (service) {
  var socket = require('socket.io-client')
    (`http://${service.addresses[0]}:${service.port}`);

  socket.on('connect', function(){
    console.log("SOCKET SERVER CONNECTED");
    setInterval(() => {
      getSysInfo().then(data => socket.emit('client-info', data));
    }, 3000);
  });

  // socket.on('update', function(){
  // 	exec('git pull', (err, stdout, stderr) => {
  // 	  if (err) {
  // 	    console.error(err);
  // 	    return;
  // 	  }
  // 	  console.log(stdout);
  // 	});
  // });
  socket.on('disconnect', function(){console.log("SOCKET SERVER DISCONNECTED")});
})
