/**
 * Created by huangmiao on 17-4-19.
 */

var queryChapter = {'auditStatus':'0'}

$(function() {
    $('#chapterAudit').on('click',function(){
        $('#content').load('/html/chapter.audit.html',function() {
            $pageInfo.page_index = 1;
            $pageInfo.is_loading = false;
            getChapterCount();
            getChapterList();
            $('#btnClose').on('click',function(){
                $('.detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $("#btnChapterAuditingPass").on('click',function() {
                var remark = $('#chapterRemark').val().trim();
                update_chapter_audit($('.detail-box').attr('data'),1,remark)
            });

            $("#btnChapterAuditingNotPass").on('click',function() {
                var remark = $('#chapterRemark').val().trim();
                update_chapter_audit($('.detail-box').attr('data'),2,remark)
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

            $("#chapterAuditStatus").on('change',function() {
                queryChapter.auditStatus = $(this).val();

                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;

                getChapterCount();
                getChapterList();

            });

        });
    });
})

function getChapterCount() {
    var searchdata = "page=1&pageSize=1&auditStatus="+ queryChapter.auditStatus;

    var url = 'opus/getChapterList?' + searchdata;
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
                set_chapter_list_paginator();
            }
        }
    });
}

function getChapterList() {
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

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&auditStatus="+ queryChapter.auditStatus;

    var url = 'opus/getChapterList?' + searchdata;

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

                        var auditTxt = "审核中";

                        if(v.audit_status == '1')
                            auditTxt = '审核通过 ';
                        else if (v.audit_status == '2')
                            auditTxt = '审核未通过';

                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.chapter_id+'" type="checkbox" name="check-item">'+
                            '</td>'+
                            '<td><p class="small-width">第'+ v.chapter_index+'话</p></td>'+
                            '<td><p class="middle-width">'+ v.chapter_title+'</p></td>'+
                            '<td><p class="larger-width">'+ v.chapter_desc+'</p></td>'+
                            '<td>'+ auditTxt+'</td>'+
                            '<td>'+ v.publish_date+'</td>'+
                            '<td>'+
                            '<a onclick="show_chapter_detail_box('+v.chapter_id+');">查看</a>'+
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

function get_chapter_detail(id,callback) {
    $.ajax({
        type: "GET",
        url: 'opus/getChapterDetail?chapterId='+id,
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

function update_chapter_audit(id,auditStatus,auditRemark) {
    var data = {
        'opus_id':id,
        'audit_status':auditStatus,
        'audit_remark':auditRemark
    }
    $.ajax({
        type: "POST",
        url: 'opus/auditChapter',
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

function fill_chapter_data(data) {
    $('#chapterIndex').html('第'+data.chapter_index+'话');
    $('#chapterTitle').html(data.chapter_title);
    $('#chapterDesc').html(data.chapter_desc);
    $('#chapterContent').html(data.chapter_content);
    $('#chapterRemark').val(data.audit_remark);
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_chapter_detail_box(id) {
    $('.detail-box').fadeIn(function(){
        $('.detail-box').attr('data',id);
        get_chapter_detail(id,fill_chapter_data);
    });
}

function set_chapter_list_paginator(){
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
                getChapterList();
            }
        });
    } else {
        $("#PaginationId").hide();
    }
}