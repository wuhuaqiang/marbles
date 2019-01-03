//时间转字符串
function dateToString(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();
    let day = (date.getDate()).toString();
    if (month.length == 1) {
        month = "0" + month;
    }
    if (day.length == 1) {
        day = "0" + day;
    }
    let dateTime = year + "-" + month + "-" + day;
    return dateTime;
}

function chargingCar(carMk) {
    let ret = true;
    for (let i = 0; i < Bmap.chargingCarMark.length; i++) {
        if (carMk == Bmap.chargingCarMark[i]) {
            ret = false;
        }
    }
    return ret;
}

function checkHelpCar(carMk) {
    let ret = false;
    for (let i = 0; i < Bmap.helpCar.length; i++) {
        if (carMk == Bmap.helpCar[i]) {
            ret = true;
        }
    }
    return ret;
}

//字符串转时间
function stringToDate(dateStr, separator) {
    if (!separator) {
        separator = "-";
    }
    let dateArr = dateStr.split(separator);
    let year = parseInt(dateArr[0]);
    let month;
    //处理月份为04这样的情况
    if (dateArr[1].indexOf("0") == 0) {
        month = parseInt(dateArr[1].substring(1));
    } else {
        month = parseInt(dateArr[1]);
    }
    let day = parseInt(dateArr[2]);
    let date = new Date(year, month - 1, day);
    return date;
}

//获得详细线路点数组
function getDetailPints(points, stepLat, stepLng) {
    const newPoints = new Array();
    let latNew = 0;
    let lngNew = 0;
    for (let i = 0; i < (points.length - 1); i++) {
        const latF = points[i].lng;
        const lngF = points[i].lat;
        const latE = points[i + 1].lng;
        const lngE = points[i + 1].lat;
        const dLat = Math.round(Math.abs(latF - latE) / stepLat, 0);
        let dLng = 0;
        if (!i) {
            newPoints.push(points[i]);
        }
        if (dLat) {
            dLng = Math.abs(lngF - lngE) / dLat;
        }
        if (Math.abs(latF - latE) < 0.000002 && Math.abs(lngF - lngE) > 0.0001) {
            dLng = Math.round(Math.abs(lngF - lngE) / stepLng, 0);
            for (let j = 0; j < dLng - 1; j++) {
                latNew = latF;
                if (lngF - lngE < 0) {
                    lngNew = Math.round((lngF + j * stepLng) * 1000000) / 1000000;
                } else {
                    lngNew = Math.round((lngF - j * stepLng) * 1000000) / 1000000;
                }
                const newPoint = new BMap.Point(latNew, lngNew);
                newPoints.push(newPoint);
            }
        } else {
            for (let m = 0; m < dLat - 1; m++) {
                if (latF - latE < 0) {
                    latNew = Math.round((latF + m * stepLat) * 1000000) / 1000000;
                } else {
                    latNew = Math.round((latF - m * stepLat) * 1000000) / 1000000;
                }
                if (lngF - lngE < 0) {
                    lngNew = Math.round((lngF + m * dLng) * 1000000) / 1000000;
                } else {
                    lngNew = Math.round((lngF - m * dLng) * 1000000) / 1000000;
                }
                const newPoint = new BMap.Point(latNew, lngNew);
                newPoints.push(newPoint);

            }
        }

        newPoints.push(points[i + 1]);
    }
    return newPoints;
}

// function setSystemTime(time) {
//     if (Bmap.systemTimeLable) {
//         Bmap.systemTimeLable.setContent(time);
//     } else {
//         let point = Bmap.map.getCenter();
//         var opts = {
//             position: Bmap.map.getBounds().xl,    // 指定文本标注所在的地理位置
//             offset: new BMap.Size(-1000, 30)    //设置文本偏移量
//         }
//         Bmap.systemTimeLable = new BMap.Label(time, opts);  // 创建文本标注对象
//         Bmap.systemTimeLable.setStyle({
//             color: "black",
//             fontSize: "16px",
//             fontWeight: "12px",
//             backgroundColor: "red",
//             height: "30px",
//             lineHeight: "30px",
//             fontFamily: "微软雅黑"
//         });
//         Bmap.map.addOverlay(Bmap.systemTimeLable);
//     }
//
// }
function setSystemTime() {
    $("#simulationSysTime").text(Bmap.systemTime);
    if (Bmap.systemTimer) {
        clearTimeout(Bmap.systemTimer);
    }
    Bmap.systemTimer = setInterval(function () {
        let split = Bmap.systemTime.split(":");
        let newTime = "";
        if (8 < parseInt(split[2]) && parseInt(split[2]) < 59) {
            newTime = parseInt(split[1]) + ":" + (parseInt(split[2]) + 1);
        }
        if (parseInt(split[2]) == 59) {
            newTime = (parseInt(split[1]) + 1) + ":00";
        }
        if (parseInt(split[2]) < 9) {
            newTime = parseInt(split[1]) + ":0" + (parseInt(split[2]) + 1);
        }
        if (parseInt(split[1]) < 10) {
            newTime = "0" + newTime;
        }
        if (newTime.split(":")[0] == 60) {
            //debugger;
            newTime = "00:" + newTime.split(":")[1];


            if (parseInt(split[0]) < 9) {
                split[0] = "0" + (parseInt(split[0]) + 1);
            } else {
                split[0] = (parseInt(split[0]) + 1);
            }


        }
        if (split[0] == 24) {
            Bmap.systemTime = "00:" + newTime;
        } else {
            Bmap.systemTime = split[0] + ":" + newTime;
        }
        $("#simulationSysTime").text(Bmap.systemTime);
        //setSystemTime(Bmap.systemTime);
    }, 1000 / Bmap.ffRatio);
}

