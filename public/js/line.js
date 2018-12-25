//保存线路
function saveLines(lines) {
    let linesArr = new Array();
    $.each(lines, (index, line) => {
        line = $(line);
        // console.log(line);
        const id = line.attr("id");
        const sort = parseInt(line.attr("index"));
        const startPoint = line.find('.startPoint').val();
        const endPoint = line.find('.endPoint').val();
        const startPointVal = line.find('.startPointVal').val();
        const endPointVal = line.find('.endPointVal').val();
        const startTime = line.find('.startTime').val();
        const endTime = line.find('.endTime').val();
        const owerId = $('#myModal .modal-body #userId').val();
        const lineObj = {
            id, startPoint, endPoint, startPointVal, endPointVal, startTime, endTime, sort, owerId
        }
        $.ajax({
            type: "post",
            url: "http://10.168.1.240:10200/api/tLine/save",
            data: JSON.stringify(lineObj),
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log(data)
            }
        });
        linesArr.push(lineObj);
    })
    $('#myModal').modal('hide')
}

//创建线路
function createLine(num) {
    let index = null;
    $("#addInputXl").show();
    $("#addInputChargingStation").hide();
    $("#addInputChargingPile").hide();
    if (num == 0) {
        index = 0
        // chosen-select
        $('#myModal .modal-body').append("<select id='userId' data-placeholder='请选择用户...' class='form-control' tabindex='2' ><option value=''></option> <option value='1'>user1</option> <option value='2'>user2</option> <option value='3'>user3</option></select>");
    } else {
        index = $(".input-group").length
    }
    let divStr = "<div class=\"input-group lines-group\" index='" + index + "'></div>";
    let lag1Str = "<span class=\"input-group-addon\"> 线路：</span>";
    let lag2Str = "<input id='startPoint" + index + "' type=\"text\" class=\"form-control startPoint mapSelectPoint\" placeholder=\"起点\">";
    let lag3Str = "<input id='startPointVal" + index + "' type=\"hidden\" class=\"form-control startPointVal mapSelectPoint\" placeholder=\"起点\">";
    let lag4Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag5Str = "<input id='endPoint" + index + "' type=\"text\" class=\"form-control endPoint mapSelectPoint\" placeholder=\"终点\">";
    let lag6Str = "<input id='endPointVal" + index + "' type=\"hidden\" class=\"form-control endPointVal mapSelectPoint\" placeholder=\"终点\">";
    let lag7Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag8Str = "<input id='startTime" + index + "' type=\"text\" class=\"form-control startTime form-time\" placeholder=\"开始时间:选择或者输入一个时间：hh:mm\">";
    let lag9Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    let lag10Str = "<input id='endTime" + index + "' type=\"text\" readonly=\"readonly\" class=\"form-control endTime form-time\" placeholder=\"结束时间:hh:mm\">";
    /* let lag11Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";*/
    let lag11Str = "<span id='startPoint" + index + "' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
    let lag12Str = "<span id='delLine" + index + "' class=\"input-group-addon fix-border fix-padding btn btn-danger delline\"><i class=\"icon icon-trash\"></i>删除</span>";
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
    /*   let $lag11Str = $(lag11Str);*/
    let $lag11Str = $(lag11Str);
    let $lag12Str = $(lag12Str);
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
    $divStr.append($lag1Str).append($lag2Str).append($lag3Str).append($lag4Str).append($lag5Str)
        .append($lag6Str).append($lag7Str).append($lag8Str).append($lag9Str).append($lag10Str)
        .append($lag11Str).append($lag12Str)
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
    if (num) {
        $('#delLine' + (index - 1)).attr('disabled', "true");
        $('#startPoint' + index).attr("readOnly", "true")
        $('#startPoint' + index).unbind('click')
        $('#startPoint' + index).removeClass("mapSelectPoint")
        $('#startPoint' + index).val($('#endPoint' + (index - 1)).val());
        $('#startPointVal' + index).val($('#endPointVal' + (index - 1)).val());
    }
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

//获取所有线路
function getAllLine() {
    $.ajax({
        type: "post",
        url: "http://10.168.1.240:10200/api/tLine/list",
        data: '',
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            Bmap.lines = data;
            Bmap.lineNumber = data.length - 1;
            // if (data.length) {
            //     $.each(data, (index, obj) => {
            //         Bmap.line = obj;
            //         const startPointArr = obj.startPointVal.split(",");
            //         Bmap.lineIndex = obj.sort;
            //         Bmap.lineId = obj.id;
            //         Bmap.startTime = obj.startTime;
            //         Bmap.endTime = obj.endTime;
            //         const endPointArr = obj.endPointVal.split(",");
            //         Bmap.startPoint = new BMap.Point(Number(startPointArr[0]), Number(startPointArr[1])); // 起点
            //         Bmap.endPoint = new BMap.Point(Number(endPointArr[0]), Number(endPointArr[1])); // 终点
            //         Bmap.initLine();
            //     })
            // }
        }
    });

}

//生成线路html字符串
function getLinesHtml(tLines, info) {
    let linesHtml = "";
    if (tLines.length) { // <th>经纬度</th> <td>" <th>位置</th><th>建设日期</th><th>投运日期</th>+ pile.positionVal + "</td><td>" + pile.position + "</td><td>" + dateToString(new Date(pile.createTime)) + "</td><td>" + dateToString(new Date(pile.runTime)) + "</td>
        const tableHeader = "<div class='datagrid' id='lineTable'><table class=\"table table-bordered\"  id=" + info.id + ">\n" +
            "<thead><tr><th>#</th><th>名称</th><th>起点</th><th>终点</th><th>开始时间</th>\n" +
            "</tr></thead><tbody>\n";
        const tableFooter = "</tbody></table></div>";
        let tbody = "";
        for (let i = 0; i < tLines.length; i++) {
            const line = tLines[i];
            tbody += "<tr><td>" + (i + 1) + "</td><td>" + line.name + "</td><td>" + line.startPoint + "</td><td>" + line.endPoint + "</td><td>" + line.startTime + "</td></tr>"
        }
        linesHtml = tableHeader + tbody + tableFooter;
    }
    // console.log(linesHtml);
    return linesHtml;
}