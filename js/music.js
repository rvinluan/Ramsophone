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

Music.synth.connect(Music.filter);
Music.filter.connect(Music.freeverb);
Music.freeverb.connect(Tone.Master);

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
  envelopeADSR: function (newValsArray) {
    Music.synth.envelope.attack = map( newValsArray[0], 0, 360, 0, 0.5 );
    Music.synth.envelope.decay = map( newValsArray[1], 0, 360, 0.05, 0.6 );
    Music.synth.envelope.sustain = map( newValsArray[2], 0, 360, 0, 0.5 );
  }
}

Music.controlSurfaces = {
  "button": [
    Music.controlFunctions.transportOn
  ],
  "slider": [],
  "knob-3": [
    Music.controlFunctions.envelopeADSR
  ],
  "knob-1": [
    Music.controlFunctions.filterFrequency
  ],
  "switch-2": [],
  "switch-4": []
}