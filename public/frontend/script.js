$(document).ready(function () {


// Get First Random Content
    $("#get").click(function () {
        getContent();
    })
    getContent();

// Get Random Content, Antwort: Like
    $("#up").click(function () {
        var resourceId = $("#content_name").val();
        saveRating(resourceId, 1);
    });

// Get Random Content, Antwort: Dislike
    $("#down").click(function () {
        var resourceId = $("#content_name").val();
        saveRating(resourceId, 0);
    });
});

var host = 'https://dry-dawn-55947.herokuapp.com';
//var host = 'http://localhost:3001';
function loaded() {
    $("#loading-spinner").removeClass('active');
    Materialize.fadeInImage('#content-image');
}

// Get Random Content, rating: 0=Dislike, 1=Like, ""=Ohne
function getContent() {
    $("#content-image").css({opacity: 0});

    $.ajax({
        url: host + "/api/matching/resource/" + $.urlParam('name'),
        type: "get"
    }).done(function (msg) {

        //alert("Msg: "+JSON.stringify(msg));
        $("#content-image").attr("src", msg.url);
        $("#content_name").val(msg._id);

    });
}

// Get Random Content, rating: 0=Dislike, 1=Like, ""=Ohne
function saveRating(content, rating) {
    $("#content-image").css({opacity: 0});
    $("#loading-spinner").addClass('active');

    $.ajax({
        url: host + "/api/matching/rating",
        type: "post",
        data: {
            username: $.urlParam('name'),
            score: rating,
            resourceId: content
        }
    }).done(function (msg) {
        //alert(JSON.stringify(msg));
        getContent();
    });
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    else {
        return results[1] || 0;
    }
}