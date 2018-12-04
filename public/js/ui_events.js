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

    connect_to_server();

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
        debugger;
        console.log(that);
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
    if (lines.length) {
        saveLines(lines);
    } else if (chargingPiles.length) {
        saveChargingPile(chargingPiles);
    } else if (chargingStations.length) {
        saveChargingStation(chargingStations);
    }

})

//保存充电站
function saveChargingStation(chargingStations) {
    let chargingStationsArr = new Array();
    $.each(chargingStations, (index, chargingStation) => {
        chargingStation = $(chargingStation);
        console.log(chargingStation);
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
        console.log(chargingStationObj)
        $.ajax({
            type: "post",
            url: "http://10.168.1.240:10200/api/tChargingStation/save",
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

//保存充电桩
function saveChargingPile(chargingPiles) {
    let chargingPilesArr = new Array();
    $.each(chargingPiles, (index, chargingPile) => {
        chargingPile = $(chargingPile);
        console.log(chargingPile);
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
        console.log(chargingPileObj)
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

//保存线路
function saveLines(lines) {
    let linesArr = new Array();
    $.each(lines, (index, line) => {
        line = $(line);
        console.log(line);
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

//关闭弹窗
$(document).on('click', '#closeModal', () => {
    $('#myModal').modal('hide')
})
//打开新建线路弹窗
$(document).on('click', '#openModalNewXl', () => {
    $('#myModal .modal-body').html("");
    createLine(0);
})
$(document).on('click', '#addInputXl', () => {
    //var index = $("#myModal div").length-7
    //console.log(index)
    let endTimeVal = $(".endTime").eq($(".endTime").length - 1).val();
    if (endTimeVal) {
        createLine(1)
    } else {
        Bmap.vue.$message({message: '请先执行上一条线路。', type: 'error'})
    }

})

//创建线路
function createLine(num) {
    var index = null;
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
    var divStr = "<div class=\"input-group lines-group\" index='" + index + "'></div>";
    var lag1Str = "<span class=\"input-group-addon\"> 线路：</span>";
    var lag2Str = "<input id='startPoint" + index + "' type=\"text\" class=\"form-control startPoint mapSelectPoint\" placeholder=\"起点\">";
    var lag3Str = "<input id='startPointVal" + index + "' type=\"hidden\" class=\"form-control startPointVal mapSelectPoint\" placeholder=\"起点\">";
    var lag4Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag5Str = "<input id='endPoint" + index + "' type=\"text\" class=\"form-control endPoint mapSelectPoint\" placeholder=\"终点\">";
    var lag6Str = "<input id='endPointVal" + index + "' type=\"hidden\" class=\"form-control endPointVal mapSelectPoint\" placeholder=\"终点\">";
    var lag7Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag8Str = "<input id='startTime" + index + "' type=\"text\" class=\"form-control startTime form-time\" placeholder=\"开始时间:选择或者输入一个时间：hh:mm\">";
    var lag9Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag10Str = "<input id='endTime" + index + "' type=\"text\" readonly=\"readonly\" class=\"form-control endTime form-time\" placeholder=\"结束时间:hh:mm\">";
    /* var lag11Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";*/
    var lag11Str = "<span id='startPoint" + index + "' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
    var lag12Str = "<span id='delLine" + index + "' class=\"input-group-addon fix-border fix-padding btn btn-danger delline\"><i class=\"icon icon-trash\"></i>删除</span>";
    var $divStr = $(divStr);
    var $lag1Str = $(lag1Str);
    var $lag2Str = $(lag2Str);
    var $lag3Str = $(lag3Str);
    var $lag4Str = $(lag4Str);
    var $lag5Str = $(lag5Str);
    var $lag6Str = $(lag6Str);
    var $lag7Str = $(lag7Str);
    var $lag8Str = $(lag8Str);
    var $lag9Str = $(lag9Str);
    var $lag10Str = $(lag10Str);
    /*   var $lag11Str = $(lag11Str);*/
    var $lag11Str = $(lag11Str);
    var $lag12Str = $(lag12Str);
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
    /* var lineIput = "<div class=\"input-group\">\n" +
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

//新建充电站
function createChargingStation(num) {
    var index = null;
    $("#addInputXl").hide();
    $("#addInputChargingStation").show();
    $("#addInputChargingPile").hide();
    /*if (num == 0) {
        index = 0
        $('#myModal .modal-body').append("<select id='userId' data-placeholder='请选择用户...' class='chosen-select form-control' tabindex='2' ><option value=''></option> <option value='1'>user1</option> <option value='2'>user2</option> <option value='3'>user3</option></select>");
    } else {
        index = $(".input-group").length
    }*/
    index = $(".input-group").length
    /*var index = $("#myModal div").length - 5*/
    var divStr = "<div class=\"input-group ChargingStation-group\" index='" + index + "'></div>";
    var lag1Str = "<span class=\"input-group-addon\"> 充电站：</span>";
    var lag2Str = "<input id='name" + index + "' type=\"text\" class=\"form-control name \" placeholder=\"充电站名称\">";
    var lag3Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag4Str = "<input id='position" + index + "' type=\"text\" class=\"form-control position mapSelectPoint\" placeholder=\"充电站位置\">";
    var lag5Str = "<input id='position_val" + index + "' type=\"hidden\" class=\"form-control position_val mapSelectPoint\" placeholder=\"充电站位置\">";
    var lag6Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag7Str = "<input id='capacity" + index + "' type=\"text\" class=\"form-control capacity\" placeholder=\"充电站容量\">";
    var lag8Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag9Str = "<input id='charging_efficiency" + index + "' type=\"text\" class=\"form-control charging_efficiency\" placeholder=\"充电效率\">";
    var lag10Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag11Str = "<select data-placeholder='选择运行状态...' class='chosen-select form-control state-select' tabindex='2' <option value=''></option> <option value='1'>正常</option> <option value='0'>停运</option> </select>";
    var lag12Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag13Str = "<input id='run_time" + index + "' type=\"text\" class=\"form-control run_time form-time\" placeholder=\"投运时间：yyyy-MM-dd\">"; //readonly="readonly"
    /* var lag11Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";*/
    // var lag11Str = "<span id=id='startPoint"+index+"' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
    var $divStr = $(divStr);
    var $lag1Str = $(lag1Str);
    var $lag2Str = $(lag2Str);
    var $lag3Str = $(lag3Str);
    var $lag4Str = $(lag4Str);
    var $lag5Str = $(lag5Str);
    var $lag6Str = $(lag6Str);
    var $lag7Str = $(lag7Str);
    var $lag8Str = $(lag8Str);
    var $lag9Str = $(lag9Str);
    var $lag10Str = $(lag10Str);
    var $lag11Str = $(lag11Str);
    var $lag12Str = $(lag12Str);
    var $lag13Str = $(lag13Str);
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
    /* var lineIput = "<div class=\"input-group\">\n" +
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

//新建充电桩
function createChargingPile(num) {
    let index = null;
    $("#addInputXl").hide();
    $("#addInputChargingStation").hide();
    $("#addInputChargingPile").show();
    index = $(".input-group").length;
    /* var index = $("#myModal div").length - 5*/
    var divStr = "<div class=\"input-group ChargingPile-group\" index='" + index + "'></div>";
    var lag0Str = "<span class=\"input-group-addon\"> 充电桩：</span>";
    var lag1Str = "<select id='csId" + index + "' placeholder='请选择充电站...' class='form-control csId-select' tabindex='2' ><option value=''></option> <option value='1'>user1</option> <option value='2'>user2</option> <option value='3'>user3</option></select>";
    var lag1_1Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag2Str = "<input id='name" + index + "' type=\"text\" class=\"form-control name \" placeholder=\"充电桩名称\">";
    var lag3Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag4Str = "<input id='position" + index + "' type=\"text\" class=\"form-control position mapSelectPoint\" placeholder=\"充电桩位置\">";
    var lag5Str = "<input id='position_val" + index + "' type=\"hidden\" class=\"form-control position_val mapSelectPoint\" placeholder=\"充电桩位置\">";
    var lag6Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag7Str = "<input id='capacity" + index + "' type=\"text\" class=\"form-control capacity\" placeholder=\"充电桩容量\">";
    var lag8Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag9Str = "<input id='charging_efficiency" + index + "' type=\"text\" class=\"form-control charging_efficiency\" placeholder=\"充电效率\">";
    var lag10Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag11Str = "<select data-placeholder='选择运行状态...' class='form-control state-select' tabindex='2' <option value=''></option> <option value='1'>正常</option> <option value='0'>停运</option> </select>";
    var lag12Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
    var lag13Str = "<input id='run_time" + index + "' type=\"text\" class=\"form-control run_time form-time\" placeholder=\"投运时间：yyyy-MM-dd\">"; //readonly="readonly"
    /* var lag11Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";*/
    // var lag11Str = "<span id=id='startPoint"+index+"' class=\"input-group-addon fix-border fix-padding btn btn-primary runLineStatus\"><i class=\"icon icon-star\"></i>执行</span>";
    var $divStr = $(divStr);
    var $lag0Str = $(lag0Str);
    var $lag1Str = $(lag1Str);
    var $lag1_1Str = $(lag1_1Str);
    var $lag2Str = $(lag2Str);
    var $lag3Str = $(lag3Str);
    var $lag4Str = $(lag4Str);
    var $lag5Str = $(lag5Str);
    var $lag6Str = $(lag6Str);
    var $lag7Str = $(lag7Str);
    var $lag8Str = $(lag8Str);
    var $lag9Str = $(lag9Str);
    var $lag10Str = $(lag10Str);
    var $lag11Str = $(lag11Str);
    var $lag12Str = $(lag12Str);
    var $lag13Str = $(lag13Str);
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
    /* var lineIput = "<div class=\"input-group\">\n" +
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

//获取地图上点的位置.
$(document).on('click', '.mapSelectPoint', (e) => {
    try {
        var obj = $(e.target)
        $('#myMapCol .modal-body').html("");
        var mapCol = $("<div id='mapSelectBox' class='mapSelectBox'></div>")
        $('#myMapCol .modal-body').append(mapCol)
        $('#myMapCol').modal('show');
        var centerPoint = [104.0863, 30.656913];
        var map = new BMap.Map("mapSelectBox");
        map.enableScrollWheelZoom(true);
        // 104.0863, 30.656913
        map.centerAndZoom(new BMap.Point(centerPoint[0], centerPoint[1]), 15);
        map.addEventListener("click", function (e) {
            obj.next().val(e.point.lng + "," + e.point.lat);
            var geoc = new BMap.Geocoder();
            var pt = e.point;
            geoc.getLocation(pt, function (rs) {
                var addComp = rs.addressComponents;
                // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
                var nameStr = addComp.district + addComp.street + addComp.streetNumber;
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
        var obj = $(e.target)
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
        $('#myModal').modal('hide')
    } catch (e) {
        console.log(e)
    }


})
//模拟驾驶
$(document).on('click', '#simulatedDriving', () => {
    Bmap.map.clearOverlays();
    getAllChargingStation();
    timer = setTimeout(function () {
        Bmap.runAll();
    }, 5000);
})

//删除线路
$(document).on('click', '.delline', (e) => {
    var obj = $(e.target);
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
            url: "http://10.168.1.240:10200/api/tLine/delbyId",
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

//获取所有线路
function getAllLine() {
    $.ajax({
        type: "post",
        url: "http://10.168.1.240:10200/api/tLine/list",
        data: '',
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            if (data.length) {
                $.each(data, (index, obj) => {
                    Bmap.line = obj;
                    const startPointArr = obj.startPointVal.split(",");
                    Bmap.lineIndex = obj.sort;
                    Bmap.lineId = obj.id;
                    Bmap.startTime = obj.startTime;
                    Bmap.endTime = obj.endTime;
                    const endPointArr = obj.endPointVal.split(",");
                    Bmap.startPoint = new BMap.Point(Number(startPointArr[0]), Number(startPointArr[1])); // 起点
                    Bmap.endPoint = new BMap.Point(Number(endPointArr[0]), Number(endPointArr[1])); // 终点
                    Bmap.initLine();
                })
            }
        }
    });

}

//获取所有充电站
function getAllChargingStation() {
    $.ajax({
        type: "post",
        url: "http://10.168.1.240:10200/api/tChargingStation/list",
        data: '',
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            if (data.length) {
                $.each(data, (index, obj) => {
                    Bmap.myIconInit("../imgs/chargingStation.png", 36, 36, 0, 0, 0, 0);
                    let strings = obj.positionVal.split(',');
                    let point = new BMap.Point(strings[0], strings[1])
                    let carMk = new BMap.Marker(point, {icon: Bmap.myIcon, title: obj.name});
                    carMk.addEventListener("click", showCar);
                    Bmap.map.addOverlay(carMk);
                    console.log(obj.positionVal);
                })
            }
        }
    });

}

function showCar(e, m) {
    let title = $(e.currentTarget.V.outerHTML).attr("title");
    $.ajax({
        type: "post",
        url: "http://10.168.1.240:10200/api/tChargingStation/getChargingStationByName",
        data: title,
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data)
            if (data.length) {
                // $.each(data, (index, obj) => {
                //     Bmap.myIconInit("../imgs/chargingStation.png", 36, 36, 0, 0, 0, 0);
                //     let strings = obj.positionVal.split(',');
                //     let point = new BMap.Point(strings[0], strings[1])
                //     let carMk = new BMap.Marker(point, {icon: Bmap.myIcon, title: obj.name});
                //     carMk.addEventListener("click", showCar);
                //     Bmap.map.addOverlay(carMk);
                //     console.log(obj.positionVal);
                // })
            }
        }
    });
}