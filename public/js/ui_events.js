/* global $, window, document */
/* global toTitleCase, connect_to_server, refreshHomePanel, closeNoticePanel, openNoticePanel, show_tx_step, marbles*/
/* global pendingTxDrawing:true */
/* exported record_company, autoCloseNoticePanel, start_up, block_ui_delay*/
var ws = {};
var bgcolors = ['whitebg', 'blackbg', 'redbg', 'greenbg', 'bluebg', 'purplebg', 'pinkbg', 'orangebg', 'yellowbg'];
var autoCloseNoticePanel = null;
var known_companies = {};
var start_up = true;
var lsKey = 'marbles';
var fromLS = {};
var block_ui_delay = 15000; 								//default, gets set in ws block msg
var auditingMarble = null;

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function () {
    fromLS = window.localStorage.getItem(lsKey);
    if (fromLS) fromLS = JSON.parse(fromLS);
    else fromLS = {story_mode: false};					//dsh todo remove this
    console.log('from local storage', fromLS);

    // connect_to_server();

    // =================================================================================
    // jQuery UI Events
    // =================================================================================
    $('#createMarbleButton').click(function () {
        console.log('creating marble');
        var obj = {
            type: 'create',
            color: $('.colorSelected').attr('color'),
            size: $('select[name="size"]').val(),
            username: $('select[name="user"]').val(),
            company: $('input[name="company"]').val(),
            owner_id: $('input[name="owner_id"]').val(),
            v: 1
        };
        console.log('creating marble, sending', obj);
        $('#createPanel').fadeOut();
        $('#tint').fadeOut();
        // const objA = {
        //     type: 'initAccount',
        //     id: 'A',
        //     value: '245',
        // }
        // const objC = {
        //     type: 'initAccount',
        //     id: 'B',
        //     value: '185',
        // }
        // // ws.send(JSON.stringify(objA));
        // // ws.send(JSON.stringify(objC));
        // const objB = {
        //     type: 'queryAccount',
        //     id: 'A',
        // }
        // const objD = {
        //     type: 'transferAccounts',
        //     from: 'A',
        //     to: 'B',
        //     value: '100',
        // }
        // const objE = {
        //     type: 'queryAccount',
        //     id: 'B',
        // }
        // ws.send(JSON.stringify(objD));
        // ws.send(JSON.stringify(objB));
        //
        // ws.send(JSON.stringify(objE));
        show_tx_step({state: 'building_proposal'}, function () {
            ws.send(JSON.stringify(obj));

            refreshHomePanel();
            $('.colorValue').html('Color');											//reset
            for (var i in bgcolors) $('.createball').removeClass(bgcolors[i]);		//reset
            $('.createball').css('border', '2px dashed #fff');						//reset
        });

        return false;
    });

    //fix marble owner panel (don't filter/hide it)
    $(document).on('click', '.marblesFix', function () {
        if ($(this).parent().parent().hasClass('marblesFixed')) {
            $(this).parent().parent().removeClass('marblesFixed');
        }
        else {
            $(this).parent().parent().addClass('marblesFixed');
        }
    });

    //marble color picker
    $(document).on('click', '.colorInput', function () {
        $('.colorOptionsWrap').hide();											//hide any others
        $(this).parent().find('.colorOptionsWrap').show();
    });
    $(document).on('click', '.colorOption', function () {
        var color = $(this).attr('color');
        var html = '<span class="fa fa-circle colorSelected ' + color + '" color="' + color + '"></span>';

        $(this).parent().parent().find('.colorValue').html(html);
        $(this).parent().hide();

        for (var i in bgcolors) $('.createball').removeClass(bgcolors[i]);		//remove prev color
        $('.createball').css('border', '0').addClass(color + 'bg');				//set new color
    });

    //username/company search
    $('#searchUsers').keyup(function () {
        var count = 0;
        var input = $(this).val().toLowerCase();
        for (var i in known_companies) {
            known_companies[i].visible = 0;
        }

        //reset - clear search
        if (input === '') {
            $('.marblesWrap').show();
            count = $('#totalUsers').html();
            $('.companyPanel').fadeIn();
            for (i in known_companies) {
                known_companies[i].visible = known_companies[i].count;
                $('.companyPanel[company="' + i + '"]').find('.companyVisible').html(known_companies[i].visible);
                $('.companyPanel[company="' + i + '"]').find('.companyCount').html(known_companies[i].count);
            }
        }
        else {
            var parts = input.split(',');
            console.log('searching on', parts);

            //figure out if the user matches the search
            $('.marblesWrap').each(function () {												//iter on each marble user wrap
                var username = $(this).attr('username');
                var company = $(this).attr('company');
                if (username && company) {
                    var full = (username + company).toLowerCase();
                    var show = false;

                    for (var x in parts) {													//iter on each search term
                        if (parts[x].trim() === '') continue;
                        if (full.indexOf(parts[x].trim()) >= 0 || $(this).hasClass('marblesFixed')) {
                            count++;
                            show = true;
                            known_companies[company].visible++;								//this user is visible
                            break;
                        }
                    }

                    if (show) $(this).show();
                    else $(this).hide();
                }
            });

            //show/hide the company panels
            for (i in known_companies) {
                $('.companyPanel[company="' + i + '"]').find('.companyVisible').html(known_companies[i].visible);
                if (known_companies[i].visible === 0) {
                    console.log('hiding company', i);
                    $('.companyPanel[company="' + i + '"]').fadeOut();
                }
                else {
                    $('.companyPanel[company="' + i + '"]').fadeIn();
                }
            }
        }
        //user count
        $('#foundUsers').html(count);
    });

    //login events
    $('#whoAmI').click(function () {													//drop down for login
        if ($('#userSelect').is(':visible')) {
            $('#userSelect').fadeOut();
            $('#carrot').removeClass('fa-angle-up').addClass('fa-angle-down');
        }
        else {
            $('#userSelect').fadeIn();
            $('#carrot').removeClass('fa-angle-down').addClass('fa-angle-up');
        }
    });

    //open create marble panel
    $(document).on('click', '.addMarble', function () {
        $('#tint').fadeIn();
        $('#createPanel').fadeIn();
        var company = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('company');
        var username = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('username');
        var owner_id = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('owner_id');
        $('select[name="user"]').html('<option value="' + username + '">' + toTitleCase(username) + '</option>');
        $('input[name="company"]').val(company);
        $('input[name="owner_id"]').val(owner_id);
    });

    //close create marble panel
    $('#tint').click(function () {
        if ($('#startUpPanel').is(':visible')) return;
        if ($('#txStoryPanel').is(':visible')) return;
        $('#createPanel, #tint, #settingsPanel').fadeOut();
    });

    //notification drawer
    $('#notificationHandle').click(function () {
        if ($('#noticeScrollWrap').is(':visible')) {
            closeNoticePanel();
        }
        else {
            openNoticePanel();
        }
    });

    //hide a notification
    $(document).on('click', '.closeNotification', function () {
        $(this).parents('.notificationWrap').fadeOut();
    });

    //settings panel
    $('#showSettingsPanel').click(function () {
        $('#settingsPanel, #tint').fadeIn();
    });
    $('#closeSettings').click(function () {
        $('#settingsPanel, #tint').fadeOut();
    });

    //story mode selection
    $('#disableStoryMode').click(function () {
        set_story_mode('off');
    });
    $('#enableStoryMode').click(function () {
        set_story_mode('on');
    });

    //close create panel
    $('#closeCreate').click(function () {
        $('#createPanel, #tint').fadeOut();
    });

    //change size of marble
    $('select[name="size"]').click(function () {
        var size = $(this).val();
        if (size === '16') $('.createball').animate({'height': 150, 'width': 150}, {duration: 200});
        else $('.createball').animate({'height': 250, 'width': 250}, {duration: 200});
    });

    //right click opens audit on marble
    $(document).on('contextmenu', '.ball', function () {
        auditMarble(this, true);
        return false;
    });

    //left click audits marble
    $(document).on('click', '.ball', function () {
        auditMarble(this, false);
    });

    function auditMarble(that, open) {
        var marble_id = $(that).attr('id');
        $('.auditingMarble').removeClass('auditingMarble');

        if (!auditingMarble || marbles[marble_id].id != auditingMarble.id) {//different marble than before!
            for (var x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);
            $('.txHistoryWrap').html('');										//clear
        }

        auditingMarble = marbles[marble_id];
        console.log('\nuser clicked on marble', marble_id);

        if (open || $('#auditContentWrap').is(':visible')) {
            $(that).addClass('auditingMarble');
            $('#auditContentWrap').fadeIn();
            $('#marbleId').html(marble_id);
            var color = marbles[marble_id].color;
            for (var i in bgcolors) $('.auditMarble').removeClass(bgcolors[i]);	//reset
            $('.auditMarble').addClass(color.toLowerCase() + 'bg');

            $('#rightEverything').addClass('rightEverythingOpened');
            $('#leftEverything').fadeIn();

            var obj2 = {
                type: 'audit',
                marble_id: marble_id
            };
            ws.send(JSON.stringify(obj2));
        }
    }

    $('#auditClose').click(function () {
        $('#auditContentWrap').slideUp(500);
        $('.auditingMarble').removeClass('auditingMarble');												//reset
        for (var x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);
        setTimeout(function () {
            $('.txHistoryWrap').html('<div class="auditHint">Click a Marble to Audit Its Transactions</div>');//clear
        }, 750);
        $('#marbleId').html('-');
        auditingMarble = null;

        setTimeout(function () {
            $('#rightEverything').removeClass('rightEverythingOpened');
        }, 500);
        $('#leftEverything').fadeOut();
    });

    $('#auditButton').click(function () {
        $('#auditContentWrap').fadeIn();
        $('#rightEverything').addClass('rightEverythingOpened');
        $('#leftEverything').fadeIn();
    });

    let selectedOwner = null;
    // show dialog to confirm if they want to disable the marble owner
    $(document).on('click', '.disableOwner', function () {
        $('#disableOwnerWrap, #tint').fadeIn();
        selectedOwner = $(this).parents('.marblesWrap');
    });

    // disable the marble owner
    $('#removeOwner').click(function () {
        var obj = {
            type: 'disable_owner',
            owner_id: selectedOwner.attr('owner_id')
        };
        ws.send(JSON.stringify(obj));
        selectedOwner.css('opacity', 0.4);
    });

    $('.closeDisableOwner, #removeOwner').click(function () {
        $('#disableOwnerWrap, #tint').fadeOut();
    });
});

