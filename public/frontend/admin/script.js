
$(document).ready(function () {

});

getCurrentData();
setVisible(false, '.phase-finished');
// Get current data
function getCurrentData() {
    var currentPhase;
    $.ajax({
        url: '/api/matching/phase',
        type: 'get'
    }).done(function (response) {

        if (response.phase === '1') {
            setVisible(false, '.phase1-start');
            setVisible(false, '#phase2');
            setVisible(false, '#phase3');
        } else if (response.phase === '2') {
            setVisible(true, '#phase2');
            setVisible(false, '#phase3');
        } else if (response.phase === '3') {
            setVisible(true, '#phase2');
            setVisible(true, '#phase3');
        }
        currentPhase = response.phase;
        $('#phase').val(response.phase);
    });

    $.ajax({
        url: '/api/resources/',
        type: 'get'
    }).done(function (resources) {
        for (var i = 0; i < resources.length; i++) {
            $('#resourcesContainer').append('<img src="' + resources[i].url + '" height="30px" />');
        }

        $.ajax({
            url: '/api/users/',
            type: 'get'
        }).done(function (users) {
            for (var i = 0; i < users.length; i++) {
                $('#userContainer').append('<div>' + users[i].username + '</div><p class="range-field"><input disabled type="range" min="0" max="' + resources.length / 2 +
                    '" value="' + users[i].ratings.length + '" /></p>' +
                    '<div class="row" style="font-size:x-small"><div class="col s4">0%</div> <div class="col s4 center-align">50%</div><div class="col s4 right-align">100% </div></div>');
            }

            if (currentPhase === '2' || currentPhase === '3') {
                $.ajax({
                    url: '/api/matching/coefficients',
                    type: 'get'
                }).done(function (coefficients) {
                    for (var i = 0; i < coefficients.length; i++) {
                        $('#coefficientsContainer').append('<div class="row" style="font-size:small"><div class="col s4">' +
                            coefficients[i].user1.username +
                            '</div> <div class="col s4 center-align">' +
                            coefficients[i].coefficient.toFixed(2) + '/' + coefficients[i].precision + '/' + coefficients[i].weightedCoefficient.toFixed(2) +
                            '</div><div class="col s4 right-align">' +
                            coefficients[i].user2.username +
                            '</div></div>');
                    }

                    $.ajax({
                        url: '/api/matching/final',
                        type: 'get'
                    }).done(function (users) {
                        for (var i = 0; i < users.length; i++) {
                            $('#finalContainer').append('<div class="row" style="font-size:small"><div class="col s4">' +
                                users[i].username +
                                '</div> <div class="col s4 center-align">' +
                                users[i].scoreDeviation.toFixed(2) + 
                                '</div><div class="col s4 right-align">' +
                                users[i].weightedScoreDeviation.toFixed(2) +
                                '</div></div>');
                        }

                    });
                });

            }
        });
    });


}

// Start phase
function startPhase(phase) {
    if ($("#resourcesCount").val() > 0 && $("#userCount").val() > 0) {
        $.ajax({
            url: '/api/matching/phase',
            type: 'post',
            data: {
                phase: phase,
                resourcesCount: $("#resourcesCount").val(),
                userCount: $("#userCount").val()
            }
        }).done(function (msg) {
            Materialize.toast('Phase ' + phase + ' gestartet', 4000);
            $("#userCount").val('');
            $("#resourcesCount").val('');
        });
    } else {
        Materialize.toast('Anzahl Ressourcen und/oder User fehlt!', 4000);
    }

}

function generateResults() {
    ///api/matching/results
    $.ajax({
        url: '/api/matching/results',
        type: 'get'
    }).done(function (msg) {
        Materialize.toast('Koeffizienten erzeugt', 4000);

    });

}

function setVisible(visible, id) {
    if (visible) {
        $(id).css({display: 'block'});
    } else {
        $(id).css({display: 'none'});
    }
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