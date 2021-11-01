// Normal Mode
(async () => {
    console.log(await require('../index')());
})();

// Tracker Mode
setInterval(async () => console.log(await require('../index')()), 10000);