//toggle story mode
function set_story_mode(setting) {
    if (setting === 'on') {
        fromLS.story_mode = true;
        $('#enableStoryMode').prop('disabled', true);
        $('#disableStoryMode').prop('disabled', false);
        $('#storyStatus').addClass('storyOn').html('on');
        window.localStorage.setItem(lsKey, JSON.stringify(fromLS));		//save
    }
    else {
        fromLS.story_mode = false;
        $('#disableStoryMode').prop('disabled', true);
        $('#enableStoryMode').prop('disabled', false);
        $('#storyStatus').removeClass('storyOn').html('off');
        window.localStorage.setItem(lsKey, JSON.stringify(fromLS));		//save
    }
}

//保存数据
$(document).on('click', '#saveData', () => {
    let lines = $('#myModal .modal-body .lines-group');
    let chargingPiles = $('#myModal .modal-body .ChargingPile-group');
    let chargingStations = $('#myModal .modal-body .ChargingStation-group');
    let tasks = $('#myModal .modal-body .tasks-group');
    if (lines.length) {
        saveLines(lines);
    } else if (chargingPiles.length) {
        saveChargingPile(chargingPiles);
    } else if (chargingStations.length) {
        saveChargingStation(chargingStations);
    } else if (tasks.length) {
        const userId = $('#myModal .modal-body #userId').val();
        Task.saveTasks(userId, tasks);
    }

})

