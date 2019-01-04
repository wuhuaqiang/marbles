//获取所有电动汽车带线路信息
function getAllTElectricVehicleWithLine() {
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tElectricVehicle/getAllListWithLine",
        data: '',
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            Bmap.cars = data;
            if (data.length) {
                $.each(data, (index, obj) => {

                    Bmap.myIconInit("../imgs/car_val.png", 24, 24, 0, 0, 0, 0);
                    let strings = obj.positionVal.split(',');
                    let point = new BMap.Point(strings[0], strings[1])
                    let carMk = new BMap.Marker(point, {icon: Bmap.myIcon, title: obj.userName + ":Car"});
                    carMk.addEventListener("click", showTElectricVehicleDetails);
                    let label = new BMap.Label(obj.userName, {offset: new BMap.Size(20, -10)});
                    carMk.setLabel(label);
                    Bmap.map.addOverlay(carMk);
                    carMk.ba = obj.userId + "," + obj.id;
                    Bmap.userCarMapping[obj.userId] = carMk;
                    // console.log(obj.positionVal);
                })
            }
        }
    });
}

//更新电动汽车
function updateElectricVehicleById(obj) {
    //console.log(obj);
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tElectricVehicle/update",
        data: JSON.stringify(obj),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data);
        }
    });
}

//展示电动汽车详细信息
function showTElectricVehicleDetails_Bf(e) {
    let point = e.target.LA;
    const userName = e.currentTarget.V.title.split(":")[0];
    if (userName) {
        $.each(Bmap.cars, (index, obj) => {

            if (userName == obj.userName) {
                // console.log(obj);
                const info = obj;
                let opts = {
                    // width: 730,     // 信息窗口宽度
                    // height: 300,     // 信息窗口高度
                    // title: "<h4>充电站信息</h4>", // 信息窗口标题
                    enableMessage: true,//设置允许信息窗发送短息
                    message: "查看充电站详细信息"
                }
                const htmlF = "<div class=\"items\">\n" +
                    "  <div class=\"item\">\n" +
                    "    <div class=\"item-heading\">\n" +
                    // "      <div class=\"pull-right label label-success\">"+new Date().toDateString()+"</div>\n" +
                    "    </div>\n" +
                    "    <div class=\"item-content\"><h2>充电站汽车信息</h2><ul><li><a>用户:" + info.userName + "</a></li>" +
                    "<li><a>电池容量:" + info.batteryCapacity + "(kW·h)</a></li><li><a>当前电量:" + info.power + "(kW·h)</a></li>\n" +
                    "<li><a>状态:" + ((info.state == 1) ? "正常" : "停运") + "</a></li><li><a>位置:" + info.position + "</a></li><li><a>速度:" + info.speed + "(km/h)</a></li></ul>";

                const htmlE = "</div>\n" +
                    "    <div class=\"item-footer\">\n" +
                    "      <a href=\"#\" class=\"text-muted\"><i class=\"icon-comments\"></i></a> &nbsp; <span class=\"text-muted\">" + dateToString(new Date()) + "</span>\n" +
                    "    </div>\n" +
                    "  </div>\n" +
                    "</div>";
                const htmlM = getLinesHtml(info.lines, info);
                const html = htmlF + htmlM + htmlE;

                let infoWindow = new BMap.InfoWindow(html, opts);  // 创建信息窗口对象
                Bmap.map.openInfoWindow(infoWindow, point); //开启信息窗口
                $('#pileTable').datagrid({
                    states: {
                        pager: {page: 1, recPerPage: 10},

                        fixedLeftUntil: 0,    // 固定左侧第一列
                        fixedRightFrom: 5,   // 从第12列开始固定到右侧
                        fixedTopUntil: 0,     // 固定顶部第一行（标题行）
                        fixedBottomFrom: 5, // 从第100行（在此例中是最后一行）开始固定到底部
                    }
                });
            }
        })
    }

}

//展示实时电动汽车详细信息
function showTElectricVehicleDetails(e) {
    const idArr = e.target.ba.split(",");
    const param = {userId: idArr[0], evId: idArr[1]}
    let point = e.target.LA;
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tElectricVehicle/getEVWithLineById",
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data);
            createInfoWindow(data, point)
        }
    });
}

function createInfoWindow(info, point) {
    let opts = {
        // width: 730,     // 信息窗口宽度
        // height: 300,     // 信息窗口高度
        // title: "<h4>充电站信息</h4>", // 信息窗口标题
        enableMessage: true,//设置允许信息窗发送短息
        message: "查看充电站详细信息"
    }
    const htmlF = "<div class=\"items\">\n" +
        "  <div class=\"item\">\n" +
        "    <div class=\"item-heading\">\n" +
        // "      <div class=\"pull-right label label-success\">"+new Date().toDateString()+"</div>\n" +
        "    </div>\n" +
        "    <div class=\"item-content\"><h2>充电站汽车信息</h2><ul><li><a>用户:" + info.userName + "</a></li>" +
        "<li><a>电池容量:" + info.batteryCapacity + "(kW·h)</a></li><li><a>当前电量:" + info.power + "(kW·h)</a></li>\n" +
        "<li><a>状态:" + ((info.state == 1) ? "正常" : "停运") + "</a></li><li><a>位置:" + info.position + "</a></li><li><a>速度:" + info.speed + "(km/h)</a></li></ul>";

    const htmlE = "</div>\n" +
        "    <div class=\"item-footer\">\n" +
        "      <a href=\"#\" class=\"text-muted\"><i class=\"icon-comments\"></i></a> &nbsp; <span class=\"text-muted\">" + dateToString(new Date()) + "</span>\n" +
        "    </div>\n" +
        "  </div>\n" +
        "</div>";
    const htmlM = getLinesHtml(info.tLines, info);
    const html = htmlF + htmlM + htmlE;

    let infoWindow = new BMap.InfoWindow(html, opts);  // 创建信息窗口对象
    Bmap.map.openInfoWindow(infoWindow, point); //开启信息窗口
    $('#pileTable').datagrid({
        states: {
            pager: {page: 1, recPerPage: 10},

            fixedLeftUntil: 0,    // 固定左侧第一列
            fixedRightFrom: 5,   // 从第12列开始固定到右侧
            fixedTopUntil: 0,     // 固定顶部第一行（标题行）
            fixedBottomFrom: 5, // 从第100行（在此例中是最后一行）开始固定到底部
        }
    });
}

//获取汽车当前电量
function getTElectricVehiclePower(id) {
    const param = {id: id}
    let result;
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tElectricVehicle/getEVById",
        data: JSON.stringify(param),
        async: false,
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            // console.log(data);
            result = data.power;
        }
    });
    return result;
}

//获取电动汽车信息
function getTElectricVehicleInfo(id) {
    const param = {id: id}
    let result;
    $.ajax({
        type: "post",
        url: "http://localhost:10200/api/tElectricVehicle/getEVById",
        data: JSON.stringify(param),
        async: false,
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            // console.log(data);
            result = data;
        }
    });
    return result;
}