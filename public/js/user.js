User = {
    userList: null,
    getUserList: () => {
        $.ajax({
            type: "post",
            url: "http://10.168.1.235:10200/api//tUser/list",
            data: "",
            async: false,
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
                                const param = {
                                    type: 'initAccount',
                                    id: obj.id,
                                    value: obj.account,
                                }
                                const paramQ = {
                                    type: 'queryAccount',
                                    id: obj.id,
                                }
                                debugger;
                                console.log(ws);
                                ws.send(JSON.stringify(param));
                                ws.send(JSON.stringify(paramQ));
                            }
                        );
                    }
                }, 500);
                console.log(data);
                User.userList = data;
            }
        });
    }
}
