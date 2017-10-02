var settings = {
  numberSystem : undefined
}


//Sets up a Jquery event $(element).center() vertically and horizontally
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
            $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
            $(window).scrollLeft()) + "px");
    return this;
}


function determineNumberSystem() {
  var accountCountryArr = ACCOUNT.split("-");
  var accountCountry = accountCountryArr[2];

  if (accountCountry == "us") {
    settings.numberSystem = "imperial";
  } else {
    settings.numberSystem = "metric";
  }
}

//Handles the resizing and positions of the images
function handleResize(viewName) {
  var width = $("#" + viewName + "-background-image").width();
  var height = $("#" + viewName + "-background-image").height();
  $("#" + viewName + "-background-container").height(height);
  $("#" + viewName + "-background-container").center();
}

// Kura specific payload extraction
function getMetrics(arr) {

	// Deal with the case where there is only 1 item (and no enclosing array)
	if (arr.constructor != Array)
		arr = [ arr ];

	var res = {};
	for ( var i in arr) {
		var obj = arr[i];
		var name = obj.name;
		var value;

    switch (obj.type) {
      case "boolean":
        value = (obj.value == "true");
        break;
      case "int":
        value = Number(obj.value);
        break;
      case "float":
        value = Number(obj.value);
        break;
      case "string":
        value = obj.value;
        break;
      case "double":
        value = Number(obj.value);
        break;
    }
    res[name] = value;
	}
	return res;
}

// Fahrenheit to Celsius
function fahrenheitToCelsius (fahrenheit) {
  if (settings.numberSystem == "metric") {
    return ((fahrenheit - 32) * (5/9)).toFixed(1) + " °C";
  } else {
    return fahrenheit.toFixed(1) + " °F";
  }
}


function fahrenheitToCelsiusRaw(fahrenheit) {
  if (settings.numberSystem == "metric") {
    return ((fahrenheit - 32) * (5/9));
  } else {
    return fahrenheit;
  }
}
