//测试地址
var $loginCheck = false;

var $resubmitFlag = false;//重复提交标志


function initItemEvent(){
	$('.menu-item').on('click',function(){

		$(this).children('.sub-menu').slideDown('slow');

		if(!$(this).children('a').hasClass('current')) {
			$(this).children('a').addClass('current');
		}

		$(this).prevAll('.menu-item').children('.sub-menu').slideUp('slow');
		$(this).nextAll('.menu-item').children('.sub-menu').slideUp('slow');

		$(this).prevAll('.menu-item').find('a').removeClass('current');
		$(this).nextAll('.menu-item').find('a').removeClass('current');
	});

	$('.sub-menu a').on('click',function(){

		if(!$(this).hasClass('current')) {
			$(this).addClass('current');
		}

		$(this).prevAll().removeClass('current');
		$(this).nextAll().removeClass('current');
	});
}


function go_back(){
	history.back(-1);
}


function check_param(param){
	if(param == null || param == '' || param == undefined || param == 'undefined' || param == 0 || param == '0'){
		return false;
	}else{
		return true;
	}
}

//获取时间戳str='2016-08-22 12:00:00',如果str为空，则返回当前的时间戳
function get_sys_datatime(str){
	if(str){
		str = str.replace(/-/g,'/');
		return (new Date(str)).getTime();
	}else{
		return (new Date()).getTime();
	}
}


function show_popup(content,callback){

	if($resubmitFlag){
		return;
	}
	$resubmitFlag = true;

	var cn = check_param(content)?content:"";
	var html = '';
	html += '<div id="MY_POPUP_ID" class="popupBox">';
	html += '	<div class="bg"></div>';
	html += '	<div class="mainBox">';
	html += '		<div class="titleBar">';
	html += '			<div id="MY_POPUP_CLOSE_ID" class="close"></div>';
	html += '			提示信息：';
	html += '		</div>';
	html += '		<div class="contentBox">'+cn+'</div>';
	html += '		<div id="MY_POPUP_BTN_ID" class="buttonBox"><button class="btn btn-green">&nbsp;&nbsp;&nbsp;确 定&nbsp;&nbsp;&nbsp;</button>' +
		'</div>';
	html += '	</div>';
	html += '</div>';
	$(document.body).append(html);
	$('#MY_POPUP_CLOSE_ID').on('click',function(){
		$resubmitFlag = false;
		hide_popup();
		if(callback){
			callback();
		}
	});
	$('#MY_POPUP_BTN_ID').on('click',function(){
		$resubmitFlag = false;
		hide_popup();
		if(callback){
			callback();
		}
	});
}
function hide_popup(){
	$('#MY_POPUP_ID').remove();
}

function show_confirm_popup(content,callback,params){

	if($resubmitFlag){
		return;
	}
	$resubmitFlag = true;

	var cn = check_param(content)?content:"";
	var html = '';
	html += '<div id="MY_POPUP_ID" class="popupBox">';
	html += '	<div class="bg"></div>';
	html += '	<div class="mainBox">';
	html += '		<div class="titleBar">';
	html += '			<div id="MY_POPUP_CLOSE_ID" class="close"></div>';
	html += '			提示信息：';
	html += '		</div>';
	html += '		<div class="contentBox">'+cn+'</div>';
	html += '		<div class="buttonConfirmBox">' +
						'<table>' +
							'<tr>' +
								'<td align="center"><button id="MY_POPUP_CONFIRM_ID" class="btn btn-green">&nbsp;&nbsp;&nbsp;确 定&nbsp;&nbsp;&nbsp;</button></td>' +
								'<td align="center"><button id="MY_POPUP_CANCEL_ID" class="btn btn-green">&nbsp;&nbsp;&nbsp;取 消&nbsp;&nbsp;&nbsp;</button></td>' +
							'</tr>' +
						'</table>' +
					'</div>';
	html += '	</div>';
	html += '</div>';
	$(document.body).append(html);
	$('#MY_POPUP_CLOSE_ID').on('click',function(){
		$resubmitFlag = false;
		confirmHide();
	});
	$('#MY_POPUP_CANCEL_ID').on('click',function(){
		$resubmitFlag = false;
		confirmHide();
	});
	$('#MY_POPUP_CONFIRM_ID').on('click',function(){
		$resubmitFlag = false;
		confirmHide();
		if(callback){
			if(params) {
				callback(params);
			} else {
				callback();
			}
		}
	});
}
function confirmHide(){
	$('#MY_POPUP_ID').remove();
}

function show_popup_loading(content){
	var cn = check_param(content)?content:"";
	var html = '';
	html += '<div id="MY_POPUP_LOADING_ID" class="popupLoadingBox">';
	html += '	<div class="bg"></div>';
	html += '	<div class="mainBox">';
	html += '		<img src="img/loading.gif">';
	html += '		<p>'+cn+'</p>';
	html += '	</div>';
	html += '</div>';
	$(document.body).append(html);
}
function hide_popup_loading(){
	$('#MY_POPUP_LOADING_ID').remove();
}


function token_expire_callback(){
	$.cookie($cookieTokenName, '', { expires: -1 });
	window.location.href = 'login.html';
}

function isPositiveNum(s){//是否为正整数
	var re = /^[0-9]*[1-9][0-9]*$/ ;
	return re.test(s)
}

function checkImgExists(imgurl) {
	var ImgObj = new Image(); //判断图片是否存在
	ImgObj.src = imgurl;
	//没有图片，则返回-1
	if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
		return true;
	} else {
		return false;
	}
}