function getCurrTimeSetSysTime() {
    var currDate = new Date();//获取系统当前时间
    const h = currDate.getHours();
    const m = currDate.getMinutes();
    const s = currDate.getSeconds()
    Bmap.systemTime = h + ":" + m + ":" + s;
    Bmap.ffRatio = 1;
    setSystemTime();

}

function startCharging(chargingCar) {

}

function charging(chargingCar) {
    if (chargingCar) {
        var driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: getMinimumTime});  // 驾车实例,并设置回调
        driving.search(chargingCar.getPosition(), Bmap.chargingStationPoints[Bmap.chargingStationIndex])
    }
}

function queryChargingStation() {
    var driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: getMinimumTime});  // 驾车实例,并设置回调
    driving.search(Bmap.chargingCar[Bmap.chargingCarIndex].getPosition(), Bmap.chargingStationPoints[Bmap.chargingStationIndex])
}

function getMinimumTime(results) {
    let plan = results.getPlan(0);
    let duration = plan.getDuration(true);
    let newMin = 0
    let newHour = 0
    if (duration.indexOf("小时") === -1) {
        newMin = parseInt(duration);
    } else if (duration.indexOf("分钟") === -1) {
        newHour = parseInt(duration.substring(0, duration.indexOf("小时")))
    } else {
        newHour = parseInt(duration.substring(0, duration.indexOf("小时")))
        newMin = parseInt(duration.substring(duration.indexOf("小时") + 2, duration.indexOf("分钟")))
    }
    let route = plan.getRoute(0);
    let pts = getDetailPints(route.getPath(), 0.0001, 0.00001);
    const currTimeLong = (newHour * 60 + newMin) * 60 * 1000;
    if (Bmap.minTime == -1) {
        Bmap.minTime = currTimeLong;
        // Bmap.nearestPoint = Bmap.chargingStationPoints[Bmap.chargingStationIndex];
        Bmap.nearestPoint = pts;
    } else if (Bmap.minTime > currTimeLong) {
        Bmap.minTime = currTimeLong;
        Bmap.nearestPoint = pts;
    }
    if (Bmap.chargingStationIndex < Bmap.chargingStationPoints.length - 1) {
        Bmap.chargingStationIndex++;
        charging(Bmap.currChargingCar);
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        console.log(Bmap.chargingCarQueue.front())
        console.log(Bmap.nearestPoint)
        console.log(Bmap.minTime)
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        // } else if (Bmap.chargingCarIndex < Bmap.chargingCar.length - 1) {
        //     Bmap.chargingStationIndex = 0;
        //     const mapping = {
        //         carMk: Bmap.chargingCar[Bmap.chargingCarIndex],
        //         minTime: Bmap.minTime,
        //         nearestPoint: Bmap.nearestPoint,
        //         pts: Bmap.nearestPoint
        //     };
        //     Bmap.carMinTimenearestPointMapping.push(mapping);
        //     Bmap.chargingCarIndex++;
    } else {
        /*const mapping = {
            carMk: Bmap.chargingCar[Bmap.chargingCarIndex],
            minTime: Bmap.minTime,
            nearestPoint: Bmap.nearestPoint,
            pts: Bmap.nearestPoint
        };*/

        /*/!*Bmap.carMinTimenearestPointMapping.push(mapping);*!/
        for (let i = 0; i < Bmap.carMinTimenearestPointMapping.length; i++) {
            Bmap.currCar = Bmap.carMinTimenearestPointMapping[i].carMk;
            if (Bmap.carMinTimenearestPointMapping[i].minTime * 0.0000033 < getTElectricVehiclePower(Bmap.carMinTimenearestPointMapping[i].carMk.ba.split(",")[1])) {
                const time = Bmap.carMinTimenearestPointMapping[i].minTime;
                let carMk = Bmap.carMinTimenearestPointMapping[i].carMk;
                let pts = Bmap.carMinTimenearestPointMapping[i].pts;
                let len = pts.length;
                let timer = setTimeout(function () {
                    Bmap.resetMkPointAll(1, len, pts, carMk, time)
                }, 1000);
            } else {
                Bmap.myIconInit("../imgs/car.gif", 18, 18, 0, 0, 0, 0);
                Bmap.carMinTimenearestPointMapping[i].carMk.setIcon(Bmap.myIcon);
                var label = new BMap.Label("我需要救援...", {offset: new BMap.Size(20, -10)});
                Bmap.carMinTimenearestPointMapping[i].carMk.setLabel(label);
                //Bmap.currCar.setAnimation(BMAP_ANIMATION_BOUNCE);
                alert(Bmap.carMinTimenearestPointMapping[i].carMk.getTitle() + "需要救援");
                Bmap.helpCar.push(Bmap.carMinTimenearestPointMapping[i].carMk);
            }
            Bmap.chargingCar.remove(Bmap.currCar);
        }*/

        /* console.log("*********************************************");
         console.log(Bmap.chargingCarQueue.front());
         console.log(Bmap.chargingCarQueue.front().ba);
         console.log("*********************************************");*/
        if (Bmap.chargingCarQueue.front()) {
            if (Bmap.minTime * 0.0000033 < getTElectricVehiclePower(Bmap.chargingCarQueue.front().ba.split(",")[1])) {
                const time = Bmap.minTime;
                let carMk = Bmap.chargingCarQueue.front();
                let pts = Bmap.nearestPoint;
                let len = pts.length;
                let timer = setTimeout(function () {
                    Bmap.resetMkPointAll(1, len, pts, carMk, time)
                }, 1000);
            } else {
                Bmap.myIconInit("../imgs/car.gif", 18, 18, 0, 0, 0, 0);
                Bmap.chargingCarQueue.front().setIcon(Bmap.myIcon);
                var label = new BMap.Label("我需要救援...", {offset: new BMap.Size(20, -10)});
                Bmap.chargingCarQueue.front().setLabel(label);
                //Bmap.currCar.setAnimation(BMAP_ANIMATION_BOUNCE);
                /*alert(Bmap.chargingCarQueue.front().getTitle() + "需要救援");*/
                Bmap.helpCar.push(Bmap.chargingCarQueue.front());
            }
            Bmap.minTime = -1;
            Bmap.nearestPoint = [];
            Bmap.chargingStationIndex = 0;
            Bmap.chargingCar.remove(Bmap.chargingCarQueue.dequeue());
        }

        // Bmap.carMinTimenearestPointMapping = new Array();
        // Bmap.chargingCarIndex = 0;


    }
}

