/**
 * Created by huangmiao on 17-4-19.
 */
var queryReport = {'status':'0'}
$(function() {
    $('#reportAudit').on('click',function(){
        $('#content').load('/html/audit.report.html',function() {
            $pageInfo.page_index = 1;
            $pageInfo.is_loading = false;
            getReportCount();
            getReportList();
            $('#btnClose').on('click',function(){
                $('.detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $("#btnReportSubmit").on('click',function() {
                reply_report($('.detail-box').attr('data'),1)
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

            $("#reportStatus").on('change',function() {
                queryReport.status = $(this).val();

                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;

                getReportCount();
                getReportList();

            });

        });
    });
});

function getReportCount() {
    var searchdata = "page=1&pageSize=1&status="+ queryReport.status;

    var url = '/report/getReportList?' + searchdata;
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
                set_report_list_paginator();
            }
        }
    });
}

function getReportList() {
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

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&status="+ queryReport.status;

    var url = '/report/getReportList?' + searchdata;

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

                        if(v.report_status == '1')
                            statusTxt = '已处理 ';

                        var typeTxt = "评论";
                        if(v.content_type == '1')
                            typeTxt = "章节";
                        if(v.content_type == '2')
                            typeTxt = "评论";
                        if(v.content_type == '3')
                            typeTxt = "用户";

                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.report_id+'" type="checkbox" name="check-item">'+
                            '</td>'+
                            '<td><p class="small-width">'+ v.user_id+'</p></td>'+
                            '<td><p class="larger-width">'+ v.content_id+'</p></td>'+
                            '<td class="middle-width">'+typeTxt+'</td>'+
                            '<td>'+ statusTxt+'</td>'+
                            '<td>'+ v.report_reason+'</td>'+
                            '<td>'+ v.create_time+'</td>'+
                            '<td>'+
                            '<a onclick="show_report_detail_box('+v.report_id+');">查看</a>'+
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

function get_report_detail(id,callback) {
    $.ajax({
        type: "GET",
        url: '/report/getReportDetail?reportId='+id,
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

function fill_report_data(data) {
    $('#reportUserId').html(data.user_id);
    $('#reportContentId').html(data.content_id);
    var typeTxt = "评论";
    if(data.content_type == '1')
        typeTxt = "章节";
    if(data.content_type == '2')
        typeTxt = "评论";
    if(data.content_type == '3')
        typeTxt = "用户";
    $('#reportContentType').html(typeTxt);
    $('#reportReason').html(data.report_reason);
    $('#addReason').html(data.add_reason);
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_report_detail_box(id) {
    $('.detail-box').fadeIn(function(){
        $('.detail-box').attr('data',id);
        get_report_detail(id,fill_report_data);
    });
}

function set_report_list_paginator(){
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
                getReportList();
            }
        });
    } else {
        $("#PaginationId").hide();
    }
}

function reply_report(id,status,remark) {
    var data = {
        'report_id':id,
        'report_status':status
    }
    $.ajax({
        type: "POST",
        url: '/report/replyReport',
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