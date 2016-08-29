var Music = {}

Music.init = function() {

Music.melody = {
  key: "c",
  mode: "major",
  degree: 1,
  quality: "maj7"
}

//create a synth and connect it to the master output (your speakers)
Music.synth = new Tone.Synth({
  oscillator: {
    type: "fatsawtooth",
    detune: 0,
    count: 2
  },
  envelope: {
    attack: 0.02,
    decay: 0.3,
    sustain: 0,
    release: 0.2
  }
})

Music.freeverb = new Tone.Freeverb();
Music.filter = new Tone.Filter(100, "highpass");
Music.pan = new Tone.Panner(0.5);

Music.synth.connect(Music.filter);
Music.filter.connect(Music.freeverb);
Music.freeverb.connect(Music.pan);
Music.pan.connect(Tone.Master);

Music.meter = new Tone.Meter();
Music.pan.connect(Music.meter);

Music.seq = new Tone.Pattern(function(time, note){
  Music.synth.triggerAttackRelease(note, "8n", time);
}, [], "upDown");

Music.seq.interval = "8n";
Music.seq.start("0m");
Music.seq.loop = true;
Music.generateArpegio();

Tone.Transport.bpm.value = 150

//special function to control the meters
setInterval(function () {
  $(".grid-master .meter .indicator").css("top", map(Music.meter.value, 0, 1.6, 200, 10));
}, 20)

}

Music.generateArpegio = function(key, scale, deg, quality) {
  var k = key ? key : Music.melody.key;
  var s = scale ? scale : Music.melody.mode;
  var d = deg ? deg : Music.melody.degree;
  var q = quality ? quality : Music.melody.quality;
  Music.melody = {
    key: k,
    mode: s,
    degree: d,
    quality: q
  }
  var root = teoria.note(k + "4");
  var scl = root.scale(s);
  var chord = scl.get(d).chord(q);
  var notesArray = chord.notes();
  notesArray.push( chord.notes()[0].interval("P8") )
  var noteNames = notesArray.map( function (e) {
    return e.toString();
  } );
  Music.seq.values = noteNames;
}

Music.controlFunctions = {
  transportOn: function(newVal) {
    newVal === 1 ? Tone.Transport.start() : Tone.Transport.stop();
  },
  filterFrequency: function(newValsArray) {
    var newVal = map( newValsArray[0], 0, 360, 0, 10000 );
    Music.filter.frequency.value = newVal;
  },
  volume: function(newValsArray) {
    var newVal = map( newValsArray[0], 0, 360, -10, 10 );
    Tone.Master.volume.value = newVal;
  },
  pan: function(newValsArray) {
    var newVal = map( newValsArray[0], 0, 360, -1, 1 );
    Music.pan.pan.value = newVal;
  },
  tempo: function(newValsArray) {
    var newVal = map( newValsArray[0], 0, 360, 80, 240 );
    Tone.Transport.bpm.value = newVal;
  },
  reverbRoom: function(newValsArray) {
    var newVal = map( newValsArray[0], 0, 360, 0, 1 );
    Music.freeverb.roomSize.value = newVal;
  },
  envelopeADSR: function (newValsArray) {
    Music.synth.envelope.attack = map( newValsArray[0], 0, 360, 0, 0.5 );
    Music.synth.envelope.decay = map( newValsArray[1], 0, 360, 0.05, 0.6 );
    Music.synth.envelope.sustain = map( newValsArray[2], 0, 360, 0, 0.5 );
  },
  switchFilterType: function(newValsArray) {
    if(newValsArray[0] == 1) {
      //minor
      Music.filter.type = "highpass";
    } else if(newValsArray[1] == 1) {
      //blues
      Music.filter.type = "lowpass";
    }
  },
  chord: function (newValsArray) {
    var checkIfAllZero = newValsArray.toArray().reduce(function (prev, cur) {
      return prev += cur
    }, 0);
    if(checkIfAllZero == 0) {
      Music.generateArpegio(null, null, null, "maj7");
    } else if(newValsArray[0] == 1) {
      Music.generateArpegio(null, null, null, "min7");
    } else if(newValsArray[1] == 1) {
      Music.generateArpegio(null, null, null, "aug7");
    } else if(newValsArray[2] && newValsArray[2] == 1) {
      Music.generateArpegio(null, null, null, "dim7");
    } else if(newValsArray[3] && newValsArray[3] == 1) {
      Music.generateArpegio(null, null, null, "7b5");
    }
  },
  oscillatorType: function(newValsArray) {
    var checkIfAllZero = newValsArray.toArray().reduce(function (prev, cur) {
      return prev += cur
    }, 0);
    if(checkIfAllZero == 0) {
      Music.synth.oscillator.type = "fatsawtooth";
    } else if(newValsArray[0] == 1) {
      Music.synth.oscillator.type = "fatsine";
    } else if(newValsArray[1] == 1) {
      Music.synth.oscillator.type = "fattriangle";
    } else if(newValsArray[2] && newValsArray[2] == 1) {
      Music.synth.oscillator.type = "fatsquare4";
    } else if(newValsArray[3] && newValsArray[3] == 1) {
      Music.synth.oscillator.type = "amsine";
    }
  },
  scaleDegree: function(newValsArray) {
    var checkIfAllZero = newValsArray.toArray().reduce(function (prev, cur) {
      return prev += cur
    }, 0);
    if(checkIfAllZero == 0) {
      Music.generateArpegio(null, null, 1, null);
    } else if(newValsArray[0] == 1) {
      Music.generateArpegio(null, null, 2, null);
    } else if(newValsArray[1] == 1) {
      Music.generateArpegio(null, null, 3, null);
    } else if(newValsArray[2] && newValsArray[2] == 1) {
      Music.generateArpegio(null, null, 4, null);
    } else if(newValsArray[3] && newValsArray[3] == 1) {
      Music.generateArpegio(null, null, 5, null);
    }
  }
}

Music.controlSurfaces = {
  "button": [
    Music.controlFunctions.transportOn
  ],
  "slider": [
    Music.controlFunctions.filterFrequency,
    Music.controlFunctions.volume,
    Music.controlFunctions.tempo,
    Music.controlFunctions.reverbRoom
    // Music.controlFunctions.pan
  ],
  "knob-3": [
    Music.controlFunctions.envelopeADSR
  ],
  "switch-2": [
    Music.controlFunctions.chord,
    Music.controlFunctions.oscillatorType
  ],
  "switch-4": [
    Music.controlFunctions.chord,
    Music.controlFunctions.oscillatorType,
    Music.controlFunctions.scaleDegree
  ]
}