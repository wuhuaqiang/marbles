/* global $, document, nDig */
/* exported clear_blocks, new_block */
var uiBlocksCount = 0;
var blocks = [];
var block_height = 0;

var block_width_px = 32;				//width of the block in px (match this to css)
var block_margin_px = 15;				//desired margin of the block
var block_left_px = block_width_px + block_margin_px;
var moveBlocks = null;					//interval var

$(document).on('ready', function () {
    startTheShow();
});

function startTheShow() {
    moveBlocks = setInterval(function () {
        move_on_down();
    }, 2000);
}

function new_block(id) {											//rec a new block
    id = Number(id);
    if (!blocks[id]) {											//if its a new block, build it

        if (uiBlocksCount > 0) {									//build missing blocks, except on load (so we dont start at block 0)
            for (var prev = block_height + 1; prev < id; prev++) {
                console.log('building missing block', prev);
                blocks[prev] = {block_height: prev};
                build_block(prev);								//build the missing blocks
            }
        }

        if (id > block_height) {									//only draw blocks that are newer
            blocks[id] = {block_height: id};
            build_block(id);									//build this new block
            block_height = id;
        }
    }
}

function build_block(id) {										//build and append the block html
    var sizeClass = '';
    if (id >= 1000000) {
        sizeClass = 'million';									//figure out a size thats okay
    } else if (id >= 1000) {
        sizeClass = 'thousands';
    } else {
        id = nDig(id, 3);
    }

    var html = `<div class="block ` + sizeClass + `">
					<div class="tooltip">
						<span class="tooltiptext">Block ` + Number(id) + ` has been committed to the ledger</span>
						` + id + `
					</div>
				</div>`;
    $('#blockWrap').append(html);

    // move the block left (number_of_blocks * blocks_width) + 2 blocks_width
    $('.block:last').animate({opacity: 1, left: (uiBlocksCount * block_left_px) + block_left_px * 2}, 600, function () {
        $('.lastblock').removeClass('lastblock');
        $('.block:last').addClass('lastblock');
    });
    uiBlocksCount++;
}

function move_on_down() {										//move the blocks left
    if (uiBlocksCount > 10) {
        $('.block:first').animate({opacity: 0}, 800, function () {
            $('.block:first').remove();
        });
        $('.block').animate({left: '-=' + block_left_px}, 800, function () {
        });
        uiBlocksCount--;

        if (uiBlocksCount > 10) {								//fast mode, clear the blocks!
            clearInterval(moveBlocks);
            setTimeout(function () {
                move_on_down();
            }, 900);											//delay should be longer than animation delay
        }
        else {
            startTheShow();
        }
    }
}

function invokeBlockChain(param) {
    $.ajax({
        url: BlockChainUrl + '/chaincode/invoke',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(param),
        success: function (jsonData) {
            console.log(jsonData);
            if (jsonData.status == 200) {
                // alert("执行智能合约成功");
            }
        }
    });
}

function queryBlockChain(id) {//id为:用户id,电动汽车id,充电站id
    const param = {"fcn": "getTRecordHistory", "args": [id]};
    let result;
    $.ajax({
        url: BlockChainUrl + '/chaincode/query',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(param),
        success: function (jsonData) {
            result = jsonData;
            // console.log(jsonData);
            if (jsonData.status == 200) {
                // alert("查询智能合约成功");
            }
        }
    });
    return result;
}

function queryBlockByTransactionID(txId) {
    const param = {"txId": txId};
    let result;
    $.ajax({
        url: BlockChainUrl + '/chainblock/queryBlockByTransactionID',
        type: 'POST',
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(param),
        success: function (jsonData) {
            result = jsonData;
            if (jsonData.status == 200) {
                // alert("根据交易Id查询区块数据成功");
            }
        }
    });
    return result;
}

function checkAccountIfExist(id) {//id为:用户id,电动汽车id,充电站id
    const param = {"fcn": "queryAccount", "args": [id]};
    let result = false;
    $.ajax({
        url: BlockChainUrl + '/chaincode/query',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(param),
        success: function (jsonData) {

            // console.log(jsonData);
            if (jsonData.status == 200) {
                result = true;
            }
        }
    });
    return result;
}

// function initAccount(param) {
//     $.ajax({
//         url: BlockChainUrl + '/chaincode/invoke',
//         type: 'POST',
//         dataType: 'json',
//         contentType: 'application/json',
//         data: JSON.stringify(param),
//         success: function (jsonData) {
//             console.log(jsonData);
//             if (jsonData.status == 200) {
//                 alert("执行智能合约成功");
//             }
//         }
//     });
// }
