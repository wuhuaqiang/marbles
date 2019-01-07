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
}, 3000);
let chargingTimer = setInterval(function () {
    if (!Bmap.chargingCarQueue.empty() && Bmap.chargingCarQueue.front() != Bmap.currChargingCar) {
        charging(Bmap.chargingCarQueue.front());
        Bmap.currChargingCar = Bmap.chargingCarQueue.front();
    }
}, 1000);

function saveSystemSetting() {
    let param = {id: Bmap.simulationId, timeStart: Bmap.systemTime, k: Bmap.ffRatio};
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tSystemsetting/save/",
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data);
        },
        error: function (data) {
            console.log(data);
        }
    });
}
