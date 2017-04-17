/**
 * Created by huangmiao on 17-4-14.
 */
var $pageInfo = {"page_index":1,"page_size":5,"total":0,"is_loading":false};
$(function(){

    initItemEvent();

    $('#catalogAudit').on('click',function(){
        $('#content').load('/html/opus-catalog-audit.html',function() {
            $pageInfo.page_index = 1;
            $pageInfo.is_loading = false;
            getCatalogCount();
            getCatalogList();
            $('#btnCatalogAuditClose').on('click',function(){
                $('.catalog-detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $("#btnCatalogAuditingPass").on('click',function() {
                var remark = $('#catalogRemark').val().trim();
                update_catalog_audit($('.catalog-detail-box').attr('data'),1,remark)
            });

            $("#btnCatalogAuditingNotPass").on('click',function() {
                var remark = $('#catalogRemark').val().trim();
                update_catalog_audit($('.catalog-detail-box').attr('data'),2,remark)
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
        });
    });

    $('#chapterAudit').on('click',function(){
        $('#content').load('/html/opus-chapter-audit.html',function() {
            $pageInfo.page_index = 1;
            $pageInfo.is_loading = false;
            getChapterCount();
            getChapterList();
            $('#btnChapterAuditClose').on('click',function(){
                $('.chapter-detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $("#btnChapterAuditingPass").on('click',function() {
                var remark = $('#chapterRemark').val().trim();
                update_chapter_audit($('.chapter-detail-box').attr('data'),1,remark)
            });

            $("#btnChapterAuditingNotPass").on('click',function() {
                var remark = $('#chapterRemark').val().trim();
                update_chapter_audit($('.chapter-detail-box').attr('data'),2,remark)
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
        });
    });
})

function getCatalogCount() {
    var searchdata = "page=1&pageSize=1&auditStatus="+ 1;

    var url = 'opus/getCatalogList?' + searchdata;
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

                if(json.list.length > 0){
                    $pageInfo.total = json.page_info.total_count;
                    set_catalog_list_paginator();
                }
            }
        }
    });
}

function getCatalogList() {
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

    $('#catalogList').html(htmlloading);

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&auditStatus="+ 1;

    var url = 'opus/getCatalogList?' + searchdata;

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
                    $('#catalogList').html(htmlno);
                }else{
                    $('#catalogList').html('');
                    $.each(json.list, function (i, v) {

                        var auditTxt = "审核中";

                        if(v.audit_status == '1')
                            auditTxt = '审核通过 ';
                        else if (v.audit_status == '2')
                            auditTxt = '审核未通过';
                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.catalog_id+'" type="checkbox" name="catalog-item">'+
                            '</td>'+
                            '<td><p class="opus-title">'+ v.catalog_title+'</p></td>'+
                            '<td><p class="opus-desc">'+ v.catalog_desc+'</p></td>'+
                            '<td><img width="40px" height="60px" src="'+v.catalog_cover_url+'?x-oss-process=image/resize,w_40,limit_1"></td>'+
                            '<td>'+ auditTxt+'</td>'+
                            '<td>'+ v.publish_time+'</td>'+
                            '<td>'+
                            '<a onclick="show_catalog_detail_box('+v.catalog_id+');">查看</a>'+
                            '</td>'+
                            '</tr>';
                        $('#catalogList').append(html);
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
                $('#catalogList').html(htmlno);
            }
        }
    });
}

function get_catalog_detail(id,callback) {
    $.ajax({
        type: "GET",
        url: 'opus/getCatalogDetail?catalogId='+id,
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

function update_catalog_audit(id,auditStatus,auditRemark) {
    var data = {
        'opus_id':id,
        'audit_status':auditStatus,
        'audit_remark':auditRemark
    }
    $.ajax({
        type: "POST",
        url: 'opus/auditCatalog',
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

function fill_catalog_data(data) {
    $("#catalogTitle").html(data.catalog_title);
    $("#catalogDesc").html(data.catalog_desc);
    $("#catalogCoverUrl").attr('src',data.catalog_cover_url);
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_catalog_detail_box(id) {
    $('.catalog-detail-box').fadeIn(function(){
        $('.catalog-detail-box').attr('data',id);
        get_catalog_detail(id,fill_catalog_data);
    });
}

function getChapterCount() {
    var searchdata = "page=1&pageSize=1&auditStatus="+ 1;

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

                if(json.list.length > 0){
                    $pageInfo.total = json.page_info.total_count;
                    set_chapter_list_paginator();
                }
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

    $('#chapterList').html(htmlloading);

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&auditStatus="+ 1;

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
                    $('#chapterList').html(htmlno);
                }else{
                    $('#chapterList').html('');
                    $.each(json.list, function (i, v) {

                        var auditTxt = "审核中";

                        if(v.audit_status == '1')
                            auditTxt = '审核通过 ';
                        else if (v.audit_status == '2')
                            auditTxt = '审核未通过';
                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.chapter_id+'" type="checkbox" name="chapter-item">'+
                            '</td>'+
                            '<td><p class="opus-title">'+ v.chapter_title+'</p></td>'+
                            '<td><p class="opus-desc">'+ v.chapter_desc+'</p></td>'+
                            '<td>'+ auditTxt+'</td>'+
                            '<td>'+ v.publish_time+'</td>'+
                            '<td>'+
                            '<a onclick="show_chapter_detail_box('+v.chapter_id+');">查看</a>'+
                            '</td>'+
                            '</tr>';
                        $('#chapterList').append(html);
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
                $('#chapterList').html(htmlno);
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
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_chapter_detail_box(id) {
    $('.chapter-detail-box').fadeIn(function(){
        $('.chapter-detail-box').attr('data',id);
        get_chapter_detail(id,fill_chapter_data);
    });
}

function set_catalog_list_paginator() {
    if($pageInfo.total > 0) {
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
                getCatalogList();
            }
        });
    }
}

function set_chapter_list_paginator(){
    if($pageInfo.total > 0) {
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
    }
}