/**
 * 地图相关事件
 */
//关闭弹窗
$(document).on('click', '#closeModal', () => {
    $('#myModal').modal('hide')
})
//打开新建线路弹窗
$(document).on('click', '#openModalNewXl', () => {
    $('#myModal .modal-body').html("");
    createLine(0);
})
//添加线路
$(document).on('click', '#addInputXl', () => {
    //let index = $("#myModal div").length-7
    //console.log(index)
    let endTimeVal = $(".endTime").eq($(".endTime").length - 1).val();
    if (endTimeVal) {
        createLine(1)
    } else {
        Bmap.vue.$message({message: '请先执行上一条线路。', type: 'error'})
    }

})
$(document).on('click', '#openModalNewTask', () => {
    $('#myModal .modal-body').html("");
    Task.createTask(0);
})
$(document).on('click', '#addInputTask', () => {
    Task.createTask(1);
})
$(document).on('click', '#openModalNewChargingStation', () => {
    $('#myModal .modal-body').html("");
    createChargingStation(0);
})
$(document).on('click', '#addInputChargingStation', () => {
    createChargingStation(1)
})
$(document).on('click', '#openModalNewChargingPile', () => {
    $('#myModal .modal-body').html("");
    createChargingPile(0);
})
$(document).on('click', '#addInputChargingPile', () => {
    createChargingPile(1)
})


