
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
    $(".splash-pane").css({display: 'none'});
    $("#loading-spinner").css({opacity: 0});
    $("#rating-pane").css({display: 'inline'});
    $("#average-rating").html('?');
    $("#rating-count").html('?');
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

var positiveConfirmTexts = [
    'Dir gefällt das? Naja... <br> In jedem Ende liegt ein neuer Anfang.',
    'Danke für dein positives Feedback ;)',
    'Echt toll, dass du hier mitmachst...',
    'Geschmäcker sind verschieden...',
    'Wir suchen nach dem nächsten Bild...',
    '"In jedem Ende liegt ein neuer Anfang."',
    '"Leben ist das, was passiert, während du andere Dinge im Kopf hast."'
];

var negativeConfirmTexts = [
    'Warum denn so negativ ;)',
    'Man muss nicht alles mögen...',
    'Hoffentlich gefällt dir das nächste Bild besser...',
    'Wir sind für jede Kritik offen...',
    'Es könnte schlimmer sein...',
    '"Eifersucht ist die Leidenschaft, die mit Eifer sucht, was Leiden schafft."',
    '"Vergiss Sicherheit. Lebe, wo du fürchtest zu leben. Zerstöre deinen Ruf. Sei berüchtigt."'
];

// Get Random Content, rating: 0=Dislike, 1=Like, ""=Ohne
function saveRating(content, rating) {
    var random = Math.random();
    var confirmText = '';
    if (rating === 1) {
        confirmText = positiveConfirmTexts[Math.floor(positiveConfirmTexts.length * random)];
    } else {
        confirmText = negativeConfirmTexts[Math.floor(negativeConfirmTexts.length * random)];
    }

    $("#rating-pane").css({display: 'none'});
    $("#content-text").html(confirmText);
    $(".splash-pane").css({display: 'block'});
    $("#content-image").css({opacity: 0});
    $("#loading-spinner").css({opacity: 1});

    $.ajax({
        url: host + "/api/matching/rating",
        type: "post",
        data: {
            username: $.urlParam('name'),
            score: rating,
            resourceId: content
        }
    }).done(function (res) {
        //alert(JSON.stringify(msg));
        $("#average-rating").html(res.average);
        $("#rating-count").html(res.count);
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