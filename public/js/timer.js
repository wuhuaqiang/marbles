let taskTimer = setInterval(function () {
    if (!Bmap.userIdQueue.empty() && Bmap.userIdQueue.front() != Bmap.currTaskCar) {
        /*console.log(Bmap.userIdQueue.toString());*/
        Bmap.currTaskCar = Bmap.chargingCarQueue.front();
        console.log("*********************************************************");
        console.log(Bmap.userIdQueue.front());
        console.log(Bmap.currTaskCar);
        console.log("*********************************************************");
        Task.startTask(Bmap.userIdQueue.front());
        console.error('task定时器执行任务');
    }
    console.log('task定时器')
}, 3000);
let chargingTimer = setInterval(function () {
    if (!Bmap.chargingCarQueue.empty() && Bmap.chargingCarQueue.front() != Bmap.currChargingCar) {
        charging(Bmap.chargingCarQueue.front());
        Bmap.currChargingCar = Bmap.chargingCarQueue.front();
        console.log(Bmap.currChargingCar);
        console.error('充电定时器执行充电');
    }
    console.log('充电定时器')
}, 1000);

function saveSystemSetting() {
    let param = {id: Bmap.simulationId, timeStart: Bmap.systemTime, k: Bmap.ffRatio};
    $.ajax({
        type: "post",
        url: BaseUrl+"/api/tSystemsetting/save/",
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
