var Music = {}

Music.init = function() {

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

Music.seq = new Tone.Pattern(function(time, note){
  Music.synth.triggerAttackRelease(note, "8n", time);
}, ["C4", "E4", "G4", "B4", "C5"], "upDown");

Music.seq.interval = "8n";
Music.seq.start("0m");
Music.seq.loop = true;

Tone.Transport.bpm.value = 140
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
  scale: function (newValsArray) {
    if(newValsArray[0] == 0 && newValsArray[1] == 0) {
      //major
      Music.seq.values = ["C4", "E4", "G4", "B4", "C5"];
    } else if(newValsArray[0] == 1) {
      //minor
      Music.seq.values = ["C4", "Eb4", "G4", "Bb4", "C5"];
    } else if(newValsArray[1] == 1) {
      //blues
      Music.seq.values = ["C4", "Eb4", "F4", "F#4", "G4", "Bb4", "C5"];
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
    Music.controlFunctions.scale,
    Music.controlFunctions.oscillatorType
  ],
  "switch-4": [
    Music.controlFunctions.oscillatorType
  ]
}