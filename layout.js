Array.prototype.randomIn = function() {
  return this[ Math.floor(Math.random() * this.length) ];
}

var Modules = {};
var Layout = {
  hasSpeaker: false,
  hasButton: false
}

Modules.modulesInSizeOrder = [
    {
      name: "empty",
      width: 1,
      height: 1
    },
    {
      name: "button-single",
      width: 1,
      height: 1
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
      name: "switch-series-medium",
      width: 4,
      height: 2
    },
    {
      name: "meter",
      width: 1,
      height: 4
    },
    {
      name: "speaker-1",
      width: 5,
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
  template.addClass("module"+" grid-x-"+x+" grid-y-"+y+""+" grid-width-"+obj.width+" grid-height-"+obj.height);
  parent.append(template);
  return template;
}

Layout.fillSpace = function(x, y, w, h) {
  var p,
      coin = Math.random();
  if(coin > 0.5) {
    p = Modules.getLargestThatFitsIn(w, h);
  } else {
    p = Modules.getRandomThatFitsIn(w, h);
  }
  //make sure there's only one speaker
  if(p.name.indexOf("speaker") !== -1) {
    if(Layout.hasSpeaker) {
      Layout.fillSpace(x, y, w, h); //try again
      return;
    } else {
      Layout.hasSpeaker = true;
    }
  }
  //make sure there's only one button
  if(p.name.indexOf("button") !== -1) {
    if(Layout.hasButton) {
      Layout.fillSpace(x, y, w, h); //try again
      return;
    } else {
      Layout.hasButton = true;
    }
  }
  Modules.constructDiv(p, x, y);
  if(w - p.width > 0) {
    Layout.fillSpace(x + p.width, y, w - p.width, p.height);
  }
  if(h - p.height > 0) {
    Layout.fillSpace(x, y + p.height, w, h - p.height);
  }
}

Layout.fillSpace(0,0,8,8);