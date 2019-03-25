//保存充电站
function saveChargingStation(chargingStations) {
    let chargingStationsArr = new Array();
    $.each(chargingStations, (index, chargingStation) => {
        chargingStation = $(chargingStation);
        // console.log(chargingStation);
        const id = chargingStation.attr("id");
        // const sort = parseInt(chargingStation.attr("index"));
        const name = chargingStation.find('.name').val();
        const position = chargingStation.find('.position').val();
        const positionVal = chargingStation.find('.position_val').val();
        const capacity = chargingStation.find('.capacity').val();
        const chargingEfficiency = chargingStation.find('.charging_efficiency').val();
        const state = chargingStation.find('.state-select').val();
        const runTime = chargingStation.find('.run_time').val();
        // const owerId = $('#myModal .modal-body #userId').val();
        /* [{"id":"123","name":"123","capacity":123.0,"position":"321",
             "positionVal":"123213","chargingEfficiency":321.0,"createTime":1543825495000,"runTime":1543825502000}]*/
        const chargingStationObj = {
            id, name, position, positionVal, capacity, chargingEfficiency, state, runTime
        }
        // console.log(chargingStationObj)
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api/tChargingStation/save",
            data: JSON.stringify(chargingStationObj),
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log(data)
            }
        });
        chargingStationsArr.push(chargingStationObj);
    })
    $('#myModal').modal('hide')
}

//新建充电站
function createChargingStation(num) {
    let index = null;
    $("#addInputXl").hide();
    $("#addInputChargingStation").show();
    $("#addInputTask").hide();
    $("#addInputChargingPile").hide();
    /*if (num == 0) {
        index = 0
        $('#myModal .modal-body').append("<select id='userId' data-placeholder='请选择用户...' class='chosen-select form-control' tabindex='2' ><option value=''></option> <option value='1'>user1</option> <option value='2'>user2</option> <option value='3'>user3</option></select>");
    } else {
        index = $(".input-group").length
    }*/
    index = $(".input-group").length
    /*let index = $("#myModal div").length - 5*/
    let divStr = "<div class=\"input-group ChargingStation-group\" index='" + index + "'></div>";
    let lag1Str = "<span class=\"input-group-addon\"> 充电站：</span>";
    let lag2Str = "<input id='name" + index + "' type=\"text\" class=\"form-control name \" placeholder=\"充电站名称\">";
    let lag3Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag4Str = "<input id='position" + index + "' type=\"text\" class=\"form-control position mapSelectPoint\" placeholder=\"充电站位置\">";
    let lag5Str = "<input id='position_val" + index + "' type=\"hidden\" class=\"form-control position_val mapSelectPoint\" placeholder=\"充电站位置\">";
    let lag6Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag7Str = "<input id='capacity" + index + "' type=\"text\" class=\"form-control capacity\" placeholder=\"充电站容量\">";
    let lag8Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag9Str = "<input id='charging_efficiency" + index + "' type=\"text\" class=\"form-control charging_efficiency\" placeholder=\"充电效率\">";
    let lag10Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag11Str = "<select data-placeholder='选择运行状态...' class='chosen-select form-control state-select' tabindex='2' <option value=''></option> <option value='1'>正常</option> <option value='0'>停运</option> </select>";
    let lag12Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag13Str = "<input id='run_time" + index + "' type=\"text\" class=\"form-control run_time form-time\" placeholder=\"投运时间：yyyy-MM-dd\">"; //readonly="readonly"
    /* let lag11Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";*/
    // let lag11Str = "<span id=id='startPoint"+index+"' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
    let $divStr = $(divStr);
    let $lag1Str = $(lag1Str);
    let $lag2Str = $(lag2Str);
    let $lag3Str = $(lag3Str);
    let $lag4Str = $(lag4Str);
    let $lag5Str = $(lag5Str);
    let $lag6Str = $(lag6Str);
    let $lag7Str = $(lag7Str);
    let $lag8Str = $(lag8Str);
    let $lag9Str = $(lag9Str);
    let $lag10Str = $(lag10Str);
    let $lag11Str = $(lag11Str);
    let $lag12Str = $(lag12Str);
    let $lag13Str = $(lag13Str);
    $lag13Str.datetimepicker({
        language: "zh-CN",
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0,
        format: "yyyy-mm-dd"
    });
    /*$lag8Str.datetimepicker({
        language:  "zh-CN",
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 1,
        minView: 0,
        maxView: 1,
        forceParse: 0,
        format: 'hh:ii'
    });*/
    $divStr.append($lag1Str).append($lag2Str).append($lag3Str).append($lag4Str)
        .append($lag5Str).append($lag6Str).append($lag7Str).append($lag8Str)
        .append($lag9Str).append($lag10Str).append($lag11Str).append($lag12Str)
        .append($lag13Str)
    // .append($lag11Str)// .append($lag11Str)
    /* let lineIput = "<div class=\"input-group\">\n" +
         "  <span class=\"input-group-addon\"> 线路：</span>\n" +
         "  <input type=\"text\" class=\"form-control\" placeholder=\"起点\">\n" +
         "  <span class=\"input-group-addon fix-border fix-padding\"></span>\n" +
         "  <input type=\"text\" class=\"form-control\" placeholder=\"终点\">\n" +
         "  <span class=\"input-group-addon fix-border fix-padding\"></span>\n" +
         "  <input type=\"text\" class=\"form-control form-time\" placeholder=\"开始时间:选择或者输入一个时间：hh:mm\">"+
        /!* "  <input type=\"text\" class=\"form-control\" placeholder=\"开始时间\">\n" +*!/
         "  <span class=\"input-group-addon fix-border fix-padding\"></span>\n" +
         "  <input type=\"text\" class=\"form-control\" placeholder=\"结束时间\">\n" +
         "</div>";*/
    $('#myModal .modal-body').append($divStr)
    /*  if(num){
          $('#startPoint'+index).attr("readOnly","true")
          $('#startPoint'+index).unbind('click')
          $('#startPoint'+index).removeClass("mapSelectPoint")
          $('#startPoint'+index).val($('#endPoint'+(index-1)).val());
          $('#startPointVal'+index).val($('#endPointVal'+(index-1)).val());
      }*/
    $('#myModal').modal({
        keyboard: false,
        show: true,
        moveable: true
    })
}

