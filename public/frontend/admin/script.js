
$(document).ready(function () {



// Get Random Content, Antwort: Dislike
    $("#down").click(function () {
        var resourceId = $("#content_name").val();
        saveRating(resourceId, -1);
    });


});

getResources();

// Start phase
function getResources() {
    $.ajax({
        url: '/api/resources/',
        type: 'get'
    }).done(function (resources) {
        for (var i = 0; i < resources.length; i++) {
            $('#resourcesContainer').append('<img src="' + resources[i].url + '" height="30px" />');
        }

    });
}

// Start phase
function startPhase(phase) {
    $.ajax({
        url: '/api/matching/phase',
        type: 'post',
        data: {
            phase: phase,
            resourcesCount: $("#resourcesCount").val()
        }
    }).done(function (msg) {

    });
}


// Get Random Content, rating: -1=Dislike, 1=Like, 0=Neutral ""=Ohne
function saveRating(content, rating) {
    var random = Math.random();
    var confirmText = '';
    if (rating === 1) {
        confirmText = positiveConfirmTexts[Math.floor(positiveConfirmTexts.length * random)];
    } else if(rating === 0) {
        confirmText = "Whatever.";
    } else {
        confirmText = negativeConfirmTexts[Math.floor(negativeConfirmTexts.length * random)];
	}

    $("#rating-pane").css({display: 'none'});
    $("#content-text").html(confirmText);
    $(".splash-pane").css({display: 'block'});
    $("#content-image").css({opacity: 0});
    document.getElementById('content-video').pause();
    $("#content-video").css({display: 'none'});
    $("#loading-spinner").css({opacity: 1});

    $.ajax({
        url: "/api/matching/rating",
        type: "post",
        data: {
            username: $.urlParam('name'),
            score: rating,
            resourceId: content
        }
    }).done(function (res) {
        //alert(JSON.stringify(msg));
        $("#rating-average").html(res.resourceAverage.toFixed(2));
        $("#rating-count").html(res.resourceCount);
        $("#user-average").html(res.userAverage.toFixed(2));
        $("#user-count").html(res.userCount);

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