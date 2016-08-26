function map(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

var Controls = {
  mouseOrigin: {x: 0, y: 0},
  changingObject: null,
  originalValue: 0,
  isCurrentlyChanging: false
};

Controls.bindEvents = function() {
  //debug
  $(document).on("keydown", function (e) {
    if(e.which == 48) {
      $("body").toggleClass("debug");
    }
  })
  //mouse interaction
  $(".grid-master")
    .on("mousedown", function (e) {
      Controls.isCurrentlyChanging = true;
      Controls.mouseOrigin.x = e.clientX;
      Controls.mouseOrigin.y = e.clientY;
      Controls.changingObject = $(e.target);
      if(!Controls.changingObject[0].hasAttribute("data-val")) {
        Controls.changingObject.attr("data-val", 0);
      }
      Controls.originalValue = parseInt($(e.target).attr("data-val"),10);

      //toggle controls rather than drags
      if( Controls.changingObject.hasClass("switch")) {
        Controls.switchControls(Controls.changingObject);
      }
      if( Controls.changingObject.hasClass("button")) {
        Controls.buttonControls(Controls.changingObject);
      }
    });
  $(document)
    .on("mouseup", function (e) {
      e.preventDefault();
      Controls.isCurrentlyChanging = false;
      $("html").css("cursor", "auto");
    })
    .on("mousemove", function (e) {
      e.preventDefault();
      if(!Controls.isCurrentlyChanging) { return; }
      var dx = e.clientX - Controls.mouseOrigin.x;
      var dy = e.clientY - Controls.mouseOrigin.y;
      if( Controls.changingObject.hasClass("knob") ) {
        Controls.knobControls(Controls.changingObject, dy);
      } 
      if( Controls.changingObject.hasClass("slider") ) {
        Controls.sliderControls(Controls.changingObject, dx);
      } 
    })
}

Controls.knobControls = function(knobElement, dy) {
  var desiredVal = Controls.originalValue - (dy*2);
  var val = clamp(desiredVal, 0, 360)
  knobElement.attr("data-val", val);
  knobElement.find(".indicator").css("transform", "rotate("+val+"deg)");
  $("html").css("cursor", "ns-resize");
}

Controls.sliderControls = function(sliderElement, dx) {
  var desiredVal = Controls.originalValue + dx;
  var val = clamp(desiredVal, 0, sliderElement.parent().width() - sliderElement.width() - 5)
  console.log(val);
  sliderElement.attr("data-val", val);
  sliderElement.css("left", val);
  $("html").css("cursor", "ew-resize");
}

Controls.switchControls = function(switchElement) {
  if(switchElement.closest(".module").hasClass("radio")) {
    switchElement.siblings().removeClass("depressed");
  }
  switchElement.toggleClass("depressed");
  switchElement.attr("data-val", switchElement.hasClass("depressed") ? 1 : 0);
}

Controls.buttonControls = function(buttonElement) {
  buttonElement.toggleClass("depressed");
  buttonElement.attr("data-val", buttonElement.hasClass("depressed") ? 1 : 0);
}

Controls.bindEvents();
