var express = require('express');
var queryString = require('querystring');
var router = express.Router();
var request = require('request');

var main_url = "http://tools.eryuzhisen.com:18080/eryuzhisen-manager/";


router.get('/', function (req, res) {
    res.render('index');
})

/**
 * 0 审核中 1 审核通过 2 审核不通过
 */
router.get('/opus/getCatalogList', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'/opus/getCatalogList?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.get('/opus/getCatalogDetail', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'opus/getCatalogDetail?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.post('/opus/auditCatalog', function (req, res) {
    console.info(req.body)
    request(
        {
            url:main_url+'opus/auditCatalog',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})

router.get('/opus/getChapterList', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'opus/getChapterList?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.get('/opus/getChapterDetail', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'opus/getChapterDetail?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.post('/opus/auditChapter', function (req, res) {
    request(
        {
            url:main_url+'opus/auditChapter',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})

router.get('/report/getFeedbackList', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'report/getFeedbackList?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.get('/report/getFeedbackDetail', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'report/getFeedbackDetail?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.post('/report/replyFeedback', function (req, res) {
    request(
        {
            url:main_url+'report/replyFeedback',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})

router.get('/report/getReportList', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'report/getReportList?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.get('/report/getReportDetail', function (req, res) {
    var query = queryString.stringify(req.query);

    console.info(query)
    request(main_url+'report/getReportDetail?'+query,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.post('/report/replyReport', function (req, res) {
    request(
        {
            url:main_url+'report/replyReport',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})

router.get('/upload/getPolicyAndAccess', function (req, res) {
    request(main_url+'upload/getPolicyAndAccess',
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.post('/opus/updateCatalog', function (req, res) {
    request(
        {
            url:main_url+'opus/updateCatalog',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})

router.get('/config/getBannerList', function (req, res) {
    request(main_url+'config/getBannerList',
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.get('/config/getBannerDetail', function (req, res) {
    request(main_url+'config/getBannerDetail',
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                res.send(body);
            }
        });
})

router.post('/config/addBanner', function (req, res) {
    request(
        {
            url:main_url+'config/addBanner',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})

router.post('/config/updateBanner', function (req, res) {
    request(
        {
            url:main_url+'config/updateBanner',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: req.body
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            }
        });
})


module.exports = router;
