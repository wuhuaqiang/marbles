let taskTimer = setInterval(function () {
    if (!Bmap.userIdQueue.empty() && Bmap.userIdQueue.front() != Bmap.currTaskCar) {
        /*console.log(Bmap.userIdQueue.toString());*/
        Bmap.currTaskCar = Bmap.chargingCarQueue.front();
        console.log("*********************************************************");
        console.log(Bmap.userIdQueue.front());
        console.log(Bmap.currTaskCar);
        console.log("*********************************************************");
        Task.startTask(Bmap.userIdQueue.front())

    }
}, 1000);
let chargingTimer = setInterval(function () {
    if (!Bmap.chargingCarQueue.empty() && Bmap.chargingCarQueue.front() != Bmap.currChargingCar) {
        charging(Bmap.chargingCarQueue.front());
        Bmap.currChargingCar = Bmap.chargingCarQueue.front();
    }
}, 1000);
