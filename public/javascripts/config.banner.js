/**
 * Created by huangmiao on 17-4-19.
 */

var queryBanner = {'available':'0','client_type':'3'}

$(function() {
    $('#bannerConfig').on('click',function(){
        queryBanner = {'available':'0','client_type':'3'}
        $('#content').load('/html/config.banner.html',function() {

            var uploader = new plupload.Uploader({
                runtimes : 'html5,flash,silverlight,html4',
                browse_button : 'bannerCoverSelect',
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
                            $('#bannerCoverUrl').attr('src',fileUrl);
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
            getBannerCount();
            getBannerList();
            $('#btnClose').on('click',function(){
                $('.detail-box').fadeOut(function(){
                    rest_banner_data();
                });
            });

            $('#bannerCoverUrl').hover(function(){
                $("#bannerCoverSelect").show();
            });

            $('#bannerCoverSelect').hover(function(){},function(){
                $("#bannerCoverSelect").hide();
            });

            $('#btnBannerUpdate').on('click',function () {
                var bannerId = $('.detail-box').attr('data');
                var data = {
                    'id':$('.detail-box').attr('data'),
                    'desc':$('#bannerDesc').val().trim(),
                    'title':$('#bannerTitle').val().trim(),
                    'image':$('#bannerCoverUrl').attr('src'),
                    'jump':$('#bannerJump').val().trim(),
                    'client_type':$('#dBannerClientType').val(),
                    // 'client_version':$('#bannerClientVersion').val(),
                    'available':$('#dBannerAvailable').val()
                }
                if(bannerId && Number(bannerId) > 0)
                    update_banner(data);
                else
                    add_banner(data);
            });

            $('#btnBannerCancel').on('click',function () {
                $('.detail-box').fadeOut(function(){
                    rest_banner_data();
                });
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

            $("#bannerClientType").on('change',function() {
                queryBanner.client_type = $(this).val();
                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;
                getBannerCount();
                getBannerList();
            });
            $("#bannerAvailable").on('change',function() {
                queryBanner.available = $(this).val();
                $pageInfo.page_index = 1;
                $pageInfo.is_loading = false;
                getBannerCount();
                getBannerList();
            });

            $('#addBanner').on('click',function(){
                $('.detail-box').fadeIn();
            });
        });
    });
})

function getBannerCount() {
    var searchdata = "page=1&pageSize=1&available="+ queryBanner.available+"&clientType="+queryBanner.client_type;

    var url = '/config/getBannerList?' + searchdata;
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
                set_banner_list_paginator();
            }
        }
    });
}

function getBannerList() {
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

    var searchdata = "page=" + $pageInfo.page_index + "&pageSize=" + $pageInfo.page_size + "&available="+ queryBanner.available+"&clientType="+queryBanner.client_type;

    var url = '/config/getBannerList?' + searchdata;

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

                        var clientTypeTxt = "Web-pc";

                        if(v.client_type == '1')
                            clientTypeTxt = 'IOS ';
                        else if (v.client_type == '2')
                            clientTypeTxt = 'Android';
                        else if (v.client_type == '3')
                            clientTypeTxt = 'Web-pc';
                        else if (v.client_type == '4')
                            clientTypeTxt = 'Web-mobile';

                        var availableTxt = '可用';
                        if(v.available == '0')
                            availableTxt = '可用';
                        else if (v.available == '1')
                            availableTxt = '不可用';

                        var html =
                            '<tr class="list-detail">'+
                            '<td>'+
                            '<input data="'+v.id+'" type="checkbox" name="check-item">'+
                            '</td>'+
                            '<td><p class="middle-width">'+ v.title+'</p></td>'+
                            '<td><p class="larger-width">'+ v.desc+'</p></td>'+
                            '<td><img width="80px" height="32px" src="'+v.image_url+'?x-oss-process=image/resize,w_80,limit_1"></td>'+
                            '<td>'+ clientTypeTxt+'</td>'+
                            '<td>'+ availableTxt+'</td>'+
                            '<td>'+ v.update_time+'</td>'+
                            '<td>'+
                            '<a onclick="show_banner_detail_box('+v.id+');">查看</a>'+
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

function get_banner_detail(id,callback) {
    $.ajax({
        type: "GET",
        url: '/config/getBannerDetail?bannerId='+id,
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

function add_banner(data) {
    $.ajax({
        type: "POST",
        url: '/config/addBanner',
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

function update_banner(data) {
    $.ajax({
        type: "POST",
        url: '/config/updateBanner',
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

function fill_banner_data(data) {
    $("#bannerTitle").val(data.title);
    $("#bannerdesc").val(data.desc);
    $("#bannerCoverUrl").attr('src',data.image_url);
    $('#dBannerClientType').val(data.client_type);
    $('#dBannerAvailable').val(data.available);
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function rest_banner_data() {
    $("#bannerTitle").val('');
    $("#bannerdesc").val('');
    $("#bannerCoverUrl").attr('src','');
    $('#dBannerClientType').val('3');
    $('#dBannerAvailable').val('0');
    $('.detail-loading').hide();
    $(".custom-box").show();
}

function show_banner_detail_box(id) {
    $('.detail-box').fadeIn(function(){
        $('.detail-box').attr('data',id);
        get_banner_detail(id,fill_banner_data);
    });
}

function set_banner_list_paginator() {
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
                getBannerList();
            }
        });
    } else {
        $("#PaginationId").hide();
    }
}