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