//获取地图上点的位置.
$(document).on('click', '.mapSelectPoint', (e) => {
    try {
        let obj = $(e.target)
        $('#myMapCol .modal-body').html("");
        let mapCol = $("<div id='mapSelectBox' class='mapSelectBox'></div>")
        $('#myMapCol .modal-body').append(mapCol)
        $('#myMapCol').modal('show');
        let centerPoint = [104.0863, 30.656913];
        let map = new BMap.Map("mapSelectBox");
        map.enableScrollWheelZoom(true);
        // 104.0863, 30.656913
        map.centerAndZoom(new BMap.Point(centerPoint[0], centerPoint[1]), 15);
        map.addEventListener("click", function (e) {
            obj.next().val(e.point.lng + "," + e.point.lat);
            let geoc = new BMap.Geocoder();
            let pt = e.point;
            geoc.getLocation(pt, function (rs) {
                let addComp = rs.addressComponents;
                // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
                let nameStr = addComp.district + addComp.street + addComp.streetNumber;
                obj.val(nameStr);
                if (obj.hasClass('endPoint') && obj.parent().next()) {
                    obj.parent().next().find(".startPoint").val(nameStr)
                    obj.parent().next().find(".startPointVal").val(e.point.lng + "," + e.point.lat)
                }
                $('#myMapCol').modal('hide');
            });


            // $("#"+e.target.id).html(e.point.lng + "," + e.point.lat)
        });
    } catch (e) {
        console.log(e)
    }

})
let timer = null;
//执行线路模拟
$(document).on('click', '.runLineStatus', (e) => {
    try {
        if (timer) {
            clearTimeout(timer)
        }
        let obj = $(e.target)
        let parent = obj.parent();
        Bmap.lineIndex = parent.attr("index");
        let startPointVal = parent.find('.startPointVal').val();
        let endPointVal = parent.find('.endPointVal').val();
        let startPointArr = startPointVal.split(',');
        let endPointArr = endPointVal.split(',');
        Bmap.startTime = parent.find('.startTime').val().split(":");
        if (startPointArr.length !== 2) {
            alert("erorr")
        }
        if (endPointArr.length !== 2) {
            alert("erorr")
        }
        Bmap.startPoint = new BMap.Point(Number(startPointArr[0]), Number(startPointArr[1])); // 起点
        Bmap.endPoint = new BMap.Point(Number(endPointArr[0]), Number(endPointArr[1])); // 终点
        Bmap.initLine();
        timer = setTimeout(function () {
            Bmap.run();
        }, 5000);
        // $('#myModal').modal('hide')
    } catch (e) {
        console.log(e)
    }


})
//模拟驾驶
/*$(document).on('click', '#simulatedDriving', () => {
    Bmap.map.clearOverlays();
    getAllChargingStation();
    timer = setTimeout(function () {
        Bmap.runAll();
    }, 5000);
})*/
//模拟驾驶
$(document).on('click', '#simulatedDriving', () => {
    try {
        //获取线路映射关系并驾驶
        getEvLineMapping();

    } catch (e) {
        console.error(e)
    }

})
//获取当前任务
$(document).on('click', '#getcurrTasks', () => {
    const userIds = new Array();
    for (var key in Bmap.userCarMapping) {
        userIds.push(key)
    }
    const tasks = Task.getcurrTasks(userIds.join(","));
    for (let i = 0; i < tasks.length; i++) {
        Task.userIdList.push(tasks[i].owerId);
    }
    Task.taskList = tasks;
    Task.startAllTask();

})
//获取当前任务
$(document).on('click', '#getcurrTasks', () => {
    const userIds = new Array();
    for (var key in Bmap.userCarMapping) {
        userIds.push(key)
    }
    const tasks = Task.getcurrTasks(userIds.join(","));
    for (let i = 0; i < tasks.length; i++) {
        if (Task.taskFlag) {
            Task.currUserId = tasks[i].owerId;
            Task.userIdList.push(tasks[i].owerId);
            Task.userTasklist[Task.currUserId] = tasks[i];
            let position = Bmap.userCarMapping[Task.currUserId].getPosition();
            const startPoint = position.lng + "," + position.lat;
            const endPoint = tasks[i].point;
            Task.taskFlag = false;
            Task.getTaskLine(startPoint, endPoint);
        }
    }

})

