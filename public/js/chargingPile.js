//保存充电桩
function saveChargingPile(chargingPiles) {
    let chargingPilesArr = new Array();
    $.each(chargingPiles, (index, chargingPile) => {
        chargingPile = $(chargingPile);
        // console.log(chargingPile);
        const id = chargingPile.attr("id");
        // const sort = parseInt(chargingPile.attr("index"));
        const name = chargingPile.find('.name').val();
        const position = chargingPile.find('.position').val();
        const positionVal = chargingPile.find('.position_val').val();
        const capacity = chargingPile.find('.capacity').val();
        const chargingEfficiency = chargingPile.find('.charging_efficiency').val();
        const state = chargingPile.find('.state-select').val();
        const runTime = chargingPile.find('.run_time').val();
        // const owerId = $('#myModal .modal-body #userId').val();
        /* [{"id":"123","name":"123","capacity":123.0,"position":"321",
             "positionVal":"123213","chargingEfficiency":321.0,"createTime":1543825495000,"runTime":1543825502000}]*/
        const chargingPileObj = {
            id, name, position, positionVal, capacity, chargingEfficiency, state, runTime
        }
        // console.log(chargingPileObj)
        $.ajax({
            type: "post",
            url: "http://10.168.1.240:10200/api/tChargingPile/save",
            data: JSON.stringify(chargingPileObj),
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log(data)
            }
        });
        chargingPilesArr.push(chargingPileObj);
    })
    $('#myModal').modal('hide')
}

//新建充电桩
function createChargingPile(num) {
    let index = null;
    $("#addInputXl").hide();
    $("#addInputChargingStation").hide();
    $("#addInputChargingPile").show();
    index = $(".input-group").length;
    /* let index = $("#myModal div").length - 5*/
    let divStr = "<div class=\"input-group ChargingPile-group\" index='" + index + "'></div>";
    let lag0Str = "<span class=\"input-group-addon\"> 充电桩：</span>";
    let lag1Str = "<select id='csId" + index + "' placeholder='请选择充电站...' class='form-control csId-select' tabindex='2' ><option value=''></option> <option value='1'>user1</option> <option value='2'>user2</option> <option value='3'>user3</option></select>";
    let lag1_1Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag2Str = "<input id='name" + index + "' type=\"text\" class=\"form-control name \" placeholder=\"充电桩名称\">";
    let lag3Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag4Str = "<input id='position" + index + "' type=\"text\" class=\"form-control position mapSelectPoint\" placeholder=\"充电桩位置\">";
    let lag5Str = "<input id='position_val" + index + "' type=\"hidden\" class=\"form-control position_val mapSelectPoint\" placeholder=\"充电桩位置\">";
    let lag6Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag7Str = "<input id='capacity" + index + "' type=\"text\" class=\"form-control capacity\" placeholder=\"充电桩容量\">";
    let lag8Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag9Str = "<input id='charging_efficiency" + index + "' type=\"text\" class=\"form-control charging_efficiency\" placeholder=\"充电效率\">";
    let lag10Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag11Str = "<select data-placeholder='选择运行状态...' class='form-control state-select' tabindex='2' <option value=''></option> <option value='1'>正常</option> <option value='0'>停运</option> </select>";
    let lag12Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag13Str = "<input id='run_time" + index + "' type=\"text\" class=\"form-control run_time form-time\" placeholder=\"投运时间：yyyy-MM-dd\">"; //readonly="readonly"
    /* let lag11Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";*/
    // let lag11Str = "<span id=id='startPoint"+index+"' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
    let $divStr = $(divStr);
    let $lag0Str = $(lag0Str);
    let $lag1Str = $(lag1Str);
    let $lag1_1Str = $(lag1_1Str);
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
    $divStr.append($lag0Str).append($lag1Str).append($lag1_1Str).append($lag2Str).append($lag3Str).append($lag4Str)
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

//获取充电桩html字符串
function getPilesHtml(tChargingPiles, info) {
    let pilesHtml = "";
    if (tChargingPiles.length) { // <th>经纬度</th> <td>" <th>位置</th><th>建设日期</th><th>投运日期</th>+ pile.positionVal + "</td><td>" + pile.position + "</td><td>" + dateToString(new Date(pile.createTime)) + "</td><td>" + dateToString(new Date(pile.runTime)) + "</td>
        const tableHeader = "<div class='datagrid' id='pileTable'><table class=\"table table-bordered\"  id=" + info.id + ">\n" +
            "<thead><tr><th>#</th><th>名称</th><th>容量(kw)</th><th>充电效率(%)</th><th>状态</th>\n" +
            "</tr></thead><tbody>\n";
        const tableFooter = "</tbody></table></div>";
        let tbody = "";
        for (let i = 0; i < tChargingPiles.length; i++) {
            const pile = tChargingPiles[i];
            tbody += "<tr><td>" + (i + 1) + "</td><td>" + pile.name + "</td><td>" + pile.capacity + "</td><td>" + pile.chargingEfficiency + "</td><td>" + ((pile.state == 1) ? "正常" : "停运") + "</td></tr>"
        }
        pilesHtml = tableHeader + tbody + tableFooter;
    }
    // console.log(pilesHtml);
    return pilesHtml;
}