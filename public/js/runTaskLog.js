function runLogStart(carMk, id) {
    try {
        let geoc = new BMap.Geocoder();
        geoc.getLocation(carMk.getPosition(), function (rs) {
            let addComp = rs.addressComponents;
            let nameStr = addComp.district + addComp.street + addComp.streetNumber;
            const obj = {
                id: id,
                owerId: carMk.ba.split(",")[0],
                startTime: getDateStr() + " " + Bmap.systemTime,
                startPointVal: carMk.getPosition().lng + "," + carMk.getPosition().lat,
                startPoint: nameStr,
                state: 0
            }
            // console.log(obj.power);
            // console.log(carMk);
            /*let label = carMk.getLabel();
            label.setContent("当前电量:"+obj.power);*/
            $.ajax({
                type: "post",
                url: "http://10.168.1.235:10200/api/tRunLog/save",
                data: JSON.stringify(obj),
                dataType: "json",
                /*        async: false,*/
                contentType: 'application/json;charset=UTF-8', //contentType很重要
                success: function (data) {
                    console.log(data);
                    console.error(data);
                }, error: function (data) {
                    console.log(data);
                    console.error(data);
                }
            });

        });
    } catch (e) {
        console.log(e);
    }
}

function runLogEnd(carMk, remark, state) {
    try {
        let geoc = new BMap.Geocoder();
        geoc.getLocation(carMk.getPosition(), function (rs) {
            let addComp = rs.addressComponents;
            let nameStr = addComp.district + addComp.street + addComp.streetNumber;
            let tArr = carMk.getTitle().split(":");
            const obj = {
                id: tArr[tArr.length - 1],
                owerId: carMk.ba.split(",")[0],
                endTime: getDateStr() + " " + Bmap.systemTime,
                endPointVal: carMk.getPosition().lng + "," + carMk.getPosition().lat,
                endPoint: nameStr,
                remark: remark,
                state: state
            }
            // console.log(obj.power);
            // console.log(carMk);
            /*let label = carMk.getLabel();
            label.setContent("当前电量:"+obj.power);*/
            $.ajax({
                type: "post",
                url: "http://10.168.1.235:10200/api/tRunLog/update",
                data: JSON.stringify(obj),
                dataType: "json",
                contentType: 'application/json;charset=UTF-8', //contentType很重要
                success: function (data) {
                    console.log(data);
                }, error: function (data) {
                    console.log(data);
                }
            });

        });

    } catch (e) {
        console.log(e);
    }
}

function getRunLogById(id) {
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tRunLog/update",
        data: JSON.stringify(id),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data);
        }, error: function (data) {
            console.log(data);
        }
    });
}

//获取任务运行记录列表
$(document).on("click", "#getRunTaskAllList", function () {
    // alert(1);

    let param = {page: 1, size: 5};
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tRunLog/page/",
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data)
            createRumTaskTable(data);
        },
        error: function (data) {
            if (data.responseText == 'success') {
                console.log(data)
                createRumTaskTable(data);

            }
        }
    });
})
//交易列表翻页操作
$(document).on('click', '#runTaskListTools li', (e) => {
    let page = $(e.target).text();
    let currPageObj = '';
    let flag = true;
    if (page == '«') {
        flag = false;
        page = $("#runTaskListTools li.active").text();
        if (page != 1) {
            currPageObj = $("#runTaskListTools li.active").prev();
            $("#runTaskListTools li.active").removeClass('active');
            currPageObj.addClass('active');
        }
        page = currPageObj.text();
    }
    if (page == '»') {
        flag = false;
        page = $("#runTaskListTools li.active").text();
        const maxPage = $("#runTaskListTools").data("pages");
        if (page != maxPage) {
            currPageObj = $("#runTaskListTools li.active").next();
            $("#runTaskListTools li.active").removeClass('active');
            currPageObj.addClass('active');
        }
        page = currPageObj.text();
    }
    if (flag) {
        $("#runTaskListTools li").removeClass('active');
        $(e.target).parent().addClass('active');
    }
    let param = {page: parseInt(page), size: 5};
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tRunLog/page/",
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            createRumTaskTable(data);
        },
        error: function (data) {
            if (data.responseText == 'success') {
                createRumTaskTable(data);

            }
        }
    });
    console.log(page);
})

//创建交易表格
function createRumTaskTable(data) {
    $('#transactionListCol .modal-title').text("任务运行日志列表");
    $('#transactionListCol').modal('show');
    $('#transactionListCol .modal-body').html("");
    const htmlStr = "<table id='runTaskList' class=\"table table-bordered\">\n" +
        "  <thead>\n" +
        "    <tr>\n" +
        "      <th>UserID</th>\n" +
        "      <th>开始时间</th>\n" +
        "      <th>结束时间</th>\n" +
        "      <th>起点位置</th>\n" +
        "      <th><i class=\"icon icon-long-arrow-right\"></i></th>\n" +
        "      <th>终点位置</th>\n" +
        "      <th>状态</th>\n" +
        "      <th>备注</th>\n" +
        "    </tr>\n" +
        "  </thead>\n" +
        "  <tbody>\n" +
        "  </tbody>\n" +
        "</table>";
    $('#transactionListCol .modal-body').html(htmlStr);
    console.log(data);
    const records = data.records;
    for (let i = 0; i < records.length; i++) { //(dateToString(new Date(records[i].txTime))
        let trStr = "<tr><td>" + records[i].owerId + "</td><td>" + records[i].startTime + "</td><td>" + records[i].endTime + "</td><td>" + records[i].startPoint + "</td><td>....</td><td>" + records[i].endPoint + "</td><td>" + (records[i].state == 1 ? '完成' : '未完成') + "</td><td>" + records[i].remark + "</td></tr>";
        $('#transactionListCol #runTaskList tbody').append($(trStr));
    }
    const pageStart = "<div id='runTaskListTools'><ul class=\"pager\"><li class=\"previous\"><a>«</a></li>";
    let numberStr = '';
    for (let i = 1; i <= data.pages; i++) {
        if (data.current == i) {
            numberStr += "  <li class=\"active\"><a>" + i + "</a></li>\n";
        } else {
            numberStr += "  <li><a>" + i + "</a></li>\n";
        }
    }
    const pageEnd = "  <li class=\"next\"><a>»</a></li></ul></div>";
    const page = pageStart + numberStr + pageEnd;
    const $page = $(page);
    $page.data("pages", data.pages);
    $('#transactionListCol .modal-body').append($page);
}
