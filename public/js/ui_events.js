/* global $, window, document */
/* global toTitleCase, connect_to_server, refreshHomePanel, closeNoticePanel, openNoticePanel, show_tx_step, marbles*/
/* global pendingTxDrawing:true */
/* exported record_company, autoCloseNoticePanel, start_up, block_ui_delay*/
let ws = {};
let bgcolors = ['whitebg', 'blackbg', 'redbg', 'greenbg', 'bluebg', 'purplebg', 'pinkbg', 'orangebg', 'yellowbg'];
let autoCloseNoticePanel = null;
let known_companies = {};
let start_up = true;
let lsKey = 'marbles';
let fromLS = {};
let block_ui_delay = 15000; 								//default, gets set in ws block msg
let auditingMarble = null;

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
        let obj = {
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
            for (let i in bgcolors) $('.createball').removeClass(bgcolors[i]);		//reset
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
        let color = $(this).attr('color');
        let html = '<span class="fa fa-circle colorSelected ' + color + '" color="' + color + '"></span>';

        $(this).parent().parent().find('.colorValue').html(html);
        $(this).parent().hide();

        for (let i in bgcolors) $('.createball').removeClass(bgcolors[i]);		//remove prev color
        $('.createball').css('border', '0').addClass(color + 'bg');				//set new color
    });

    //username/company search
    $('#searchUsers').keyup(function () {
        let count = 0;
        let input = $(this).val().toLowerCase();
        for (let i in known_companies) {
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
            let parts = input.split(',');
            console.log('searching on', parts);

            //figure out if the user matches the search
            $('.marblesWrap').each(function () {												//iter on each marble user wrap
                let username = $(this).attr('username');
                let company = $(this).attr('company');
                if (username && company) {
                    let full = (username + company).toLowerCase();
                    let show = false;

                    for (let x in parts) {													//iter on each search term
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
        let company = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('company');
        let username = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('username');
        let owner_id = $(this).parents('.innerMarbleWrap').parents('.marblesWrap').attr('owner_id');
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
        let size = $(this).val();
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
        let marble_id = $(that).attr('id');
        $('.auditingMarble').removeClass('auditingMarble');

        if (!auditingMarble || marbles[marble_id].id != auditingMarble.id) {//different marble than before!
            for (let x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);
            $('.txHistoryWrap').html('');										//clear
        }

        auditingMarble = marbles[marble_id];
        console.log('\nuser clicked on marble', marble_id);

        if (open || $('#auditContentWrap').is(':visible')) {
            $(that).addClass('auditingMarble');
            $('#auditContentWrap').fadeIn();
            $('#marbleId').html(marble_id);
            let color = marbles[marble_id].color;
            for (let i in bgcolors) $('.auditMarble').removeClass(bgcolors[i]);	//reset
            $('.auditMarble').addClass(color.toLowerCase() + 'bg');

            $('#rightEverything').addClass('rightEverythingOpened');
            $('#leftEverything').fadeIn();

            let obj2 = {
                type: 'audit',
                marble_id: marble_id
            };
            ws.send(JSON.stringify(obj2));
        }
    }

    $('#auditClose').click(function () {
        $('#auditContentWrap').slideUp(500);
        $('.auditingMarble').removeClass('auditingMarble');												//reset
        for (let x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);
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
        let obj = {
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


/*
$(document).on("click", "#evLineMapping", function () {

})*/
