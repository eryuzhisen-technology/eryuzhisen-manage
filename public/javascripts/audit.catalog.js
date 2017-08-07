/**
 * Created by huangmiao on 17-4-19.
 */

var queryCatalog = {'auditStatus':'1','fuzzyCatalogTile':'','catalogType':'0'}

$(function() {
    $('#catalogAudit').on('click',function(){
        queryCatalog = {'auditStatus':'1','fuzzyCatalogTile':'','catalogType':'0'}
        $('#content').load('/html/audit.catalog.html',function() {

            var uploader = new plupload.Uploader({
                runtimes : 'html5,flash,silverlight,html4',
                browse_button : 'catalogCoverSelect',
                //multi_selection: false,
                container: document.getElementById('uploadContainer'),
                flash_swf_url : 'lib/upload/Moxie.swf',
                silverlight_xap_url : 'lib/upload/Moxie.xap',
                url : 'https://oss.aliyuncs.com',

                filters: {
                    mime_types: [ //只允许上传图片和zip,rar文件
                        {
                            title: "Image files",
                            extensions: "jpg,png,jpeg"
                        },
                    ],
                    max_file_size: '10mb', //最大只能上传10mb的文件
                    prevent_duplicates: true //不允许选取重复文件
                },

                init: {
                    PostInit: function() {

                    },

                    FilesAdded: function(up, files) {
                        //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
                        now = timestamp = Date.parse(new Date()) / 1000;
                        if (expire < now + 3)
                        {
                            getParams(function () {
                                up.start();
                            });
                        }else {
                            up.start();
                        }
                    },

                    BeforeUpload: function(up, file) {
                        send_request(up, file.name);
                    },

                    UploadProgress: function(up, file) {
                    },

                    FileUploaded: function(up, file, info) {
                        if (info.status == 200)
                        {
                            console.info(JSON.stringify(uploadfileinfo));
                            var fileUrl = uploadfileinfo[file.name].src;
                            var name = uploadfileinfo[file.name].name;
                            uploadfileinfo[file.name].load = 1;
                            console.info(fileUrl);
                            $('#catalogCoverUrl').attr('src',fileUrl);
                        }
                        else
                        {
                            console.info(info.response);
                        }
                    },

                    Error: function(up, err) {
                        if (err.code == -600) {
                            show_popup("选择的文件太大了")
                        }
                        else if (err.code == -601) {
                            show_popup("选择的文件后缀不对")
                        }
                        else if (err.code == -602) {
                            show_popup("这个文件已经上传过一遍了");
                        }
                        else
                        {
                            show_popup("上传失败");
                            console.info("\nError xml:" + err.response);
                        }
                    }
                }
            });

            uploader.init();

            $pageInfo.page_index = 1;
            $pageInfo.is_loading = false;
            getCatalogCount();
            getCatalogList();
            $('#btnClose').on('click',function(){
                $('.detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $('#catalogCoverUrl').hover(function(){
                $("#catalogCoverSelect").show();
            });

            /*$('#catalogCoverSelect').on('click',function(){
                $('#catalogCoverUpload').click();
            })*/

            $('#catalogCoverSelect').hover(function(){},function(){
                $("#catalogCoverSelect").hide();
            });

            $("#btnCatalogAuditingPass").on('click',function() {
                var remark = $('#catalogRemark').val().trim();
                update_catalog_audit($('.detail-box').attr('data'),1,remark)
            });

            $("#btnCatalogAuditingNotPass").on('click',function() {
                var remark = $('#catalogRemark').val().trim();
                update_catalog_audit($('.detail-box').attr('data'),2,remark)
            });

            $('#btnCatalogUpdate').on('click',function () {
                var data = {
                    'opus_id':$('.detail-box').attr('data'),
                    'opus_type':$('#dCatalogType').val(),
                    'cover_url':$('#catalogCoverUrl').attr('src'),
                    'opus_sort':$('#catalogSort').val()
                }
                update_catalog_info(data);
            });

            $('#btnCatalogCancel').on('click',function () {
                $('.detail-box').fadeOut(function(){
                    $('.detail-loading').show();
                    $(".custom-box").hide();
                });
            });

            $('#btnCatalogSearch').on('click',function() {
                queryCatalog.fuzzyCatalogTile = encodeURI(encodeURI($('#inputCatalogName').val().trim()));
                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;
                getCatalogCount();
                getCatalogList();
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

            $("#catalogAuditStatus").on('change',function() {
                queryCatalog.auditStatus = $(this).val();
                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;
                getCatalogCount();
                getCatalogList();
            });
            $("#catalogType").on('change',function() {
                queryCatalog.catalogType = $(this).val();
                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;
                getCatalogCount();
                getCatalogList();
            });
        });
    });
})

function getCatalogCount() {
    var searchdata = "page=1&pageSize=1&auditStatus="+ queryCatalog.auditStatus+"&fuzzyCatalogTile="+queryCatalog.fuzzyCatalogTile+"&catalogType="+queryCatalog.catalogType;

    var url = '/opus/getCatalogList?' + searchdata;
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
                set_catalog_list_paginator();
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

    $('#listContent').html(htmlloading);

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&auditStatus="+ queryCatalog.auditStatus+"&fuzzyCatalogTile="+queryCatalog.fuzzyCatalogTile+"&catalogType="+queryCatalog.catalogType;

    var url = '/opus/getCatalogList?' + searchdata;

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

                        var type = '普通';
                        if(v.catalog_type == '1')
                            type = '热门';
                        else if (v.catalog_type == '2')
                            type = '优秀';

                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.catalog_id+'" type="checkbox" name="check-item">'+
                            '</td>'+
                            '<td><p class="middle-width">'+ v.catalog_title+'</p></td>'+
                            '<td><p class="larger-width">'+ v.catalog_desc+'</p></td>'+
                            '<td><img width="40px" height="60px" src="'+v.catalog_cover_url+'?x-oss-process=image/resize,w_40,limit_1"></td>'+
                            '<td>'+ auditTxt+'</td>'+
                            '<td>'+ type+'</td>'+
                            '<td>'+ v.publish_time+'</td>'+
                            '<td>'+
                            '<a onclick="show_catalog_detail_box('+v.catalog_id+');">查看</a>'+
                            '<a style="margin-left: 5px" onclick="jump_sub_menu('+v.catalog_id+');">章节</a>'+
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

function jump_sub_menu(catalogId){
    $('#chapterAudit').trigger("click",catalogId);
}

function get_catalog_detail(id,callback) {
    $.ajax({
        type: "GET",
        url: '/opus/getCatalogDetail?catalogId='+id,
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

function update_catalog_info(data) {
    $.ajax({
        type: "POST",
        url: '/opus/updateCatalog',
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

function update_catalog_audit(id,auditStatus,auditRemark) {
    var data = {
        'opus_id':id,
        'audit_status':auditStatus,
        'audit_remark':auditRemark
    }
    $.ajax({
        type: "POST",
        url: '/opus/auditCatalog',
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
    $('#catalogRemark').val(data.audit_remark);
    $('#dCatalogType').val(data.catalog_type);
    $('#catalogSort').val(Number(data.catalog_sort));
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_catalog_detail_box(id) {
    $('.detail-box').fadeIn(function(){
        $('.detail-box').attr('data',id);
        get_catalog_detail(id,fill_catalog_data);
    });
}

function set_catalog_list_paginator() {
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
                getCatalogList();
            }
        });
    } else {
        $("#PaginationId").hide();
    }
}