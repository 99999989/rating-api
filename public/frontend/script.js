$( document ).ready(function() {

// Get First Random Content
$("#get").click(function() {
	getContent("","");
}); 

// Get Random Content, Antwort: Like
$("#up").click(function() {
	var content = $("#content_name").val();
	getContent(content, "1");
}); 

// Get Random Content, Antwort: Dislike
$("#down").click(function() {
	var content = $("#content_name").val();
	getContent(content, "0");
}); 





});

// Get Random Content, rating: 0=Dislike, 1=Like, ""=Ohne
function getContent(content, rating) {
	alert("Countent: "+content +"; "+"Rating: "+rating);
	
	$.ajax({
		url: "http://www.google.ch",
		type: "post",
		data: {
			content: content,
			rating: rating,
			user: "1"
		}
	}).done(function(msg) {
		alert("Msg: "+msg);
	});
}