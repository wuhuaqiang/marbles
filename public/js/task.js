Task = {
    userTasklist: {},
    currUserId: null,
    userIdQueue: new Queue(),
    userIdList: new Array(),
    taskIndexMark: 0,
    taskList: null,
    getcurrTasks: (userIds) => {
        let result;
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api/tTask/currTaskList",
            data: userIds,
            async: false,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                result = data;
            }
        });
        return result;
    },
    getcurrTaskByUserId: (userId) => {
        let result;
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api/tTask/currTaskByOwerId",
            data: userId,
            async: false,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log(data);
                result = data;
                if (data) {
                    Task.userTasklist[data.owerId] = data;
                } else {
                    Task.userTasklist[Task.currUserId] = "";
                    Task.currUserId = "";
                }

                //Task.taskList[data.owerId] = data;
            },
            error: function () {
                Task.userTasklist[Task.currUserId] = "";
                Task.currUserId = "";
            }
        });
        return result;
    },
    getChargingLine: (startPoint, endPoint) => {
        let driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: Task.getChargingLinePoints});  // 驾车实例,并设置回调
        driving.search(startPoint, endPoint);
    },
    getTaskLine: (startPoint, endPoint) => {
        let startPointArr = startPoint.split(",");
        let endPointArr = endPoint.split(",");
        Bmap.startPoint = new BMap.Point(Number(startPointArr[0]), Number(startPointArr[1])); // 起点
        Bmap.endPoint = new BMap.Point(Number(endPointArr[0]), Number(endPointArr[1])); // 终点
        let driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: Task.getLinePoints});  // 驾车实例,并设置回调
        driving.search(Bmap.startPoint, Bmap.endPoint);
    },
    getAllTaskLine: (startPoint, endPoint) => {
        let startPointArr = startPoint.split(",");
        let endPointArr = endPoint.split(",");
        Bmap.startPoint = new BMap.Point(Number(startPointArr[0]), Number(startPointArr[1])); // 起点
        Bmap.endPoint = new BMap.Point(Number(endPointArr[0]), Number(endPointArr[1])); // 终点
        let driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: Task.getAllLinePoints});  // 驾车实例,并设置回调
        driving.search(Bmap.startPoint, Bmap.endPoint);
    },
    getChargingLinePoints: (results) => {
        let plan = results.getPlan(0);
        let duration = plan.getDuration(true);
        let distance = plan.getDistance(true);
        for (let i = 0; i < plan.getNumRoutes(); i++) {
            let route = plan.getRoute(i);
            let pts = getDetailPints(route.getPath(), 0.0001, 0.00001);
            let min = 0, hour = 0;
            if (duration.indexOf("小时") === -1) {
                min = parseInt(duration);

            } else if (duration.indexOf("分钟") === -1) {
                hour = parseInt(duration.substring(0, duration.indexOf("小时")))
            } else {
                hour = parseInt(duration.substring(0, duration.indexOf("小时")))
                min = parseInt(duration.substring(duration.indexOf("小时") + 2, duration.indexOf("分钟")))
            }
            // debugger;
            distance = parseFloat(distance);
            let speek = distance / (hour + min / 60);
            const time = (hour * 60 + min) * 60 * 1000;
            let carMk = Bmap.currCar;
            let len = pts.length;
            let timer = setTimeout(function () {
                Bmap.resetMkPointAll(1, len, pts, carMk, time)
            }, 1000);

        }
    },
    getLinePoints: (results) => {
        let currUserId = Bmap.userIdQueue.front();
        if (!currUserId) {
            return;
        }
        let plan = results.getPlan(0);
        let duration = plan.getDuration(true);
        let distance = plan.getDistance(true);
        for (let i = 0; i < plan.getNumRoutes(); i++) {
            let route = plan.getRoute(i);
            Task.userTasklist[currUserId].linePoints = getDetailPints(route.getPath(), 0.0001, 0.00001);
            Task.userTasklist[currUserId].car = Bmap.userCarMapping[currUserId];
            let min = 0, hour = 0;
            if (duration.indexOf("小时") === -1) {
                min = parseInt(duration);

            } else if (duration.indexOf("分钟") === -1) {
                hour = parseInt(duration.substring(0, duration.indexOf("小时")))
            } else {
                hour = parseInt(duration.substring(0, duration.indexOf("小时")))
                min = parseInt(duration.substring(duration.indexOf("小时") + 2, duration.indexOf("分钟")))
            }
            // debugger;
            distance = parseFloat(distance);
            let speek = distance / (hour + min / 60);
            const timer = (hour * 60 + min) * 60 * 1000;
            Task.userTasklist[currUserId].timer = timer;
            console.log(currUserId);
        }
        Task.runTask(currUserId);
    },
    getAllLinePoints: (results) => {
        let plan = results.getPlan(0);
        let duration = plan.getDuration(true);
        let distance = plan.getDistance(true);
        for (let i = 0; i < plan.getNumRoutes(); i++) {
            let route = plan.getRoute(i);
            Task.userTasklist[Task.userIdList[Task.taskIndexMark]].linePoints = getDetailPints(route.getPath(), 0.0001, 0.00001);
            Task.userTasklist[Task.userIdList[Task.taskIndexMark]].car = Bmap.userCarMapping[Task.userIdList[Task.taskIndexMark]];
            let min = 0, hour = 0;
            if (duration.indexOf("小时") === -1) {
                min = parseInt(duration);

            } else if (duration.indexOf("分钟") === -1) {
                hour = parseInt(duration.substring(0, duration.indexOf("小时")))
            } else {
                hour = parseInt(duration.substring(0, duration.indexOf("小时")))
                min = parseInt(duration.substring(duration.indexOf("小时") + 2, duration.indexOf("分钟")))
            }
            // debugger;
            distance = parseFloat(distance);
            let speek = distance / (hour + min / 60);
            const timer = (hour * 60 + min) * 60 * 1000;
            Task.userTasklist[Task.userIdList[Task.taskIndexMark]].timer = timer;
        }
        Task.runAllTask();
    },
    runTask: (currUserId) => {
        console.log(currUserId);
        let pts = Task.userTasklist[currUserId].linePoints;
        let carMk = Task.userTasklist[currUserId].car
        let len = pts.length;
        let time = Task.userTasklist[currUserId].timer
        let startLong = Task.userTasklist[currUserId].time;
        let timer = setTimeout(function () {
            Bmap.resetMkPointAll(1, len, pts, carMk, time)
        }, startLong / Bmap.ffRatio);
        Bmap.userIdQueue.dequeue();
    },
    runAllTask: () => {
        let pts = Task.userTasklist[Task.userIdList[Task.taskIndexMark]].linePoints;
        let carMk = Task.userTasklist[Task.userIdList[Task.taskIndexMark]].car;
        let len = pts.length;
        let time = Task.userTasklist[Task.userIdList[Task.taskIndexMark]].timer;
        let startLong = Task.taskList[Task.taskIndexMark].time;
        let splitTime = Bmap.systemTime.split(":");
        const currLong = (parseInt(splitTime[0]) * 60 * 60 + parseInt(splitTime[1]) * 60 + parseInt(splitTime[2])) * 1000;

        let timer = setTimeout(function () {
            Bmap.resetMkPointAll(1, len, pts, carMk, time)
        }, (startLong - currLong) / Bmap.ffRatio);
        if (Task.taskIndexMark < Task.taskList.length - 1) {
            Task.taskIndexMark++;
            Task.startAllTask();
        }
    },
    startAllTask: () => {
        Task.currUserId = Task.taskList[Task.taskIndexMark].owerId;
        Task.userTasklist[Task.userIdList[Task.taskIndexMark]] = Task.taskList[Task.taskIndexMark];
        let position = Bmap.userCarMapping[Task.userIdList[Task.taskIndexMark]].getPosition();
        const startPoint = position.lng + "," + position.lat;
        const endPoint = Task.taskList[Task.taskIndexMark].point;
        Task.getAllTaskLine(startPoint, endPoint);
    }
    ,
    startTask: (currUserId) => {
        if (currUserId) {
            let position = Bmap.userCarMapping[currUserId].getPosition();
            const startPoint = position.lng + "," + position.lat;
            const endPoint = Task.userTasklist[currUserId].point;
            if (endPoint) {
                Task.getTaskLine(startPoint, endPoint);
            } else {
                Bmap.userIdQueue.dequeue();
            }
        }

    },
    createTask: (num) => {
        let index = null;
        $("#addInputXl").hide();
        $("#addInputChargingStation").hide();
        $("#addInputTask").show();
        $("#addInputChargingPile").hide();
        if (num == 0) {
            index = 0
            let opt = "<div class='input-group'><span class=\"input-group-addon\"> 选择用户：</span><select id='userId' data-placeholder='请选择用户...' class='chosen-select form-control' tabindex='2' ><option value=''></option>"
            for (let i = 0; i < User.userList.length; i++) {
                opt += "<option value=" + User.userList[i].id + ">" + User.userList[i].name + "</option>"
            }
            opt += "</select></div>";
            $('#myModal .modal-body').append(opt);
        } else {
            index = $(".input-group").length
        }
        let divStr = "<div class=\"input-group tasks-group\" index='" + index + "'></div>";
        let lag1Str = "<span class=\"input-group-addon\"> 任务：</span>";
        let lag2Str = "<input id='point" + index + "' type=\"text\" class=\"form-control point mapSelectPoint\" placeholder=\"请输入目的地\">";
        let lag3Str = "<input id='pointVal" + index + "' type=\"hidden\" class=\"form-control pointVal mapSelectPoint\">";
        let lag4Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
        let lag5Str = "<input id='timeHour" + index + "' type=\"text\"  class=\"form-control timeHour\" placeholder=\"输入间隔小时\">";
        let lag6Str = "<span class=\"input-group-addon fix-border fix-padding\"></span>";
        let lag7Str = "<input id='timeMinute" + index + "' type=\"text\"  class=\"form-control timeMinute\" placeholder=\"输入间隔分钟\">";
        let $divStr = $(divStr);
        let $lag1Str = $(lag1Str);
        let $lag2Str = $(lag2Str);
        let $lag3Str = $(lag3Str);
        let $lag4Str = $(lag4Str);
        let $lag5Str = $(lag5Str);
        let $lag6Str = $(lag6Str);
        let $lag7Str = $(lag7Str);
        $divStr.append($lag1Str).append($lag2Str).append($lag3Str).append($lag4Str).append($lag5Str).append($lag6Str).append($lag7Str)
        $('#myModal .modal-body').append($divStr)
        $('#myModal').modal({
            keyboard: false,
            show: true,
            moveable: true
        })
    },
    closeTask: (taskId) => {
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api/tTask/close",
            data: taskId,
            async: false,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log("关闭成功");
            },
            error: function () {
                console.log("关闭成功");
            }
        })
    },
    saveTasks: (userId, tasks) => {
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api/tTask/lastTaskByOwerId",
            data: userId,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                $.each(tasks, (index, task) => {
                    task = $(task);
                    const point = task.find('.pointVal').val();
                    const timeHour = task.find('.timeHour').val();
                    const timeMinute = task.find('.timeMinute').val();
                    let sort = 1;
                    if (data) {
                        sort = data.sort + index + 1;
                    }

                    const state = 0;
                    let time = 0;
                    if (timeHour) {
                        time += timeHour * 60 * 60 * 1000;
                    }
                    if (timeMinute) {
                        time += timeMinute * 60 * 1000;
                    }
                    const owerId = userId;
                    const taskObj = {
                        point, sort, state, time, owerId
                    }
                    // console.log(chargingStationObj)
                    $.ajax({
                        type: "post",
                        url: "http://10.168.1.235:10200/api/tTask/save",
                        data: JSON.stringify(taskObj),
                        dataType: "json",
                        contentType: 'application/json;charset=UTF-8', //contentType很重要
                        success: function (data) {
                            console.log(data)
                        }
                    });
                })
            },
            error: function () {
                $.each(tasks, (index, task) => {
                    task = $(task);
                    const point = task.find('.pointVal').val();
                    const timeHour = task.find('.timeHour').val();
                    const timeMinute = task.find('.timeMinute').val();
                    const sort = index + 1;
                    const state = 0;
                    let time = 0;
                    if (timeHour) {
                        time += timeHour * 60 * 60 * 1000;
                    }
                    if (timeMinute) {
                        time += timeMinute * 60 * 1000;
                    }
                    const owerId = userId;
                    const taskObj = {
                        point, sort, state, time, owerId
                    }
                    // console.log(chargingStationObj)
                    $.ajax({
                        type: "post",
                        url: "http://10.168.1.235:10200/api/tTask/save",
                        data: JSON.stringify(taskObj),
                        dataType: "json",
                        contentType: 'application/json;charset=UTF-8', //contentType很重要
                        success: function (data) {
                            console.log(data)
                        }
                    });
                })
            }
        });

        $('#myModal').modal('hide')
    }
}
