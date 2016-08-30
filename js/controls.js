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

Controls.meta = function() {
  $('.help').on('click', function (e) {
    e.stopPropagation();
    $("main").toggleClass("viewHelp");
  })
  setTimeout(function () {
    $('.help').css("opacity", 1);
  }, 1000)
  $('body').on('click', function (e) {
    if(e.target == document.body) {
      $("main").removeClass("viewHelp");
    }
  })
}

Controls.zeroOut = function() {
  $(".grid-master .module").each(function (i, el) {
    var e = $(el);
    var switches = e.find(".switch");
    var knobs = e.find(".knob");
    var sliders = e.find(".slider");
    if(switches.length > 0) {
      switches.each(function (j, f) {
        $(f).attr("data-val", 0);
        $(f).siblings().removeClass("depressed");
      })
    }
    if(knobs.length > 0) {
      knobs.each(function (j, f) {
        $(f).attr("data-val", 0);
        $(f).find(".indicator").css("transform", "rotate("+0+"deg)");
      })
    }
    if(sliders.length > 0) {
      sliders.each(function (j, f) {
        $(f).attr("data-val", 0);
        $(f).css("left", 0);
      })
    }
  })
}

Controls.attachToControl = function(dom) {
  if(dom.attr("id").indexOf("button") !== -1) {
    dom.data("controlSurface", Music.controlSurfaces["button"][0]);
  }
  if(dom.attr("id") == "knob-series-medium") {
    dom.data("controlSurface", Music.controlSurfaces["knob-3"].randomIn());
  }
  if(dom.attr("id") == "knob-series-small" || dom.attr("id").indexOf("slider") !== -1) {
    dom.data("controlSurface", Music.controlSurfaces["slider"].randomIn());
  }
  if(dom.attr("id") == "switch-series-medium") {
    dom.data("controlSurface", Music.controlSurfaces["switch-2"].randomIn());
  }
  if(dom.attr("id") == "switch-series-small") {
    dom.data("controlSurface", Music.controlSurfaces["switch-4"].randomIn());
  }
}

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
  var val = clamp(desiredVal, 0, 360);
  var f = knobElement.closest(".module").data("controlSurface");
  knobElement.attr("data-val", val);
  knobElement.find(".indicator").css("transform", "rotate("+val+"deg)");
  $("html").css("cursor", "ns-resize");
  //pass all sibling knob values
  var valsArray = knobElement.siblings().addBack().map(function (i, e) {
    return parseInt($(e).attr("data-val"), 10);
  })
  f.call(knobElement, valsArray);
}

Controls.sliderControls = function(sliderElement, dx) {
  var f = sliderElement.closest(".module").data("controlSurface");
  var maxLeft = sliderElement.parent().width() - sliderElement.width() - 5;
  var desiredVal = map(Controls.originalValue, 0, 360, 0, maxLeft) + dx;
  var val = clamp(desiredVal, 0, maxLeft);
  var controlVal = map(val, 0, maxLeft, 0, 360);
  sliderElement.attr("data-val", controlVal);
  sliderElement.css("left", val);
  $("html").css("cursor", "ew-resize");
  f.call(sliderElement, [controlVal]);
}

Controls.switchControls = function(switchElement) {
  var f = switchElement.closest(".module").data("controlSurface");
  switchElement.siblings().removeClass("depressed").attr("data-val", 0);
  switchElement.toggleClass("depressed");
  switchElement.attr("data-val", switchElement.hasClass("depressed") ? 1 : 0);
  var valsArray = switchElement.siblings().addBack().map(function (i, e) {
    return parseInt($(e).attr("data-val"), 10);
  })
  f.call(switchElement, valsArray);
}

Controls.buttonControls = function(buttonElement) {
  var f = buttonElement.closest(".module").data("controlSurface"),
      val;
  buttonElement.toggleClass("depressed");
  val = buttonElement.hasClass("depressed") ? 1 : 0;
  buttonElement.attr("data-val", val);
  f.call(buttonElement, val);
}