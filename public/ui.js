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
    send();
  });
  
  $('html').keyup(function(e) { 
    if(e.keyCode == 8) {
      undo();
    }
  });  
  

});

function showMap() {
  $(".container").addClass("hidden");
}


function create() {
  if (vertices.features.length > 0) {
	  $("#create").removeClass("hidden");
  }
}

function send() {
	
	if ($("#username").val().length == 0) {
    alert("Please enter your name");
	} else if ($("#username").val().length < 3) {
		alert("Your name must be longer than 3 characters");
	} else {
    // TODO: check if features.length
    
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
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST',
        success: function(data) {
          var json = JSON.parse(data);
          if (json.status == "success") {
            alert("Thanks! Please go to the Fablab to pay and to start production!");
        		$("#create").addClass("hidden");
            reset();
          } else {
            alert("You're not the only one tonight with this name. Please choose another name!");
          }
        }
      }
    );
	  
    
	}

}


function reset() {
  
  $("#info").removeClass("hidden");
  // Set form values back to default
  $("#username").val("");
  $('input[value="wood"]').prop('checked', true);
  
  resetMap();
}