//删除线路
$(document).on('click', '.delline', (e) => {
    let obj = $(e.target);
    let currObj = null;
    if (obj.hasClass("delline")) {

        currObj = obj.parent()
    } else {
        currObj = obj.parent().parent()
    }
    let lineId = currObj.attr("id");
    if (lineId) {
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api/tLine/delbyId",
            data: lineId,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log(data)
            },
            error: function (data) {
                if (data.responseText == 'success') {
                    currObj.prev().children("span:last-child").removeAttr("disabled");
                    currObj.remove();
                    getAllLine();
                }
            }
        });
    } else {
        currObj.prev().children("span:last-child").removeAttr("disabled");
        currObj.remove();
    }

})
//设置模拟时间
$(document).on("click", "#setSimulationTime", function () {
    $('#myTimeCol').modal('show');
    $('#myTimeCol .modal-body').html("");
    let divStr = "<div class=\"input-group lines-group\"></div>";
    let idStr = "<input id='simulationId' type=\"hidden\" class=\"form-control id\">";
    let timeStr = "<input id='simulationTime' type=\"text\" class=\"form-control startTime form-time\" placeholder=\"时间:选择或者输入一个时间：hh:mm\">";
    let fixStr = "<span class=\"input-group-addon fix-border fix-padding\">请选择快进系数</span>";
    let ffRatioStr = "<select id='ffRatio' placeholder='...' class='form-control ffRatio' tabindex='2' ><option value=''></option> <option value='10'>10倍</option> <option value='100'>100倍</option> <option value='1000'>1000倍</option></select>";
    let $divStr = $(divStr);
    let $idStr = $(idStr);
    let $timeStr = $(timeStr);
    let $fixStr = $(fixStr);
    let $ffRatioStr = $(ffRatioStr);
    $timeStr.datetimepicker({
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
    $divStr.append($idStr).append($timeStr).append($fixStr).append($ffRatioStr);
    $('#myTimeCol .modal-body').append($divStr);
    $("#simulationId").val(Bmap.simulationId);
    $("#simulationTime").val(Bmap.systemTime);
    $("#ffRatio").val(Bmap.ffRatio);
})
//保存系统时间
$(document).on("click", "#saveSystemTime", function () {
    Bmap.simulationId = $("#simulationId").val();
    Bmap.systemTime = $("#simulationTime").val() + ":00";
    Bmap.ffRatio = $("#ffRatio").val();
    if (!Bmap.ffRatio) {
        Bmap.ffRatio = 1;
    }
    setSystemTime();
    saveSystemSetting();
    $('#myTimeCol').modal('hide')

})
//获取交易列表
$(document).on("click", "#getTransactionAllList", function () {
    // alert(1);

    let param = {page: 1, size: 5};
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tTransaction/page/",
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            createTable(data);
        },
        error: function (data) {
            if (data.responseText == 'success') {
                createTable(data);

            }
        }
    });
})
//交易列表翻页操作
$(document).on('click', '#transactionListTools li', (e) => {
    let page = $(e.target).text();
    let currPageObj = '';
    let flag = true;
    if (page == '«') {
        flag = false;
        page = $("#transactionListTools li.active").text();
        if (page != 1) {
            currPageObj = $("#transactionListTools li.active").prev();
            $("#transactionListTools li.active").removeClass('active');
            currPageObj.addClass('active');
        }
        page = currPageObj.text();
    }
    if (page == '»') {
        flag = false;
        page = $("#transactionListTools li.active").text();
        const maxPage = $("#transactionListTools").data("pages");
        if (page != maxPage) {
            currPageObj = $("#transactionListTools li.active").next();
            $("#transactionListTools li.active").removeClass('active');
            currPageObj.addClass('active');
        }
        page = currPageObj.text();
    }
    if (flag) {
        $("#transactionListTools li").removeClass('active');
        $(e.target).parent().addClass('active');
    }
    let param = {page: parseInt(page), size: 5};
    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tTransaction/page/",
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            createTable(data);
        },
        error: function (data) {
            if (data.responseText == 'success') {
                createTable(data);

            }
        }
    });
    console.log(page);
})

