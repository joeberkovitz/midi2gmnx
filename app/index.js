// app/index.js

let MidiConvert = require('MidiConvert')
let fs = require('fs');
let builder = require('xmlbuilder');

let filename = process.argv[2];

function generateMnx(midi) {
    let mnx = builder.create('mnx');
    mnx.ele('head').ele('title', midi.header.name);
    let gmnx = mnx.ele('score').ele('gmnx');

    let pdata = gmnx.ele('performance-data');
    let beat = midi.header.timeSignature[1];
    let bpm = midi.header.bpm;
    pdata.ele('performance-tempo', {
        beat: '/' + beat,
        bpm: bpm
    });

    let timescale = (bpm / 60) / beat;
    for (let track of midi.tracks) {
        //console.log(track);
        let ptrack = pdata.ele('performance-part');
        for (let note of track.notes) {            
            //console.log(note);
            ptrack.ele('performance-event', {
                pitch: note.midi,
                start: (note.time * timescale).toFixed(4),
                duration: (note.duration * timescale).toFixed(4),
                dynamics: Math.round(note.velocity * 127)
            });
        }
    }
    return mnx;
}

fs.readFile(filename, 'binary', function(err, midiBlob) {
  if (!err) {
    var midi = MidiConvert.parse(midiBlob);
    var xml = generateMnx(midi);
    console.log(xml.end({pretty: true}));
  }
  else {
    console.log(err);
  }
})
