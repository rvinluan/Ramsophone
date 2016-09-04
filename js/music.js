var Music = {}

Music.init = function() {

Music.originalMelody = {
  key: "c,c#,d,d#,e,f,f#,g,g#,a,bb,b".split(",").randomIn(),
  octave: "2,3,4,5".split(",").randomIn(),
  mode: "major,minor,mixolydian,blues".split(",").randomIn(),
  degree: 1,
  quality: "maj7,maj7,maj7,maj7,maj7,maj7,maj7,maj7,min7,7b5,aug7,dim7".split(",").randomIn()
}

//shallow clone
Music.melody = $.extend({}, Music.originalMelody);

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
  var val = map(Music.meter.value, 0, 1.6, 200, 10);
  val = clamp(val, 10, 200);
  $(".grid-master .meter .indicator").css("top", val);
}, 20)

}

Music.generateArpegio = function(paramsObj) {
  Music.melody = $.extend(Music.melody, paramsObj);
  var root = teoria.note(Music.melody.key + Music.melody.octave);
  var scl = root.scale(Music.melody.mode);
  var chord = scl.get(Music.melody.degree).chord(Music.melody.quality);
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
  chord: function (newValsArray) {
    var checkIfAllZero = newValsArray.toArray().reduce(function (prev, cur) {
      return prev += cur
    }, 0);
    if(checkIfAllZero == 0) {
      Music.generateArpegio({quality: Music.originalMelody.quality});
    } else if(newValsArray[0] == 1) {
      console.log('hi');
      Music.generateArpegio({quality: "maj7"});
    } else if(newValsArray[1] == 1) {
      Music.generateArpegio({quality: "aug7"});
    } else if(newValsArray[2] && newValsArray[2] == 1) {
      Music.generateArpegio({quality: "dim7"});
    } else if(newValsArray[3] && newValsArray[3] == 1) {
      Music.generateArpegio({quality: "7b5"});
    }
  },
  octave: function (newValsArray) {
    var checkIfAllZero = newValsArray.toArray().reduce(function (prev, cur) {
      return prev += cur
    }, 0);
    if(checkIfAllZero == 0) {
      Music.generateArpegio({octave: Music.originalMelody.octave});
    } else if(newValsArray[0] == 1) {
      Music.generateArpegio({octave: parseInt(Music.originalMelody.octave, 10) - 1});
    } else if(newValsArray[1] == 1) {
      Music.generateArpegio({octave: parseInt(Music.originalMelody.octave, 10) + 1});
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
      Music.generateArpegio({degree: Music.originalMelody.degree});
    } else if(newValsArray[0] == 1) {
      Music.generateArpegio({degree: 1});
    } else if(newValsArray[1] == 1) {
      Music.generateArpegio({degree: 2});
    } else if(newValsArray[2] && newValsArray[2] == 1) {
      Music.generateArpegio({degree: 3});
    } else if(newValsArray[3] && newValsArray[3] == 1) {
      Music.generateArpegio({degree: 4});
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
    Music.controlFunctions.oscillatorType,
    Music.controlFunctions.octave
  ],
  "switch-4": [
    Music.controlFunctions.chord,
    Music.controlFunctions.oscillatorType,
    Music.controlFunctions.scaleDegree
  ]
}
