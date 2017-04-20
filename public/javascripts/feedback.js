/**
 * Created by huangmiao on 17-4-19.
 */
var queryFeedback = {'feedbackStatus':'0'}
$(function() {
    $('#feedbackAudit').on('click',function(){
        $('#content').load('/html/feedback.html',function() {
            $pageInfo.page_index = 1;
            $pageInfo.is_loading = false;
            getFeedbackCount();
            getFeedbackList();
            $('#btnClose').on('click',function(){
                $('.detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $("#btnFeedbackSubmit").on('click',function() {
                var remark = $('#feedbackRemark').val().trim();
                reply_feedback($('.detail-box').attr('data'),1,remark)
            });

            //全选
            $('#checkAll').on('click',function(){
                //alert($(this).is(':checked'));
                if($(this).is(':checked')) {
                    $('.list-detail').find(':checkbox').prop('checked',true);
                } else {
                    $('.list-detail').find(':checkbox').prop('checked',false);
                }
            });

            $("#feedbackStatus").on('change',function() {
                queryFeedback.feedbackStatus = $(this).val();

                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;

                getFeedbackCount();
                getFeedbackList();

            });

        });
    });
});

function getFeedbackCount() {
    var searchdata = "page=1&pageSize=1&status="+ queryFeedback.feedbackStatus;

    var url = '/report/getFeedbackList?' + searchdata;
    $.ajax({
        type: "GET",
        url: url,
        contentType:'application/json; charset=utf-8',
        //headers: {tid:$cookieToken,uname:$cookieUid},
        cache:false,
        timeout: 10000,
        error: function(XMLHttpRequest, textStatus, errorThrown){

        },
        success: function(json){
            if(json.ret == "0" && json.list){

                $pageInfo.total = json.page_info.total_count;
                set_feedback_list_paginator();
            }
        }
    });
}

function getFeedbackList() {
    if($pageInfo.is_loading){
        return;
    }
    $pageInfo.is_loading = true;

    var htmlloading = '';
    htmlloading += '<tr>';
    htmlloading += 		'<td align="center" colspan="20">';
    htmlloading += 			'<div class="loading">';
    htmlloading += 			'<img src="/images/loading.gif" width="20px" height="20px">';
    htmlloading += 			'<br>正在加载数据...';
    htmlloading += 			'</div>';
    htmlloading += 		'</td>';
    htmlloading += 	'</tr>';

    $('#listContent').html(htmlloading);

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&status="+ queryFeedback.feedbackStatus;

    var url = '/report/getFeedbackList?' + searchdata;

    $.ajax({
        type: "GET",
        url: url,
        contentType:'application/json; charset=utf-8',
        //headers: {tid:$cookieToken,uname:$cookieUid},
        cache:false,
        timeout: 10000,
        error: function(XMLHttpRequest, textStatus, errorThrown){
            $pageInfo.is_loading = false;
        },
        success: function(json){
            $pageInfo.is_loading = false;
            if(json.ret == "0" && json.list){
                if(json.list.length <= 0){
                    var htmlno = '';
                    htmlno += '<tr>';
                    htmlno += 	'<td align="center" colspan="20">';
                    htmlno += 		'<div class="loading">没有数据！</div>';
                    htmlno += 	'</td>';
                    htmlno += '</tr>';
                    $('#listContent').html(htmlno);
                }else{
                    $('#listContent').html('');
                    $.each(json.list, function (i, v) {

                        var　statusTxt = "待处理";

                        if(v.feedback_status == '1')
                            statusTxt = '已处理 ';

                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.feedback_id+'" type="checkbox" name="check-item">'+
                            '</td>'+
                            '<td><p class="small-width">'+ v.user_id+'</p></td>'+
                            '<td><p class="larger-width">'+ v.content+'</p></td>';
                        if(v.img_url) {
                            html +='<td><img width="60px" height="60px" src="'+v.img_url+'?x-oss-process=image/resize,w_40,limit_1"></td>';
                        } else {
                            html +='<td></td>';
                        }

                        html +=
                            '<td class="middle-width">'+v.contact_info+'</td>'+
                            '<td>'+ statusTxt+'</td>'+
                            '<td>'+ v.create_time+'</td>'+
                            '<td>'+
                            '<a onclick="show_feedback_detail_box('+v.feedback_id+');">查看</a>'+
                            '</td>'+
                            '</tr>';
                        $('#listContent').append(html);
                    });

                }

            }else if(json.ret == 99) {//账号校验不通过，可能token过期
                // token_expire_callback();
            }else{
                var htmlno = '';
                htmlno += '<tr>';
                htmlno += 	'<td align="center" colspan="20">';
                htmlno += 		'<div class="loading">没有数据！</div>';
                htmlno += 	'</td>';
                htmlno += '</tr>';
                $('#listContent').html(htmlno);
            }
        }
    });
}

function get_feedback_detail(id,callback) {
    $.ajax({
        type: "GET",
        url: '/report/getFeedbackDetail?feedbackId='+id,
        contentType:'application/json; charset=utf-8',
        //headers: {tid:$cookieToken,uname:$cookieUid},
        cache:false,
        timeout: 10000,
        error: function(XMLHttpRequest, textStatus, errorThrown){

        },
        success: function(json){
            if(json.ret == "0" && json.info){
                if(callback) {
                    callback(json.info);
                }
            }
        }
    });
}

function fill_feedback_data(data) {
    $('#feedbackUserId').html(data.user_id);
    $('#feedbackContactInfo').html(data.contact_info);
    $('#feedbackImgUrl').attr('src',data.img_url);
    $('#feedbackContent').html(data.content);
    $('#feedbackRemark').val(data.feedback_remark);
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_feedback_detail_box(id) {
    $('.detail-box').fadeIn(function(){
        $('.detail-box').attr('data',id);
        get_feedback_detail(id,fill_feedback_data);
    });
}

function set_feedback_list_paginator(){
    if($pageInfo.total > 0) {
        $("#PaginationId").show();
        var pages = Math.ceil($pageInfo.total/$pageInfo.page_size);
        $("#PaginationId").jqPaginator({
            totalPages: pages,
            visiblePages: 5,
            currentPage: 1,
            first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
            prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
            next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
            last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
            page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>',
            onPageChange: function (n) {
                $pageInfo.page_index = n;
                getFeedbackList();
            }
        });
    } else {
        $("#PaginationId").hide();
    }
}

function reply_feedback(id,status,remark) {
    var data = {
        'feedback_id':id,
        'feedback_status':status,
        'feedback_remark':remark
    }
    $.ajax({
        type: "POST",
        url: '/report/replyFeedback',
        data:JSON.stringify(data),
        contentType:'application/json; charset=utf-8',
        //headers: {tid:$cookieToken,uname:$cookieUid},
        cache:false,
        timeout: 10000,
        error: function(XMLHttpRequest, textStatus, errorThrown){

        },
        success: function(json){
            if(json.ret == "0"){
                show_popup('提交成功');
            } else {
                show_popup('提交失败');
            }
        }
    });
}