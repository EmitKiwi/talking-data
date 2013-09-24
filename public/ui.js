var timer;

$(document).bind("ready", function() {
	//window.addEventListener('resize', onWindowResize, false);
	initMap();
});


function save(){
	console.log("save clicked");
	$.mobile.changePage('#user_form', { transition: "flip"} );	
}

function validate(){
	console.log("send clicked");
	
	if($("#user_name").val().length<3){
		
		$('#feedback_header').html("Validation required");
		$('#feedback_txt').html("Fill in your name.<br>Close this dialog and retry.");			
		$.mobile.changePage('#feedBack', {transition: 'pop', role: 'dialog'}); 
		
	} else {
	  var svg  = document.getElementById("drawing");
  	var xml = (new XMLSerializer).serializeToString(svg);

    // Remove translation
    xml = xml.replace(/transform=\"translate\(\d+,\d+\)\"/g, "");

    // Remove size and margin
    xml = xml.replace(/ width=\"\d+"/g, "");
    xml = xml.replace(/ height=\"\d+"/g, "");
    xml = xml.replace(/margin-left: .*;/g, "");
    xml = xml.replace(/margin-top: .*;/g, "");

    // Add black stroke color
    xml = xml.replace(/ stroke/g, " stroke=\"#000000\" stroke");  

    var data = {
      name: $("#user_name").val(),
      svg: xml,
      geojson: vertices
    };

    // Send to server
    $.ajax("/save", {
      data : JSON.stringify(data),
        contentType : 'application/json',
        type : 'POST'
      }
    );
	  
		//feedback dialog
		$('#feedback_header').html("Saving");
		$.mobile.changePage('#feedBack', {transition: 'pop', role: 'dialog'}); 
		$('#feedback_txt').html("Thanks! Your map is saved and sent to production!");
		reset(true);
    
	}

}


function reset(saved) {
  clearInterval(timer);
  resetMap();
  if (saved) {		
  	timer = setInterval(function(){
  	  $.mobile.changePage('#map_page', {transition: 'flip'});
  	  clearInterval(timer); 
  	  }, 2000);
  	console.log("reset");			
  } else {
    
  	$.mobile.changePage('#reset_page', {transition: 'fade'}); 			
  	timer = setInterval(function(){
  	  $.mobile.changePage('#map_page', {transition: 'fade'});
  	  clearInterval(timer);
  	  },250);
  }
}
