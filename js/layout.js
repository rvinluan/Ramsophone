window.seedableRandom = function() {
  var x = Math.sin(window.seed++) * 10000;
  return x - Math.floor(x);
}

Array.prototype.randomIn = function() {
  return this[ Math.floor(window.seedableRandom() * this.length) ];
}

var Modules = {};
var Layout = {
  hasButton: false
}

Modules.allSpeakers = [
  {
    name: "speaker-1",
    width: 6,
    height: 6
  },
  {
    name: "speaker-1",
    width: 8,
    height: 4
  },
  {
    name: "speaker-2",
    width: 6,
    height: 6
  },
  {
    name: "speaker-2",
    width: 8,
    height: 5
  },
  {
    name: "speaker-massive-1",
    width: 8,
    height: 4
  },
  {
    name: "speaker-massive-2",
    width: 4,
    height: 8
  }
]

Modules.onButton = {
  name: "button-single",
  width: 2,
  height: 2
},

Modules.modulesInSizeOrder = [
    {
      name: "empty",
      width: 1,
      height: 1
    },
    {
      name: "empty",
      width: 2,
      height: 4
    },
    {
      name: "empty",
      width: 2,
      height: 2
    },
    // {
    //   name: "knob-single",
    //   width: 1,
    //   height: 1
    // },
    {
      name: "knob-series-small",
      width: 2,
      height: 2
    },
    {
      name: "knob-series-medium",
      width: 4,
      height: 2
    },
    {
      name: "switch-series-small",
      width: 4,
      height: 2
    },
    {
      name: "switch-series-medium",
      width: 4,
      height: 2
    },
    // {
    //   name: "slider-horizontal-4",
    //   width: 4,
    //   height: 1
    // },
    {
      name: "slider-horizontal-4",
      width: 4,
      height: 2
    },
    {
      name: "meter",
      width: 1,
      height: 4
    }
]

Modules.getLargestThatFitsIn = function(w, h) {
  var eligible = Modules.modulesInSizeOrder.filter(function (elem) {
    return elem.width <= w && elem.height <= h;
  });
  if(eligible.length == 0) {
    return null;
  }
  return eligible[eligible.length - 1];
}

Modules.getRandomThatFitsIn = function(w, h) {
  var eligible = Modules.modulesInSizeOrder.filter(function (elem) {
    return elem.width <= w && elem.height <= h;
  });
  if(eligible.length == 0) {
    return null;
  }
  return eligible.randomIn();
}

Modules.constructDiv = function(obj, x, y) {
  var parent = $(".grid-master");
  var template = $("#all-component-templates").find("#" + obj.name).clone();
  //the speakers need populating the speaker holes
  if(template.find("[data-clone]").length > 0) {
    template.find("[data-clone]").each(function (i, e) {
      var e = $(e);
      var times = $(e).attr("data-clone");
      e.removeAttr("data-clone");
      for(var i = 0; i < times - 1; i++) {
        e.after(e.clone());
      }
    });
  }
  template.addClass("module"+" grid-x-"+x+" grid-y-"+y+""+" grid-width-"+obj.width+" grid-height-"+obj.height);
  if(template.attr("id") !== "empty") {
    Controls.attachToControl(template);
  }
  parent.append(template);
  return template;
}

Layout.fillSpace = function(x, y, w, h) {
  var p,
      coin = 0;
  if(coin > 0.5) {
    p = Modules.getLargestThatFitsIn(w, h);
  } else {
    p = Modules.getRandomThatFitsIn(w, h);
  }
  //add the on button
  if(w >=2 && h >= 2 && !Layout.hasButton) {
    p = Modules.onButton;
    Layout.hasButton = true;
  }
  Modules.constructDiv(p, x, y);
  if(w - p.width > 0) {
    Layout.fillSpace(x + p.width, y, w - p.width, p.height);
  }
  if(h - p.height > 0) {
    Layout.fillSpace(x, y + p.height, w, h - p.height);
  }
}

Layout.init = function(x, y, w, h) {
  var p = Modules.allSpeakers.randomIn();
  var tempX = 0;
  var tempY = 0;
  var leewayX = w - p.width;
  var leewayY = h - p.height;
  //randomly align to right instead of left
  if(window.seedableRandom() > 0.5) {
    tempX = leewayX;
  }
  //randomly assign to bottom instead of top
  if(window.seedableRandom() > 0.5) {
    tempY = leewayY;
  }
  if(w - p.width > 0) {
    if(tempX == 0)
      Layout.fillSpace(x + p.width, tempY, w - p.width, p.height); //left
    else
      Layout.fillSpace(x, tempY, w - p.width, p.height); //right
  }
  if(h - p.height > 0) {
    if(tempY == 0)
      Layout.fillSpace(x, y + p.height, w, h - p.height); //top
    else 
      Layout.fillSpace(x, y, w, h - p.height); //bottom
  }
  Modules.constructDiv(p, tempX, tempY);
}