//获取所有充电站
function getAllChargingStation() {
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tChargingStation/list",
        data: '',
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            setTimeout(function () {
                if (data.length) {
                    // fromLS = window.localStorage.getItem(lsKey);
                    // if (fromLS) fromLS = JSON.parse(fromLS);
                    // else fromLS = {story_mode: false};					//dsh todo remove this
                    // console.log('from local storage', fromLS);
                    // connect_to_server();
                    $.each(data, (index, obj) => {
                        Bmap.myIconInit("../imgs/chargingStation.png", 36, 36, 0, 0, 0, 0);
                        let strings = obj.positionVal.split(',');
                        let point = new BMap.Point(strings[0], strings[1]);
                        Bmap.chargingStationPoints.push(point);
                        Bmap.chargingStationArr.push(obj);
                        let carMk = new BMap.Marker(point, {icon: Bmap.myIcon, title: obj.name});
                        carMk.addEventListener("click", showChargingStationDetails);
                        Bmap.map.addOverlay(carMk);
                        // console.log(obj.positionVal);
                        // debugger;
                        console.log(obj);
                        // let param = {
                        //     type: 'initAccount',
                        //     id: obj.id,
                        //     value: parseFloat(obj.account),
                        // }
                        // const param = {
                        //     type: 'initAccount',
                        //     id: obj.id,
                        //     value: obj.account,
                        // }
                        // const paramQ = {
                        //     type: 'queryAccount',
                        //     id: obj.id,
                        // }
                        // debugger;
                        // console.log(ws);
                        // ws.send(JSON.stringify(param));
                        // ws.send(JSON.stringify(paramQ));
                    })
                }
            }, 500);					//try again one more time, server restarts are quick
        }
    });

}

//查看充电站详细信息
function showChargingStationDetails(e) {
    let point = e.target.LA
    let title = $(e.currentTarget.V.outerHTML).attr("title");
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tChargingStation/getChargingStationByName",
        data: title,
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            // console.log(data)
            if (data.length) {
                const info = data[0];
                let opts = {
                    width: 730,     // 信息窗口宽度
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
                    "    <div class=\"item-content\"><h2>充电站信息</h2><ul><li><a>名称:" + info.name + "</a></li><li><a>充电效率:" + info.chargingEfficiency + "%</a></li>" +
                    "<li><a>充电桩数量:" + info.tChargingPiles.length + "台</a></li><li><a>地址:" + info.position + "</a></li>\n" +
                    "<li><a>状态:" + ((info.state == 1) ? "正常" : "停运") + "</a></li><li><a>投运时间:" + dateToString(new Date(info.runTime)) + "</a></li></ul>";

                const htmlE = "</div>\n" +
                    "    <div class=\"item-footer\">\n" +
                    "      <a href=\"#\" class=\"text-muted\"><i class=\"icon-comments\"></i></a> &nbsp; <span class=\"text-muted\">" + dateToString(new Date()) + "</span>\n" +
                    "    </div>\n" +
                    "  </div>\n" +
                    "</div>";
                const htmlM = getPilesHtml(info.tChargingPiles, info);
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
        }
    });
}
