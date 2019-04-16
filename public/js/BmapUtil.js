let moverTimer = null;
Bmap = {
    vue: new Vue(),
    userIdQueue: new Queue(),
    systemTimer: null,
    chargingStationPoints: new Array(),
    chargingStationArr: new Array(),
    currchargingStation: 0,
    nearestPoint: null,
    minTime: -1,
    myuuid: new UUID(),
    helpCar: new Array(),
    chargingCar: new Array(),
    chargingCarMark: new Array(),
    chargingCarQueue: new Queue(),
    chargingCarIndex: 0,
    carMinTimenearestPointMapping: new Array(),
    currChargingCar: '',
    currTaskCar: '',
    currPower: null,
    currCar: null,
    currPoint: null,
    chargingStationIndex: 0,
    linemapping: new Array(),
    userCarMapping: {},
    infoMapping: new Array(),
    markerMapping: new Array(),
    systemTime: null,
    ffRatio: null,
    simulationId: null,
    systemTimeLable: null,
    lines: null,
    line: null,
    lineId: null,
    lineIndexMark: 0,
    lineNumber: null,
    map: null,
    lineIndex: null,
    startPoint: null,
    startTime: null,
    endPoint: null,
    endTime: null,
    bounds: null,
    linesPoints: null,
    myIcon: null,
    myZoomCtrl: null,
    drivingArr: null,
    planObj: null,
    opacity: null,
    width: null,
    height: null,
    d: null,
    cha: null,
    jia: null,
    marker: null,
    route: null,
    points: null,
    cars: null,
    sizeNum: 15,
    mapInit: (el, certerPoint) => {
        Bmap.drivingArr = new Array();
        Bmap.map = new BMap.Map(el);
        Bmap.map.enableScrollWheelZoom(true);
        // 104.0863, 30.656913
        Bmap.map.centerAndZoom(new BMap.Point(certerPoint[0], certerPoint[1]), Bmap.sizeNum);
    },
    myIconInit: (Imageurl, myIconWidth, myIconHeight, offsetWidth, offsetHeight, imageOffsetWidth, imageOffsetHeight) => {
        // "http://lbsyun.baidu.com/jsdemo/img/Mario.png"
        Bmap.myIcon = new BMap.Icon(Imageurl, new BMap.Size(myIconWidth, myIconHeight, imageOffsetWidth, imageOffsetHeight), {
            offset: new BMap.Size(offsetWidth, offsetHeight),
            imageOffset: new BMap.Size(imageOffsetWidth, imageOffsetHeight)
        });
    },
    ZoomControlInit: (map) => {
        // 定义一个控件类,即function
        function ZoomControl() {
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
            this.defaultOffset = new BMap.Size(10, 10);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        ZoomControl.prototype = new BMap.Control();
        ZoomControl.prototype.initialize = function (map) {
            // 创建一个DOM元素
            var $div = $("<div class=\"btn-group\">\n" +
                " <button type=\"button\" class=\"btn btn-primary\" id='simulatedDriving'>模拟汽车行驶</button>" +
                " <button type=\"button\" class=\"btn\" id='openModalNewXl'>规划线路</button>" +
                "  <button class=\"btn\" id='openModalNewChargingStation'>新建充电站</button>\n" +
                "  <button class=\"btn\" id='openModalNewChargingPile'>新建充电桩</button>\n" +
                "  <button class=\"btn\" id='openModalNewTask'>新建任务</button>\n" +
                "</div>");
            // 设置样式
            /* $div.css("cursor", "pointer");
             $div.css("border", "1px solid gray");
             $div.css("backgroundColor", "blue");*/
            /*$div.on('click', () => {
                $('#tint').fadeIn();
                $('#startUpPanel').show().addClass('bounceInLeft');
                // $('#auditContentWrap').show();
            })*/
            Bmap.map.getContainer().appendChild($div[0]);
            // 将DOM元素返回
            return $div[0];
        }
        // 创建控件
        var myZoomCtrl = new ZoomControl();
        // 添加到地图当中
        Bmap.map.addControl(myZoomCtrl);
    },
    ZoomControlInitLEFT: (map) => {
        // 定义一个控件类,即function
        function ZoomControl() {
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
            this.defaultOffset = new BMap.Size(10, 10);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        ZoomControl.prototype = new BMap.Control();
        ZoomControl.prototype.initialize = function (map) {
            // 创建一个DOM元素
            var $div = $("<nav class='menu' data-ride='menu' style='width: 200px'>" +
                "<ul id='treeMenu' class='tree tree-menu' data-ride='tree'>" +
                // "<li><a id='evLineMapping' href='#'><i class='icon icon-th'></i>btn1</a></li>" +
                "<li><a id='getcurrTasks' href='#'><i class='icon icon-user'></i>获取用户任务</a></li>" +
                "<li>" +
                "<a href='#' id='setSimulationTime'><i class='icon icon-time'></i>设置模拟时间</a>" +
                "</li>" +
                "<li id='getTransactionAllList'><a href='#'　><i class='icon icon-list-ul'></i>交易列表</a></li>" + /*icon-trash*/
                "<li id='viewElectricityPrice'><a href='#'><i class='icon icon-list-ul'></i>实时电价</a></li>" +
                "<li id='getRunTaskAllList'><a href='#'><i class='icon icon-list-ul'></i>任务运行日志</a></li>" +
                "<li id='getPowerHistoryEchart'>" +
                "<a href='#'><i class='icon icon-tasks'></i>获取负荷曲线</a>" +
                "</li>" +
                "</ul>" +
                "</nav>");
            // 设置样式
            /* $div.css("cursor", "pointer");
             $div.css("border", "1px solid gray");
             $div.css("backgroundColor", "blue");*/
            // 手动通过点击模拟高亮菜单项
            $div.on('click', 'a', function () {
                $('#treeMenu li.active').removeClass('active');
                $(this).closest('li').addClass('active');
            });
            Bmap.map.getContainer().appendChild($div[0]);
            // 将DOM元素返回
            return $div[0];
        }
        // 创建控件
        var myZoomCtrl = new ZoomControl();
        // 添加到地图当中
        Bmap.map.addControl(myZoomCtrl);
    },
    drawLine: (results) => {
        Bmap.opacity = 0.1;
        Bmap.planObj = results.getPlan(0);
        let duration = Bmap.planObj.getDuration(true);
        // console.log(duration)
        // console.log(Bmap.startTime);
        let oldMin = parseInt(Bmap.startTime[1]);
        let oldHour = parseInt(Bmap.startTime[0]);
        let newMin = 0;
        let newHour = 0;
        if (duration.indexOf("小时") === -1) {
            newMin = parseInt(duration);

        } else if (duration.indexOf("分钟") === -1) {
            newHour = parseInt(duration.substring(0, duration.indexOf("小时")))
        } else {
            newHour = parseInt(duration.substring(0, duration.indexOf("小时")))
            newMin = parseInt(duration.substring(duration.indexOf("小时") + 2, duration.indexOf("分钟")))
        }
        let hourAdd = parseInt((oldMin + newMin) / 60)
        newMin = (oldMin + newMin) % 60
        newHour = (hourAdd + oldHour + newHour) % 24
        if (newHour < 10) {
            newHour = "0" + newHour;
        }
        if (newMin < 10) {
            newMin = "0" + newMin;
        }
        $("#endTime" + Bmap.lineIndex).val(newHour + ":" + newMin);
        // console.log(newHour + ":" + newMin);
        Bmap.b = new Array();
        // 绘制驾车步行线路
        for (var i = 0; i < Bmap.planObj.getNumRoutes(); i++) {
            var route = Bmap.planObj.getRoute(i);
            if (route.getDistance(false) <= 0) {
                continue;
            }
            Bmap.drivingArr.push(JSON.stringify(route.getPath()))
            Bmap.addPoints(route.getPath());
            var polyline = null;
            // 驾车线路
            if (route.getRouteType() == BMAP_ROUTE_TYPE_DRIVING) {
                polyline = new BMap.Polyline(route.getPath(), {
                    id: Bmap.lineId,
                    startTime: Bmap.startTime,
                    endTime: Bmap.endTime,
                    sort: Bmap.lineIndex,
                    strokeStyle: Bmap.lineId,
                    strokeColor: "#0030ff",
                    strokeOpacity: Bmap.opacity,
                    strokeWeight: 5,
                    enableMassClear: true
                })
            } else {
                // 步行线路有可能为0
                polyline = new BMap.Polyline(route.getPath(), {
                    id: Bmap.lineId,
                    startTime: Bmap.startTime,
                    endTime: Bmap.endTime,
                    sort: Bmap.lineIndex,
                    strokeStyle: Bmap.lineId,
                    strokeColor: "#30a208",
                    strokeOpacity: 0.75,
                    strokeWeight: 4,
                    enableMassClear: true
                })
            }
            polyline.addEventListener("click", Bmap.editLine);
            Bmap.linemapping[polyline.ba] = Object.assign({}, Bmap.line);
            // console.log("*********************************");
            // console.log(polyline.ba);
            // console.log("*********************************");
            Bmap.map.addOverlay(polyline);
        }
        Bmap.map.setViewport(Bmap.bounds);
        // 终点
        Bmap.addMarkerFun(results.getEnd().point, 1, 1);
        // 开始点
        Bmap.addMarkerFun(results.getStart().point, 1, 0);
        // debugger;
        Bmap.linesPoints[Bmap.linesPoints.length] = Bmap.b;
    },
    addMarkerFun: (point, imgType, index, title) => {
        if (imgType == 1) {
            // var url = "http://lbsyun.baidu.com/jsdemo/img/dest_markers.png";
            //var url = "../imgs/startPoint.png"; //"http://lbsyun.baidu.com/jsdemo/img/dest_markers.png";
            var url = "./imgs/startPoint.png"; //"http://lbsyun.baidu.com/jsdemo/img/dest_markers.png";
            // width = 24;
            var width = 0;
            // height = 24;
            var height = 0;
            if (index === 1) {
                // url = "../imgs/endPoint.png"
                url = "./imgs/endPoint.png"
            }
            Bmap.myIconInit(url, width, height, 0, -24, 0, 0);
            // Bmap.myIconInit(url, width, height, 0, -24, 0, 0);
            // Bmap.myIconInit(url, width, height, 14, 32, 0, 0 - index * height);
        } else {
            var url = "http://lbsyun.baidu.com/jsdemo/img/trans_icons.png";
            width = 22;
            height = 25;
            var d = 25;
            var cha = 0;
            var jia = 0
            if (index == 2) {
                d = 21;
                cha = 5;
                jia = 1;
            }
            Bmap.myIconInit(url, width, d, 10, 11 + jia, 0, 0 - index * height - cha);
        }

        var marker = new BMap.Marker(point, {icon: Bmap.myIcon});
        if (title != null && title != "") {
            marker.setTitle(title);
        }
        // 起点和终点放在最上面
        if (imgType == 1) {
            marker.setTop(true);
        }
        Bmap.map.addOverlay(marker);
    },
    addPoints: (points) => {
        for (var i = 0; i < points.length; i++) {
            Bmap.bounds.push(points[i]);
            Bmap.b.push(points[i]);
        }
    },
    resetMkPoint: (i, len, pts, carMk) => {
        if (moverTimer) {
            clearTimeout(moverTimer)
        }
        carMk.setPosition(pts[i]);
        if (i < len) {
            moverTimer = setTimeout(function () {
                i++;
                Bmap.resetMkPoint(i, len, pts, carMk);
            }, 500);
        }
    },
    resetMkPointAll: (i, len, pts, carMk, time) => {
        //debugger;
        if (checkHelpCar(carMk)) {
            console.log(carMk.getTitle() + "需要救援");
            return;
        }
        if (i == 1) {
            let id = Bmap.myuuid.createUUID();
            let title = carMk.getTitle();
            carMk.setTitle(title + ":" + id);

            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log(id);
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            runLogStart(carMk, id);


            console.log(carMk.getTitle() + "开始执行当前线路");
        }
        const power = getTElectricVehiclePower(carMk.ba.split(",")[1]);
        //console.error(power);
        if (power < 4 && chargingCar(carMk)) {
            runLogEnd(carMk, "电量过低当前任务未完成", 2);
            console.log("电量过低查询充电站");
            Bmap.myIconInit("../imgs/car_xycd.gif", 18, 18, 0, 0, 0, 0);
            carMk.setIcon(Bmap.myIcon);
            /* var label = new BMap.Label("我需要充电...", {offset: new BMap.Size(20, -10)});*/
            let label = carMk.getLabel();
            carMk.setLabel(label.setContent("我需要充电..."));
            Bmap.chargingCar.push(carMk);
            Bmap.chargingCarMark.push(carMk);
            Bmap.chargingCarQueue.enqueue(carMk);
            /*Bmap.currPoint = carMk.getPosition();
            Bmap.currPower = power;
            Bmap.currCar = carMk;
            Bmap.chargingStationIndex = 0;*/
            /* Bmap.chargingCarIndex = 0;
             Bmap.chargingCarIndex = 0;*/
            /* goCharging()*/
            return;
        }
        let du = 0;
        if (i == len - 1) {
            du = Math.round(time / (len - 1)) + time % (len - 1);
        } else {
            du = Math.round(time / (len - 1));
        }
        // console.log(du);
        carMk.setPosition(pts[i]);
        // console.log(i);
        // console.log(len);
        if (i < len) {
            try {
                let geoc = new BMap.Geocoder();
                geoc.getLocation(pts[i], function (rs) {
                    let addComp = rs.addressComponents;
                    let nameStr = addComp.district + addComp.street + addComp.streetNumber;
                    if (pts[i]) {
                        const obj = {
                            id: carMk.ba.split(",")[1],
                            positionVal: pts[i].lng + "," + pts[i].lat,
                            position: nameStr,
                            power: -0.0000033 * du
                        }
                        // console.log(obj.power);
                        // console.log(carMk);
                        /*let label = carMk.getLabel();
                        label.setContent("当前电量:"+obj.power);*/
                        updateElectricVehicleById(obj)
                    }

                });
            } catch (e) {
                console.log(e);
            }

            // debugger;
            moverTimer = setTimeout(function () {
                i++;
                Bmap.resetMkPointAll(i, len, pts, carMk, time);
            }, du / Bmap.ffRatio);
        } else {
            //console.log(carMk.getLabel());
            if (carMk.getLabel().content == "我需要充电...") {
                runLogEnd(carMk, "充电", 1);
                Bmap.myIconInit("../imgs/car_zzcd.gif", 18, 18, 0, 0, 0, 0);
                carMk.setIcon(Bmap.myIcon);
                // var label = new BMap.Label("我正在充电...", {offset: new BMap.Size(20, -10)});
                let label = carMk.getLabel();
                carMk.setLabel(label.setContent("我正在充电..."));
                // carMk.setLabel(label);
                Bmap.changePower(carMk);
            } else {
                runLogEnd(carMk, "执行任务", 1);
                console.log(carMk.getTitle() + "当前执行的线路结束");
                Task.currUserId = carMk.ba.split(",")[0];
                Task.closeTask(Task.userTasklist[Task.currUserId].id);
                Task.getcurrTaskByUserId(carMk.ba.split(",")[0]);
                Bmap.userIdQueue.enqueue(carMk.ba.split(",")[0]);
                Task.userIdQueue.enqueue(carMk.ba.split(",")[0]);
                /* Task.startTask();*/
            }

        }
    },
    changePower: (carMk) => {
        let evId = carMk.ba.split(",")[1];
        let tEVInfo = getTElectricVehicleInfo(evId);
        console.log(tEVInfo.power);
        console.log(tEVInfo.batteryCapacity);
        if (tEVInfo.batteryCapacity - tEVInfo.power > 0.5) {
            tEVInfo.power = 0.5;
            updateElectricVehicleById(tEVInfo);
            let moverTimer = setTimeout(function () {
                Bmap.changePower(carMk);
            }, 1000 * 60 / Bmap.ffRatio);
        } else if (tEVInfo.batteryCapacity - tEVInfo.power > 0) {
            tEVInfo.power = tEVInfo.batteryCapacity - tEVInfo.power;
            updateElectricVehicleById(tEVInfo);
            Bmap.myIconInit("../imgs/car_val.png", 24, 24, 0, 0, 0, 0);
            carMk.setIcon(Bmap.myIcon);
            debugger;
            let index = carMk.ba.split(",").length;
            let userId = carMk.ba.split(",")[0];
            let chargingStationId = carMk.ba.split(",")[index - 1];
            const objD = {
                type: 'transferAccounts',
                from: userId,
                to: chargingStationId,
                value: '50',
            }
            const obj = {
                userId: userId,
                chargingStationId: chargingStationId,
                amount: '50',
            }
            const objE = {
                type: 'queryAccount',
                id: userId,
            }
            $.ajax({
                type: "post",
                url: BaseUrl+"/api/account/transfer",
                data: JSON.stringify(obj),
                dataType: "json",
                contentType: 'application/json;charset=UTF-8', //contentType很重要
                success: function (data) {
                    console.log(data)
                }
            });
            ws.send(JSON.stringify(objD));
            ws.send(JSON.stringify(objE));
            console.log(carMk);
            var label = carMk.getLabel();
            console.log(label);
            Bmap.chargingCar.remove(carMk);
            Bmap.chargingCarMark.remove(carMk);
            carMk.setLabel(label.setContent(carMk.getTitle().split(":")[0]));
            console.log(carMk.getTitle() + "充电结束");
            Task.currUserId = carMk.ba.split(",")[0];
            //Task.closeTask(Task.userTasklist[Task.currUserId].id);
            Task.getcurrTaskByUserId(carMk.ba.split(",")[0]);
            Bmap.userIdQueue.enqueue(carMk.ba.split(",")[0]);
            Task.userIdQueue.enqueue(carMk.ba.split(",")[0]);

        }

    },
    run: (num) => {
        for (var m = 0; m < Bmap.linesPoints.length; m++) {
            if (num) {
                if (num === m) {
                    var pts = Bmap.linesPoints[m];
                    var len = pts.length;
                    // Bmap.myIconInit("http://lbsyun.baidu.com/jsdemo/img/Mario.png", 32, 70, 0, 0, 0, 0 );
                    Bmap.myIconInit("../imgs/car_val.png", 24, 24, 0, 0, 0, 0);
                    var carMk = new BMap.Marker(pts[0], {icon: Bmap.myIcon});
                    Bmap.map.addOverlay(carMk);
                    Bmap.resetMkPoint(1, len, pts, carMk)
                }
            } else {
                var pts = Bmap.linesPoints[m];
                var len = pts.length;
                // Bmap.myIconInit("http://lbsyun.baidu.com/jsdemo/img/Mario.png", 32, 70, 0, 0, 0, 0 );
                Bmap.myIconInit("../imgs/car_val.png", 24, 24, 0, 0, 0, 0);
                var carMk = new BMap.Marker(pts[0], {icon: Bmap.myIcon});
                Bmap.map.addOverlay(carMk);
                Bmap.resetMkPoint(1, len, pts, carMk)
            }
        }
    },
    runAll: () => {
        for (var m = 0; m < Bmap.linesPoints.length; m++) {
            // console.log(JSON.stringify(Bmap.linesPoints[0]));
            var pts = Bmap.linesPoints[m];
            // console.log(pts);
            var len = pts.length;
            Bmap.myIconInit("../imgs/car_val.png", 24, 24, 0, 0, 0, 0);
            var carMk = new BMap.Marker(pts[0], {icon: Bmap.myIcon, title: "car" + (m + 1)});
            Bmap.map.addOverlay(carMk);
            Bmap.resetMkPointAll(1, len, pts, carMk)
        }
    },
    initLine: () => {
        Bmap.bounds = new Array();
        Bmap.linesPoints = new Array();
        Bmap.map.clearOverlays();                                                    // 清空覆盖物
        var driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: Bmap.drawLine});  // 驾车实例,并设置回调
        driving.search(Bmap.startPoint, Bmap.endPoint)
    },
    editLine: (evnt) => {
        // console.log(evnt.target);
        // console.log(Bmap.linemapping[evnt.target.ba]);
        // console.log(Bmap.linemapping);
        // $('#myModal .modal-body').html("");
        // createLine();
        // console.log(evnt.target.ia);
        // console.log(evnt.target.ia[0].lng + "," + evnt.target.ia[0].lat)
        // $('#myModal .startPointVal').val(evnt.target.ia[0].lng + "," + evnt.target.ia[0].lat);
        // $('#myModal .endPointVal').val(evnt.target.ia[evnt.target.ia.length-1].lng + "," + evnt.target.ia[evnt.target.ia.length-1].lat);
        // var geoc = new BMap.Geocoder();
        // geoc.getLocation(evnt.target.ia[0], function(rs){
        //     var addComp = rs.addressComponents;
        //     // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
        //     var nameStr = addComp.district + addComp.street + addComp.streetNumber;
        //     $('#myModal .startPoint').val(nameStr);
        // });
        // geoc.getLocation(evnt.target.ia[evnt.target.ia.length-1], function(rs){
        //     var addComp = rs.addressComponents;
        //     // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
        //     var nameStr = addComp.district + addComp.street + addComp.streetNumber;
        //     $('#myModal .endPoint').val(nameStr);
        // });
        $.ajax({
            type: "post",
            url: BaseUrl+"/api/tLine/list",
            data: '',
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                if (data.length) {
                    // $.each(data,(index,obj) => {
                    //    if(index){
                    //        createLine(1);
                    //    } else {
                    //        createLine(0);
                    //    }
                    // })
                    Bmap.drawAllLine(data)
                }
            }
        });

    },
    getDuration: (map) => {
        // console.log(Bmap.planObj)
    },
    drawAllLine: (lines) => {
        $('#myModal .modal-body').html("");
        //chosen-select
        $('#myModal .modal-body').append("<select id='userId' data-placeholder='请选择用户...' class='form-control' tabindex='2' ><option value=''></option> <option value='1'>user1</option> <option value='2'>user2</option> <option value='3'>user3</option></select>");
        $("#addInputXl").show();
        $("#addInputChargingStation").hide();
        $("#addInputChargingPile").hide();
        $.each(lines, (num, line) => {
            let index = line.sort;
            var divStr = "<div class=\"input-group lines-group\" index='" + num + "'></div>";
            var lag1Str = "<span class=\"input-group-addon\"> 线路：</span>";
            var lag2Str = "<input id='startPoint" + num + "' type=\"text\" class=\"form-control startPoint mapSelectPoint\" placeholder=\"起点\">";
            var lag3Str = "<input id='startPointVal" + num + "' type=\"hidden\" class=\"form-control startPointVal mapSelectPoint\" placeholder=\"起点\">";
            var lag4Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
            var lag5Str = "<input id='endPoint" + num + "' type=\"text\" class=\"form-control endPoint mapSelectPoint\" placeholder=\"终点\">";
            var lag6Str = "<input id='endPointVal" + num + "' type=\"hidden\" class=\"form-control endPointVal mapSelectPoint\" placeholder=\"终点\">";
            var lag7Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
            var lag8Str = "<input id='startTime" + num + "' type=\"text\" class=\"form-control startTime form-time\" placeholder=\"开始时间:选择或者输入一个时间：hh:mm\">";
            var lag9Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
            var lag10Str = "<input id='endTime" + num + "' type=\"text\" readonly=\"readonly\" class=\"form-control endTime form-time\" placeholder=\"结束时间:hh:mm\">";
            var lag11Str = "<span id='startPoint" + num + "' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
            var lag12Str = "<span id='delLine" + index + "' class=\"input-group-addon fix-border fix-padding btn btn-danger delline\"><i class=\"icon icon-trash\"></i>删除</span>";
            var $divStr = $(divStr).attr("id", line.id);
            var $lag1Str = $(lag1Str);
            var $lag2Str = $(lag2Str).val(line.startPoint);
            var $lag3Str = $(lag3Str).val(line.startPointVal);
            var $lag4Str = $(lag4Str);
            var $lag5Str = $(lag5Str).val(line.endPoint);
            var $lag6Str = $(lag6Str).val(line.endPointVal);
            var $lag7Str = $(lag7Str);
            var $lag8Str = $(lag8Str).val(line.startTime);
            var $lag9Str = $(lag9Str);
            var $lag10Str = $(lag10Str).val(line.endTime);
            var $lag11Str = $(lag11Str);
            var $lag12Str = $(lag12Str);
            if (num != lines.length - 1) {
                $lag12Str.attr('disabled', "true");
            }
            $lag8Str.datetimepicker({
                language: "zh-CN",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 1,
                minView: 0,
                maxView: 1,
                forceParse: 0,
                format: 'hh:ii'
            });
            $lag8Str.change((e) => {
                let obj = $(e.target);
                if (obj.parent().prev().find(".endTime").length) {
                    let prevEndTime = obj.parent().prev().find(".endTime").val()
                    let currStartTime = parseInt($(e.target).val().replace(':', ''))
                    prevEndTime = parseInt(prevEndTime.replace(':', ''))
                    if (currStartTime < prevEndTime) {
                        Bmap.vue.$message({message: '时间早于前一条线路的结束时间。', type: 'error'})
                        obj.val("")
                    }
                }

            });
            $divStr.append($lag1Str).append($lag2Str).append($lag3Str).append($lag4Str).append($lag5Str)
                .append($lag6Str).append($lag7Str).append($lag8Str).append($lag9Str).append($lag10Str)
                .append($lag11Str).append($lag12Str)
            $('#myModal .modal-body').append($divStr)
            if (num) {
                $('#startPoint' + num).attr("readOnly", "true")
                $('#startPoint' + num).unbind('click')
                $('#startPoint' + num).removeClass("mapSelectPoint")
                $('#startPoint' + num).val($('#endPoint' + (num - 1)).val());
                $('#startPointVal' + num).val($('#endPointVal' + (num - 1)).val());
            }
        })
        $('select.chosen-select').chosen({
            no_results_text: '没有找到',    // 当检索时没有找到匹配项时显示的提示文本
            disable_search_threshold: 10, // 10 个以下的选择项则不显示检索框
            search_contains: true         // 从任意位置开始检索
        });
        $('#myModal').modal({
            keyboard: false,
            show: true,
            moveable: true
        })
    }
}

