var timer;

$(document).bind("ready", function() {
	initMap();

  $(".action-reset").on("click", function(e) {
    reset();
  });
  
  $(".action-undo").on("click", function(e) {
    undo();
  });
  
  $(".action-create").on("click", function(e) {
    create();
  });
  
  $(".action-showmap").on("click", function(e) {
    showMap();
  });
  
  $(".action-send").on("click", function(e) {
    //create();
  });

});

function showMap() {
  $(".container").addClass("hidden");
}


function create() {
	$("#create").removeClass("hidden");
}

function validate() {
	
	if ($("#username").val().length<3) {
		
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

    // Remove properties.x from vertices
    for (var i = 0; i < vertices.features.length; i++) {
      var feature = vertices.features[i];
      delete feature.properties["x"];
    }

    var data = {
      name: $("#username").val(),
      type: $('input[name="type"]:checked').val(),
      svg: xml,
      geojson: vertices
    };

    // Send to server
    $.ajax("/stories", {
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


function reset() {
  
  $("#info").removeClass("hidden");
  
  // Set form values back to default
  $("#username").val("");
  $('input[value="wood"]').prop('checked', true);
  
  resetMap();
}
