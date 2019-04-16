function getPoints() {
    $.ajax({
        type: "post",
        url: BaseUrl+"/api/tDestination/list",
        data: "",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8', //contentType很重要
        success: function (data) {
            console.log(data);
            $.each(data, (index, obj) => {
                    // console.log(obj);
                    addMarks(obj);
                }
            );
        }
    });
}

function addMarks(obj) {
    const lat = parseFloat(obj.lat);
    const lng = parseFloat(obj.lng);
    var point = new BMap.Point(lng, lat);
    var marker = new BMap.Marker(point);  // 创建标注
    Bmap.map.addOverlay(marker);              // 将标注添加到地图中
    // marker.addEventListener("click", getAttr);
    //
    // function getAttr() {
    //     var p = marker.getPosition();       //获取marker的位置
    //     alert("marker的位置是" + p.lng + "," + p.lat);
    // }
    var opts = {
        width: 0,     // 信息窗口宽度
        height: 0,     // 信息窗口高度
        title: "", // 信息窗口标题
        enableMessage: true,//设置允许信息窗发送短息
        message: ""
    }

    const context = "<div class=\"btn-group\"><button onclick='del(this)' id=" + obj.id + " type=\"button\" class=\"btn btn-danger btn-del\" >删除</button></div>";

    var infoWindow = new BMap.InfoWindow(context, opts);  // 创建信息窗口对象
    marker.addEventListener("click", function () {
        Bmap.map.openInfoWindow(infoWindow, point); //开启信息窗口
    });
    //const infoObj = {id: obj.id, info: infoWindow};
    const markerObj = {id: obj.id, info: marker};
    //Bmap.infoMapping.push(infoObj);
    Bmap.markerMapping.push(markerObj);
}

$(document).on('click', ".btn-del", (obj) => {
    console.log(obj);
});

function del(obj) {
    const id = $(obj).attr("id");
    // console.log(id);
    //console.log(Bmap.infoMapping);
    Bmap.map.closeInfoWindow();
    $.each(Bmap.markerMapping, (index, obj) => {
        if (obj.id === id) {
            Bmap.map.removeOverlay(obj.info)
        }
    })
    // $.ajax({
    //     type: "post",
    //     url: BaseUrl+"/api/tDestination/delbyId",
    //     data: id,
    //     dataType: "json",
    //     contentType: 'application/json;charset=UTF-8', //contentType很重要
    //     success: function (data) {
    //         console.log(data);
    //     }
    // });
}