//创建交易表格
function createTable(data) {
    $('#transactionListCol').modal('show');
    $('#transactionListCol .modal-title').text("交易列表");
    $('#transactionListCol .modal-body').html("");
    const htmlStr = "<table id='transactionList' class=\"table table-bordered\">\n" +
        "  <thead>\n" +
        "    <tr>\n" +
        "      <th>交易ID</th>\n" +
        "      <th>区块号</th>\n" +
        "      <th>时间</th>\n" +
        "      <th>转出</th>\n" +
        "      <th><i class=\"icon icon-long-arrow-right\"></i></th>\n" +
        "      <th>转入</th>\n" +
        "      <th>金额</th>\n" +
        "      <th>电量</th>\n" +
        "    </tr>\n" +
        "  </thead>\n" +
        "  <tbody>\n" +
        "  </tbody>\n" +
        "</table>";
    $('#transactionListCol .modal-body').html(htmlStr);
    console.log(data);
    const records = data.records;
    for (let i = 0; i < records.length; i++) { //(dateToString(new Date(records[i].txTime))
        let trStr = "<tr><td>" + records[i].txId + "</td><td>" + records[i].blockNumber + "</td><td>" + dateFormat(records[i].txTime) + "</td><td>" + records[i].txFrom + "</td><td>....</td><td>" + records[i].txTo + "</td><td>" + records[i].txValue + "</td><td>" + records[i].txPower + "</td></tr>";
        $('#transactionListCol #transactionList thead').append($(trStr));
    }
    const pageStart = "<div id='transactionListTools'><ul class=\"pager\"><li class=\"previous\"><a>«</a></li>";
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

$(document).on('click', '#viewElectricityPrice', (e) => {
    $('#electricityPriceCol').modal('show');
    $('#electricityPriceCol .modal-title').text('实时电价');
    let q = new Queue();
    //debugger;
    q.enqueue("Meredith");
    q.enqueue("Cynthia");
    q.enqueue("Jennifer");
    q.dequeue();
    console.log(q.toString());
    const objA = {
        type: 'initAccount',
        id: 'A',
        value: '2000',
    }
    const objC = {
        type: 'initAccount',
        id: 'B',
        value: '5000',
    }
    const objB = {
        type: 'queryAccount',
        id: 'A',
    }
    const objD = {
        type: 'transferAccounts',
        from: 'A',
        to: 'B',
        value: '100',
    }
    const objE = {
        type: 'queryAccount',
        id: 'B',
    }
    // ws.send(JSON.stringify(objA));
    // ws.send(JSON.stringify(objC));
    ws.send(JSON.stringify(objD));
    ws.send(JSON.stringify(objB));

    ws.send(JSON.stringify(objE));
    // $('#electricityPriceCol .modal-body').html("");
    // require.config({
    //     paths: {
    //         echarts: 'http://echarts.baidu.com/build/dist'
    //     }
    // });
    let xStr = "0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24";
    let yStr = "0.25,0.25,0.25,0.21,0.21,0.17,0.17,0.06,0.06,0.06,0.06,0.19,0.19,0.38,0.38,0.46,0.46,0.55,0.55,0.56,0.56,0.53,0.53,0.52,0.52,0.51,0.51,0.52,0.52,0.52,0.52,0.48,0.48,0.5,0.5,0.59,0.59,0.69,0.69,0.62,0.62,0.57,0.57,0.49,0.49,0.5,0.5,0.51,0.51";
    const xStrArr = xStr.split(",");
    const yStrArr = yStr.split(",");
    let data = new Array();
    let xdata = new Array();
    let ydata = new Array();
    for (let i = 0; i < xStrArr.length; i++) {
        let uData = new Array();
        // if(i%2==0){
        xdata.push(xStrArr[i]);
        ydata.push(yStrArr[i]);
        // }

        uData.push(xStrArr[i]);
        // uData.push(parseInt(xStrArr[i]));
        // uData.push(parseFloat(yStrArr[i]));
        uData.push(yStrArr[i]);
        data.push(uData);
    }
    console.log(data);
    loadScript("http://echarts.baidu.com/build/dist/echarts.js", function () {

        // 路径配置
        require.config({
            paths: {
                echarts: 'http://echarts.baidu.com/build/dist'
            }
        });

        // 使用
        require(
            [
                'echarts',
                'echarts/chart/line' // 使用柱状图就加载bar模块，按需加载
            ],
            function (ec) {
                // 基于准备好的dom，初始化echarts图表
                var myChart = ec.init(document.getElementById('echartsMain'));
                option = {
                    title: {
                        /* text: '实时电量',
                         subtext: '实时电量'*/
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            show: true,
                            type: 'cross',
                            lineStyle: {
                                type: 'dashed',
                                width: 1
                            }
                        },
                        formatter: function (params) {
                            return params.seriesName + ' : [ '
                                // + params.value[0] + ', '
                                + params.value[1] + '元/kW.h ]';
                        }
                    },
                    legend: {
                        data: ['电价']
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            // dataZoom: {show: true},
                            // dataView: {show: true, readOnly: false},
                            // magicType: {show: true, type: ['line', 'bar']},
                            // restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    xAxis: [
                        {
                            type: 'value',
                            boundaryGap: false,
                            min: 0,
                            max: 24,
                            splitNumber: 24,
                            data: xdata,
                            axisLabel: {
                                formatter: '{value}',
                                interval: 1,
                            },
                            name: '时间:t/h',
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            data: ydata,
                            splitNumber: 5,
                            axisLine: {
                                lineStyle: {
                                    color: '#dc143c'
                                }
                            },
                            name: '电价:元/kW.h',
                        }
                    ],
                    series: [
                        {
                            name: '电价',
                            type: 'line',
                            data: data,
                            /*   markPoint: {
                                   data: [
                                       // 纵轴，默认
                                       {
                                           type: 'max',
                                           name: '最大值',
                                           symbol: 'emptyCircle',
                                           itemStyle: {normal: {color: '#dc143c', label: {position: 'top'}}}
                                       },
                                       {
                                           type: 'min',
                                           name: '最小值',
                                           symbol: 'emptyCircle',
                                           itemStyle: {normal: {color: '#dc143c', label: {position: 'bottom'}}}
                                       },
                                       // 横轴
                                       {
                                           type: 'max',
                                           name: '最大值',
                                           valueIndex: 0,
                                           symbol: 'emptyCircle',
                                           itemStyle: {normal: {color: '#1e90ff', label: {position: 'right'}}}
                                       },
                                       {
                                           type: 'min',
                                           name: '最小值',
                                           valueIndex: 0,
                                           symbol: 'emptyCircle',
                                           itemStyle: {normal: {color: '#1e90ff', label: {position: 'left'}}}
                                       }
                                   ]
                               },*/
                            // markLine: {
                            //     data: [
                            //         // 纵轴，默认
                            //         {type: 'max', name: '最大值', itemStyle: {normal: {color: '#dc143c'}}},
                            //         {type: 'min', name: '最小值', itemStyle: {normal: {color: '#dc143c'}}},
                            //         {type: 'average', name: '平均值', itemStyle: {normal: {color: '#dc143c'}}},
                            //         // 横轴
                            //         {type: 'max', name: '最大值', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}},
                            //         {type: 'min', name: '最小值', valueIndex: 0, itemStyle: {normal: {color: '#1e90ff'}}},
                            //         {
                            //             type: 'average',
                            //             name: '平均值',
                            //             valueIndex: 0,
                            //             itemStyle: {normal: {color: '#1e90ff'}}
                            //         }
                            //     ]
                            // }
                        }
                    ]
                };

                // 为echarts对象加载数据
                myChart.setOption(option);
            }
        );

    });

})