function loadScript(url, callback) {

    var script = document.createElement("script");

    script.type = "text/javascript";

    if (typeof(callback) != "undefined") {

        if (script.readyState) {

            script.onreadystatechange = function () {

                if (script.readyState == "loaded" || script.readyState == "complete") {

                    script.onreadystatechange = null;

                    callback();

                }

            };

        } else {

            script.onload = function () {

                callback();

            };

        }

    }
    ;

    script.src = url;

    document.body.appendChild(script);

}

var dateFormat = function (timestamp) {
    var time = new Date(timestamp)    //先将时间戳转为Date对象，然后才能使用Date的方法
    var year = time.getFullYear(),
        month = time.getMonth() + 1,  //月份是从0开始的
        day = time.getDate(),
        hour = time.getHours(),
        minute = time.getMinutes(),
        second = time.getSeconds()
    //add0()方法在后面定义
    return year + '-' + this.add0(month) + '-' + this.add0(day) + ' ' + this.add0(hour) + ':' + this.add0(minute) + ':' + this.add0(second)
}
var add0 = function (m) {
    return m < 10 ? '0' + m : m
}

/*--------------Queue类的定义*/
function Queue() {
    this.dataStore = [];
    this.enqueue = enqueue;
    this.dequeue = dequeue;
    this.front = front;
    this.back = back;
    this.toString = toString;
    this.empty = empty;
    this.check = check;
}

//入队，就是在数组的末尾添加一个元素
function check(element) {
    let flag = true;
    for (let i = 0; i < this.dataStore.length; i++) {
        if (this.dataStore[i] == element) {
            flag = false;
        }
    }
    return flag;
}

//入队，就是在数组的末尾添加一个元素
function enqueue(element) {
    this.dataStore.push(element);
}

//出队，就是删除数组的第一个元素
function dequeue() {
    return this.dataStore.shift();
}

//取出数组的第一个元素
function front() {
    return this.dataStore[0];
}

//取出数组的最后一个元素
function back() {
    return this.dataStore[this.dataStore.length - 1];
}

function toString() {
    var retStr = "";
    for (var i = 0; i < this.dataStore.length; ++i) {
        retStr += this.dataStore[i] + "&nbsp;"
    }
    return retStr;
}

//判断数组是否为空
function empty() {
    if (this.dataStore.length == 0) {
        return true;
    } else {
        return false;
    }
}

//返回数组中元素的个数
function count() {
    return this.dataStore.length;
}

Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
