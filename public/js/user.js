User = {
    userList: null,
    getUserList: () => {
        $.ajax({
            type: "post",
            url: "http://localhost:10200/api//tUser/list",
            data: "",
            async: false,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8', //contentType很重要
            success: function (data) {
                console.log(data);
                User.userList = data;
            }
        });
    }
}