$(document).on('click', '#getPowerHistoryEchart', (e) => {
    $('#electricityPriceCol').modal('show');
    $('#electricityPriceCol .modal-title').text('电量图');

    $.ajax({
        type: "post",
        url: "http://10.168.1.235:10200/api/tPowerHistory/echarts",
        data: "",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            const seriesData = new Array();
            for (var key in data.powerMap) {
                const obj = {
                    name: key,
                    type: 'line',
                    stack: '总量',
                    data: data.powerMap[key]
                }
                seriesData.push(obj);
                // console.log("属性：" + key + ",值：" + map[key]);
            }
            /*for (let i = 0; i < data.powerMap.length; i++) {
                const obj = {
                    name: '邮件营销',
                    type: 'line',
                    stack: '总量',
                    data: [120, 132, 101, 134, 90, 230, 210]
                }
            }*/
            loadScript("http://echarts.baidu.com/build/dist/echarts.js", function () {

                // 路径配置
                require.config({
                    paths: {
                        echarts: 'http://echarts.baidu.com/build/dist'
                    }
                });

                // 使用
                require(
                    [
                        'echarts',
                        'echarts/chart/line' // 使用柱状图就加载bar模块，按需加载
                    ],
                    function (ec) {
                        // 基于准备好的dom，初始化echarts图表
                        var myChart = ec.init(document.getElementById('echartsMain'));
                        option = {
                            title: {
                                text: ''
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                // data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
                                data: data.userNameList
                            },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },
                            toolbox: {
                                feature: {
                                    saveAsImage: {}
                                }
                            },
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,
                                // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                                data: data.timeList
                            },
                            yAxis: {
                                type: 'value'
                            },
                            series: seriesData
                            /*[
                                {
                                    name: '邮件营销',
                                    type: 'line',
                                    stack: '总量',
                                    data: [120, 132, 101, 134, 90, 230, 210]
                                },
                                {
                                    name: '联盟广告',
                                    type: 'line',
                                    stack: '总量',
                                    data: [220, 182, 191, 234, 290, 330, 310]
                                },
                                {
                                    name: '视频广告',
                                    type: 'line',
                                    stack: '总量',
                                    data: [150, 232, 201, 154, 190, 330, 410]
                                },
                                {
                                    name: '直接访问',
                                    type: 'line',
                                    stack: '总量',
                                    data: [320, 332, 301, 334, 390, 330, 320]
                                },
                                {
                                    name: '搜索引擎',
                                    type: 'line',
                                    stack: '总量',
                                    data: [820, 932, 901, 934, 1290, 1330, 1320]
                                }
                            ]*/
                        };

                        // 为echarts对象加载数据
                        myChart.setOption(option);
                    }
                );

            });
            console.log(data);
        }
    });


})
