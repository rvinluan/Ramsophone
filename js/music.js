var Music = {}

Music.init = function() {

//create a synth and connect it to the master output (your speakers)
var synth = new Tone.Synth({
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

var freeverb = new Tone.Freeverb().toMaster();

synth.connect(freeverb);

var seq = new Tone.Pattern(function(time, note){
  synth.triggerAttackRelease(note, "8n", time);
}, ["C4", "E4", "G4", "B4", "C5"], "upDown");

seq.interval = "8n";
seq.start("0m");
seq.loop = true;

Tone.Transport.bpm.value = 140
}

Music.controlFunctions = {
  transportOn: function() {
    var val = parseInt($(this).find(".button").attr("data-val"), 10);
    val ? Tone.Transport.start() : Tone.Transport.stop();
  }
}

Music.controlSurfaces = {
  button: [
    Music.controlFunctions.transportOn
  ],
  slider: [],
  knob: [],
  switch: []
}