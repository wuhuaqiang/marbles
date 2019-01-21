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
        debugger;
        let split = Bmap.systemTime.split(":");
        if (split[1] == "00" && split[2] == "00") {
            const obj = {
                time: Bmap.systemTime
            }
            $.ajax({
                type: "post",
                url: "http://localhost:10200/api/tPowerHistory/save",
                data: JSON.stringify(obj),
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
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tSystemsetting/list/",
        data: "",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data[0]);
            Bmap.systemTime = data[0].timeStart;
            Bmap.ffRatio = data[0].k;
            Bmap.simulationId = data[0].id;
            setSystemTime();
        },
        error: function (data) {
            console.log(data);
        }
    });
    /*var currDate = new Date();//获取系统当前时间
    const h = currDate.getHours();
    const m = currDate.getMinutes();
    const s = currDate.getSeconds()
    Bmap.systemTime = h + ":" + m + ":" + s;
    Bmap.ffRatio = 1;*/


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
                runLogEnd(Bmap.chargingCarQueue.front(), "需要救援", 2);
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

// On creation of a UUID object, set it's initial value
function UUID() {
    this.id = this.createUUID();
}


// When asked what this Object is, lie and return it's value
UUID.prototype.valueOf = function () {
    return this.id;
};
UUID.prototype.toString = function () {
    return this.id;
};


//
// INSTANCE SPECIFIC METHODS
//
UUID.prototype.createUUID = function () {
    //
    // Loose interpretation of the specification DCE 1.1: Remote Procedure Call
    // since JavaScript doesn't allow access to internal systems, the last 48 bits
    // of the node section is made up using a series of random numbers (6 octets long).
    //
    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
    var dc = new Date();
    var t = dc.getTime() - dg.getTime();
    var tl = UUID.getIntegerBits(t, 0, 31);
    var tm = UUID.getIntegerBits(t, 32, 47);
    var thv = UUID.getIntegerBits(t, 48, 59) + '1'; // version 1, security version is 2
    var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
    var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);

    // since detection of anything about the machine/browser is far to buggy,
    // include some more random numbers here
    // if NIC or an IP can be obtained reliably, that should be put in
    // here instead.
    var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
        UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
        UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
        UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
        UUID.getIntegerBits(UUID.rand(8191), 0, 15); // this last number is two octets long
    return tl + tm + thv + csar + csl + n;
};


//Pull out only certain bits from a very large integer, used to get the time
//code information for the first part of a UUID. Will return zero's if there
//aren't enough bits to shift where it needs to.
UUID.getIntegerBits = function (val, start, end) {
    var base16 = UUID.returnBase(val, 16);
    var quadArray = new Array();
    var quadString = '';
    var i = 0;
    for (i = 0; i < base16.length; i++) {
        quadArray.push(base16.substring(i, i + 1));
    }
    for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
        if (!quadArray[i] || quadArray[i] == '') quadString += '0';
        else quadString += quadArray[i];
    }
    return quadString;
};


//Replaced from the original function to leverage the built in methods in
//JavaScript. Thanks to Robert Kieffer for pointing this one out
UUID.returnBase = function (number, base) {
    return (number).toString(base).toUpperCase();
};


//pick a random number within a range of numbers
//int b rand(int a); where 0 <= b <= a
UUID.rand = function (max) {
    return Math.floor(Math.random() * (max + 1));
};


function getDateStr() {
    //获取当前时间
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}
