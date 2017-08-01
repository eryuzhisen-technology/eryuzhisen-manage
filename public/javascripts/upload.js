/**
 * Created by huangmiao on 17-8-1.
 */
accessid = ''
accesskey = ''
host = ''
policyBase64 = ''
signature = ''
callbackbody = ''
filename = ''
key = ''
expire = 0
now = timestamp = Date.parse(new Date()) / 1000;

uploadfileinfo = {};

function getParams(cb)
{
    $.ajax({
        type: "GET",
        url: '/upload/getPolicyAndAccess',
        contentType:'application/json; charset=utf-8',
        //headers: {tid:$cookieToken,uname:$cookieUid},
        cache:false,
        timeout: 10000,
        error: function(XMLHttpRequest, textStatus, errorThrown){

        },
        success: function(json){
            if(json.ret == "0"){
                host = json.host;
                policyBase64 = json.policy;
                accessid = json.accessid;
                signature = json.signature;
                expire = parseInt(json.expire);
                key = json.dir;

                cb && cb();
            }
        }
    });
};

function random_string(len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function send_request (up,filename){
    var suffix = (new Date()).getTime();
    var uploadfilename = key + random_string(5) + '_' + suffix;
    uploadfileinfo[filename] = {
        src: host + '/' + uploadfilename,
        load: 0,
        name: random_string(5) + '_' + suffix
    };

    console.info(JSON.stringify(uploadfileinfo));

    new_multipart_params = {
        'key' : uploadfilename,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid,
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'signature': signature,
    };

    up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
    });

    up.start();
}

getParams();