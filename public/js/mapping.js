//生成电动汽车和线路的映射关系
function getEvLineMapping() {
    let startPointArr = Bmap.lines[Bmap.lineIndexMark].startPointVal.split(",");
    let endPointArr = Bmap.lines[Bmap.lineIndexMark].endPointVal.split(",");
    Bmap.startPoint = new BMap.Point(Number(startPointArr[0]), Number(startPointArr[1])); // 起点
    Bmap.endPoint = new BMap.Point(Number(endPointArr[0]), Number(endPointArr[1])); // 终点
    let driving = new BMap.DrivingRoute(Bmap.map, {onSearchComplete: drawLine});  // 驾车实例,并设置回调
    driving.search(Bmap.startPoint, Bmap.endPoint);
}

//获取线路构成点
function drawLine(results) {
    let plan = results.getPlan(0);
    let duration = plan.getDuration(true);
    let distance = plan.getDistance(true);
    for (let i = 0; i < plan.getNumRoutes(); i++) {
        let route = plan.getRoute(i);
        // console.log("***************old*******************");
        // console.log(JSON.stringify(route.getPath()));
        // console.log("***************old*******************");
        // console.log("***************new*******************");
        // console.log(JSON.stringify(getDetailPints(route.getPath(), 0.00001, 0.00001)));
        // console.log("***************new*******************");
        Bmap.lines[Bmap.lineIndexMark].linePoints = getDetailPints(route.getPath(), 0.0001, 0.00001);
        Bmap.lines[Bmap.lineIndexMark].car = Bmap.userCarMapping[Bmap.lines[Bmap.lineIndexMark].owerId];
        let min = 0, hour = 0;
        if (duration.indexOf("小时") === -1) {
            min = parseInt(duration);

        } else if (duration.indexOf("分钟") === -1) {
            hour = parseInt(duration.substring(0, duration.indexOf("小时")))
        } else {
            hour = parseInt(duration.substring(0, duration.indexOf("小时")))
            min = parseInt(duration.substring(duration.indexOf("小时") + 2, duration.indexOf("分钟")))
        }
        debugger;
        distance = parseFloat(distance);
        let speek = distance / (hour + min / 60);
        console.log(speek);
        const timer = (hour * 60 + min) * 60 * 1000;
        Bmap.lines[Bmap.lineIndexMark].timer = timer;
    }
    if (Bmap.lineIndexMark < Bmap.lineNumber) {
        Bmap.lineIndexMark++;
        getEvLineMapping();
    } else {
        for (let m = 0; m < Bmap.lines.length; m++) {
            let pts = Bmap.lines[m].linePoints;
            let carMk = Bmap.lines[m].car
            let len = pts.length;
            let time = Bmap.lines[m].timer
            timer = setTimeout(function () {
                Bmap.resetMkPointAll(1, len, pts, carMk, time)
            }, m * 10000);
        }
    }
}