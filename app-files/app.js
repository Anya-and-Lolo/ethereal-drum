(() => {
  'use strict';

  const STORAGE_SONGS = 'ethereal-drum-songs-v1';
  const STORAGE_INSTRUMENT = 'ethereal-drum-instrument-v1';
  const STORAGE_VIEW = 'ethereal-drum-view-v2';
  const STORAGE_EDITOR_PITCH_NAMES = 'ethereal-drum-editor-pitch-names-v1';
  const STORAGE_EDITOR_EXPRESSIVE_TIMING = 'ethereal-drum-editor-expressive-timing-v1';
  const STORAGE_EDITOR_DRAFT = 'ethereal-drum-editor-draft-v1';
  const STORAGE_HIDDEN_DEMOS = 'ethereal-drum-hidden-demos-v1';
  const STORAGE_WALKTHROUGH_COMPLETE = 'ethereal-drum-walkthrough-hidden-v2';
  const STORAGE_MODE_WALKTHROUGHS = 'ethereal-drum-mode-walkthroughs-hidden-v2';
  const COMMUNITY_REVIEW_FINGERPRINT_VERSION = 'v1';
  const SONG_FORMAT = 'ethereal-drum-song-v3';
  const LEGACY_SONG_FORMAT = 'ethereal-drum-song-v2';
  const COMMUNITY_UPLOAD_URL = String(window.ETHEREAL_COMMUNITY_UPLOAD_URL || '').trim();
  const COMMUNITY_STATUS_CALLBACK = 'etherealCommunityUploadStatus';
  const NOTE_COLORS = ['#a78bfa', '#5eead4', '#fbbf24', '#fb7185', '#60a5fa', '#f472b6', '#34d399', '#f97316', '#c084fc', '#22d3ee', '#eab308', '#a3e635', '#fda4af', '#67e8f9', '#bef264'];

  const SCALE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    'major-pentatonic': [0, 2, 4, 7, 9],
    'minor-pentatonic': [0, 3, 5, 7, 10]
  };
  const SCALE_NAMES = {
    major: 'major',
    'major-pentatonic': 'major pentatonic',
    'minor-pentatonic': 'minor pentatonic',
    custom: 'custom tuning',
    any: 'any tuning'
  };
  const ROOT_PITCH_CLASS = { C: 0, D: 2 };
  const KEY_NOTE_MAP = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '0': 9, q: 10, w: 11, e: 12, r: 13, t: 14, y: 15, u: 16, i: 17, o: 18, p: 19 };
  // Playback tuning standard. The 432 Hz option was removed from the UI: it confused
  // beginners and only affects synthesised pitch, never the notes, layout or songs.
  const REFERENCE_PITCH = 440;
  const DOT_ABOVE = '̇';
  const DOT_BELOW = '̣';
  // Companion notes are stored as scale-degree offsets so C and D instruments
  // transpose together instead of leaving the companion fixed in D major.
  const HIGH_DRUM_SPEC = [
    { label: `1${DOT_ABOVE}`, offset: 12 },
    { label: `2${DOT_ABOVE}`, offset: 14 },
    { label: `3${DOT_ABOVE}`, offset: 16 },
    { label: `4${DOT_ABOVE}`, offset: 17 },
    { label: `5${DOT_ABOVE}`, offset: 19 },
    { label: `6${DOT_ABOVE}`, offset: 21 },
    { label: `7${DOT_ABOVE}`, offset: 23 },
    { label: `1${DOT_ABOVE}${DOT_ABOVE}`, offset: 24 }
  ];
  const NOTE_GUIDE_SPEC = [
    { label: `3${DOT_BELOW}`, offset: -8 },
    { label: `4${DOT_BELOW}`, offset: -7 },
    { label: `5${DOT_BELOW}`, offset: -5 },
    { label: `6${DOT_BELOW}`, offset: -3 },
    { label: `7${DOT_BELOW}`, offset: -1 },
    { label: '1', offset: 0 },
    { label: '2', offset: 2 },
    { label: '3', offset: 4 },
    { label: '4', offset: 5 },
    { label: '5', offset: 7 },
    { label: '6', offset: 9 },
    { label: '7', offset: 11 },
    { label: `1${DOT_ABOVE}`, offset: 12 },
    { label: `2${DOT_ABOVE}`, offset: 14 },
    { label: `3${DOT_ABOVE}`, offset: 16 },
    { label: `4${DOT_ABOVE}`, offset: 17, companionOnly: true },
    { label: `5${DOT_ABOVE}`, offset: 19, companionOnly: true },
    { label: `6${DOT_ABOVE}`, offset: 21, companionOnly: true },
    { label: `7${DOT_ABOVE}`, offset: 23, companionOnly: true },
    { label: `1${DOT_ABOVE}${DOT_ABOVE}`, offset: 24, companionOnly: true }
  ];
  // CSS width of .stage-drum-wrap / .drum-body in the centre-drum view (see styles.css).
  const STAGE_DRUM_BASE = 360;
  const COUNT_IN_INTERVAL_MS = 1000;
  const INSTRUMENT_SETTINGS_FORMAT = 'ethereal-drum-settings-v1';
  const WALKTHROUGH_STEPS = [
    {
      target: '#noteStage',
      title: 'Watch the song come to life',
      text: 'The Wind Rises is playing as a visual preview. Notes fly towards the matching tongues, so you can see what comes next.'
    },
    {
      target: '#songList',
      title: 'Demo songs and My songs',
      text: 'Demo songs come from the owner-curated demo folder. Your own created and imported songs appear directly underneath in My songs.'
    },
    {
      target: '#libraryBtn',
      title: 'Community songs',
      text: 'Open the Community gallery to browse approved songs by difficulty. Your own songs stay private in this browser unless you submit one for review.'
    },
    {
      target: '#editBtn',
      title: 'Song Builder',
      text: 'Edit the selected song or choose New song to create your own. Add numbers, chords, rests, timing, and Jianpu notation.'
    },
    {
      target: '#helpTourBtn',
      title: 'Help when you need it',
      text: 'Click ? in Demo to replay this tour. In Practice, Wait for note, or Tuner, the same button replays help for that mode.'
    }
  ];
  const MODE_WALKTHROUGH_STEPS = {
    practice: [
      {
        target: '[data-mode="practice"]',
        title: 'Practice mode',
        text: 'Play along with the moving song. Use the screen, computer keyboard, or microphone with your real drum.'
      },
      {
        target: '#noteStage',
        title: 'Follow the incoming notes',
        text: 'Play each number as it reaches the drum. Correct notes light up; an incorrect note leaves the song running so you can continue.'
      },
      {
        target: '.stat-pills',
        title: 'Build your score and streak',
        text: 'Score shows your accuracy. Streak counts consecutive correct notes, and notes left shows how much of the song remains.'
      }
    ],
    wait: [
      {
        target: '[data-mode="wait"]',
        title: 'Wait for note mode',
        text: 'Use this mode when you want to learn slowly. The song stops at each step until you play the correct note.'
      },
      {
        target: '#noteStage',
        title: 'One note at a time',
        text: 'The expected tongue is highlighted. Tap it on screen, press its keyboard key, or play it through the microphone.'
      },
      {
        target: '#micBtn',
        title: 'Use your real drum',
        text: 'Turn on the microphone if you want the trainer to recognise your drum. You can still use the screen or keyboard without it.'
      }
    ],
    tuner: [
      {
        target: '[data-mode="tuner"]',
        title: 'Tuner mode',
        text: 'Tuner listens to one tongue at a time and compares its pitch with the selected instrument setup.'
      },
      {
        target: '#micBtn',
        title: 'Allow microphone access',
        text: 'Turn on the microphone, then strike one tongue clearly. A quiet room gives the most stable result.'
      },
      {
        target: '#tunerPanel',
        title: 'Read the pitch meter',
        text: 'The centre is in tune. The left side is flat and the right side is sharp. Small differences are normal while a tongue rings out.'
      }
    ]
  };

  const DRUM_LAYOUTS = {
    // 6-note C major pentatonic: tonic at the bottom, then left/right pairs climbing to the
    // octave at the top.
    6: [
      { xp: 0, yp: 32.50, size: 'large', rotate: 180 },       // 1   tonic  (bottom)
      { xp: -28.15, yp: 16.25, size: 'large', rotate: -120 }, // 2
      { xp: 28.15, yp: 16.25, size: 'large', rotate: 120 },   // 3
      { xp: -28.15, yp: -16.25, size: 'large', rotate: -60 }, // 5
      { xp: 28.15, yp: -16.25, size: 'large', rotate: 60 },   // 6
      { xp: 0, yp: -32.50, size: 'large', rotate: 0 }         // 1̇  octave (top)
    ],
    // Satori 8-note, C major from the tonic. Cardinals carry 1 2 3 4, diagonals 5 6 7 1̇,
    // exactly as they are stamped on the drum.
    8: [
      { xp: 0, yp: 33.0, size: 'large', rotate: 180 },        // 1   tonic  (bottom)
      { xp: -33.0, yp: 0, size: 'large', rotate: -90 },       // 2          (left)
      { xp: 33.0, yp: 0, size: 'large', rotate: 90 },         // 3          (right)
      { xp: 0, yp: -33.0, size: 'large', rotate: 0 },         // 4          (top)
      { xp: 25.10, yp: 25.10, size: 'small', rotate: 135 },   // 5
      { xp: -25.10, yp: 25.10, size: 'small', rotate: -135 }, // 6
      { xp: 25.10, yp: -25.10, size: 'small', rotate: 45 },   // 7
      { xp: -25.10, yp: -25.10, size: 'small', rotate: -45 }  // 1̇  octave
    ],
    // Satori 11-note, C major. Centre tongue is the lowest note; the next two sit at 12 and
    // 6 o'clock; the remaining eight alternate right/left while climbing towards the top.
    11: [
      { xp: 0, yp: -3.50, size: 'centerlarge', rotate: 0 },   // 5̣  lowest (centre)
      { xp: 0, yp: -34.00, size: 'large', rotate: 0 },        // 6̣         (top)
      { xp: 0, yp: 34.00, size: 'large', rotate: 180 },       // 7̣         (bottom)
      { xp: 21.75, yp: 29.93, size: 'small', rotate: 144 },   // 1   tonic
      { xp: -21.75, yp: 29.93, size: 'small', rotate: -144 }, // 2
      { xp: 35.19, yp: 11.43, size: 'small', rotate: 108 },   // 3
      { xp: -35.19, yp: 11.43, size: 'small', rotate: -108 }, // 4
      { xp: 35.19, yp: -11.43, size: 'small', rotate: 72 },   // 5
      { xp: -35.19, yp: -11.43, size: 'small', rotate: -72 }, // 6
      { xp: 21.75, yp: -29.93, size: 'small', rotate: 36 },   // 7
      { xp: -21.75, yp: -29.93, size: 'small', rotate: -36 }  // 1̇  octave
    ],
    // 13-note C major drum from the reference: G3 occupies the middle tongue.
    // The twelve outer tongues mirror the physical petal placement.
    13: [
      { xp: 0, yp: 0, size: 'centerlarge', rotate: 0 },       // 5̣  G3, centre
      { xp: 0, yp: -34.0, size: 'large', rotate: 0 },         // 6̣  A3
      { xp: 29.45, yp: -17.0, size: 'large', rotate: 60 },    // 7̣  B3
      { xp: -29.45, yp: -17.0, size: 'large', rotate: -60 },  // 1   C4
      { xp: -34.0, yp: 0, size: 'large', rotate: -90 },       // 2   D4
      { xp: 17.0, yp: 29.45, size: 'large', rotate: 150 },    // 3   E4
      { xp: -17.0, yp: 29.45, size: 'large', rotate: -150 },  // 4   F4
      { xp: 29.45, yp: 17.0, size: 'large', rotate: 120 },    // 5   G4
      { xp: -29.45, yp: 17.0, size: 'large', rotate: -120 },  // 6   A4
      { xp: 0, yp: 34.0, size: 'large', rotate: 180 },        // 7   B4
      { xp: 34.0, yp: 0, size: 'large', rotate: 90 },         // 1̇  C5
      { xp: 17.0, yp: -29.45, size: 'large', rotate: 30 },    // 2̇  D5
      { xp: -17.0, yp: -29.45, size: 'large', rotate: -30 }   // 3̇  E5
    ],
    // 15-note layout is expressed as a percentage of the drum diameter (xp/yp) so the
    // arrangement is identical at every drum size (sidebar, stage, mobile).
    // 14 tongues are spaced evenly at 360/14 = 25.714 deg (index 2 at 12 o'clock) and each
    // one is pushed out until its OUTER TIP sits at 48.9% of the diameter, so every tongue
    // keeps the same margin from the rim regardless of its length (like a real drum, see
    // the reference diagram). The seven long tongues reach further in, giving the
    // alternating long/short pattern of a real 15-note drum. Ring radius by class:
    //   small 41.42  topsmall 41.34  toplarge 36.00  large 34.30
    // The five long tongues carry the five lowest ring notes (G3 A3 B3 C#4 D4), mirrored
    // left/right, exactly as they sit on the physical drum.
    // Inner edges land at 19.70 (large) and 23.10 (toplarge).
    // Result: every edge-to-edge gap is 3.35-3.88%, nothing overlaps, nothing crosses 50%.
    // Index order follows DRUM_TUNINGS['15-major']: 2̇ 2 3̇ 3 1̇ 1 6 6̣ 4 4̣ 5 5̣ 7̣ 7 3̣
    15: [
      { xp: -32.39, yp: -25.83, size: 'small', rotate: -51.43 },    // 2̇  E5
      { xp: -15.62, yp: -32.44, size: 'toplarge', rotate: -25.71 }, // 2   E4
      { xp: 0, yp: -41.34, size: 'topsmall', rotate: 0 },           // 3̇  F#5
      { xp: 15.62, yp: -32.44, size: 'toplarge', rotate: 25.71 },   // 3   F#4
      { xp: 32.39, yp: -25.83, size: 'small', rotate: 51.43 },      // 1̇  D5
      { xp: 33.44, yp: -7.63, size: 'large', rotate: 77.14 },       // 1   D4
      { xp: 40.39, yp: 9.22, size: 'small', rotate: 102.86 },       // 6   B4
      { xp: 26.82, yp: 21.39, size: 'large', rotate: 128.57 },      // 6̣  B3
      { xp: 17.97, yp: 37.32, size: 'small', rotate: 154.29 },      // 4   G4
      { xp: 0, yp: 34.30, size: 'large', rotate: 180 },             // 4̣  G3
      { xp: -17.97, yp: 37.32, size: 'small', rotate: -154.29 },    // 5   A4
      { xp: -26.82, yp: 21.39, size: 'large', rotate: -128.57 },    // 5̣  A3
      { xp: -33.44, yp: -7.63, size: 'large', rotate: -77.14 },     // 7̣  C#4
      { xp: -40.39, yp: 9.22, size: 'small', rotate: -102.86 },     // 7   C#5
      { xp: 0, yp: -3.60, size: 'centerlarge', rotate: 0 }          // 3̣  F#3 (centre)
    ]
  };

  function defaultNoteColor(index) {
    return NOTE_COLORS[index % NOTE_COLORS.length];
  }

  function normaliseColor(value, index = 0) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value).toLowerCase() : defaultNoteColor(index);
  }

  function noteColor(index) {
    return normaliseColor(playableNoteAt(index)?.color, index);
  }

  function hexToRgb(hex) {
    const clean = normaliseColor(hex).slice(1);
    return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
  }

  function noteInkColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.58 ? '#101521' : '#ffffff';
  }

  function setNoteColorVars(element, color) {
    const safe = normaliseColor(color);
    const { r, g, b } = hexToRgb(safe);
    element.style.setProperty('--note-color', safe);
    element.style.setProperty('--note-rgb', `${r}, ${g}, ${b}`);
    element.style.setProperty('--note-ink', noteInkColor(safe));
  }

  // Factory tunings of the physical drums, in tongue order (entry i sits in DRUM_LAYOUTS
  // slot i). Each entry is [jianpu number, semitones from the middle-octave tonic, octave
  // mark]. Changing key or lowest octave just slides the whole set.
  const DRUM_TUNINGS = {
    // C major pentatonic: C D E G A C'
    '6-major-pentatonic': [['1', 0], ['2', 2], ['3', 4], ['5', 7], ['6', 9], ['1', 12, 'up']],
    // Satori 8: one octave of the major scale, C..C'
    '8-major': [['1', 0], ['2', 2], ['3', 4], ['4', 5], ['5', 7], ['6', 9], ['7', 11], ['1', 12, 'up']],
    // Satori 11: G below the tonic up to the octave above, i.e. G3 A3 B3 C4..C5 in C major
    '11-major': [
      ['5', -5, 'down'], ['6', -3, 'down'], ['7', -1, 'down'],
      ['1', 0], ['2', 2], ['3', 4], ['4', 5], ['5', 7], ['6', 9], ['7', 11], ['1', 12, 'up']
    ],
    // 13-note C major: G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5.
    // The order follows the physical tongue positions in DRUM_LAYOUTS[13].
    '13-major': [
      ['5', -5, 'down'], ['6', -3, 'down'], ['7', -1, 'down'],
      ['1', 0], ['2', 2], ['3', 4], ['4', 5], ['5', 7], ['6', 9], ['7', 11],
      ['1', 12, 'up'], ['2', 14, 'up'], ['3', 16, 'up']
    ],
    // 15-note: 3̣ 4̣ 5̣ 6̣ 7̣ | 1 2 3 4 5 6 7 | 1̇ 2̇ 3̇, laid out to match the drum's tongues
    '15-major': [
      ['2', 14, 'up'], ['2', 2], ['3', 16, 'up'], ['3', 4], ['1', 12, 'up'], ['1', 0],
      ['6', 9], ['6', -3, 'down'], ['4', 5], ['4', -7, 'down'], ['5', 7], ['5', -5, 'down'],
      ['7', -1, 'down'], ['7', 11], ['3', -8, 'down']
    ]
  };

  const COUNT_DEFAULTS = {
    6: { key: 'C', scale: 'major-pentatonic', octave: 5 },
    8: { key: 'C', scale: 'major', octave: 5 },
    11: { key: 'C', scale: 'major', octave: 4 },
    13: { key: 'C', scale: 'major', octave: 4 },
    15: { key: 'D', scale: 'major', octave: 4 }
  };

  function buildTunedNotes(count, scaleType, key = 'C', rootOctave = 4) {
    const spec = DRUM_TUNINGS[`${count}-${scaleType}`];
    if (!spec) return null;
    const rootMidi = 12 * (Number(rootOctave) + 1) + ROOT_PITCH_CLASS[key];
    return spec.map(([base, offset, mark], i) => ({
      label: applyOctaveMark(base, mark || ''),
      midi: rootMidi + offset,
      color: defaultNoteColor(i)
    }));
  }

  function buildCompanionTunedNotes(key = 'D', rootOctave = 4) {
    const safeKey = ROOT_PITCH_CLASS[key] === undefined ? 'D' : key;
    const rootMidi = 12 * (Number(rootOctave) + 1) + ROOT_PITCH_CLASS[safeKey];
    return HIGH_DRUM_SPEC.map((preset, slot) => ({
      label: preset.label,
      midi: rootMidi + preset.offset,
      color: defaultNoteColor(15 + slot)
    }));
  }

  // Combining dots (U+0307 / U+0323) are positioned by the font, so their offset changes
  // from digit to digit. Split the mark off the label so it can be drawn as a centred dot.
  // `-` stays the rest so every saved song keeps its meaning; `0` is accepted as an
  // easier-to-type alias, and is what the numbered sheet has always drawn for a rest.
  function isRestCore(core) {
    return core === '-' || core === '0';
  }

  function splitOctaveMark(label) {
    const text = String(label ?? '');
    const upCount = [...text].filter(character => character === DOT_ABOVE).length;
    const downCount = [...text].filter(character => character === DOT_BELOW).length;
    if (upCount) return { base: text.split(DOT_ABOVE).join(''), mark: 'up', count: upCount };
    if (downCount) return { base: text.split(DOT_BELOW).join(''), mark: 'down', count: downCount };
    return { base: text, mark: '', count: 0 };
  }

  function applyOctaveMark(base, mark) {
    if (mark === 'up') return `${base}${DOT_ABOVE}`;
    if (mark === 'down') return `${base}${DOT_BELOW}`;
    return base;
  }

  function octaveMarkClass(octave) {
    if (!octave?.mark) return '';
    if (octave.mark === 'up' && octave.count > 1) return 'oct-up oct-up-double';
    return `oct-${octave.mark}`;
  }

  function highDrumEnabled() {
    return state.instrument?.count === 15 && Boolean(state.instrument?.highDrumEnabled);
  }

  function normaliseCompanionNotes(
    notes = [],
    key = state.instrument?.key || 'D',
    rootOctave = state.instrument?.rootOctave ?? 4
  ) {
    const presets = buildCompanionTunedNotes(key, rootOctave);
    return presets.map((preset, slot) => {
      const saved = notes[slot] || {};
      return {
        label: String(saved.label || preset.label),
        midi: Number(saved.midi) || preset.midi,
        color: normaliseColor(saved.color, 15 + slot)
      };
    });
  }

  function configuredCompanionNotes() {
    return normaliseCompanionNotes(
      state.instrument?.companionNotes,
      state.instrument?.key,
      state.instrument?.rootOctave
    );
  }

  function companionMatchesPreset(notes, key, rootOctave) {
    if (!Array.isArray(notes) || notes.length !== HIGH_DRUM_SPEC.length) return false;
    const preset = buildCompanionTunedNotes(key, rootOctave);
    return preset.every((note, i) =>
      note.label.toLowerCase() === String(notes[i]?.label || '').toLowerCase()
      && note.midi === Number(notes[i]?.midi)
    );
  }

  function highDrumNotes() {
    const mainNotes = state.instrument?.notes || [];
    let extraIndex = mainNotes.length;
    return configuredCompanionNotes().map((preset, slot) => {
      const mainIndex = mainNotes.findIndex(note => note.label.toLowerCase() === preset.label.toLowerCase());
      if (mainIndex >= 0) {
        return {
          ...preset,
          noteIndex: mainIndex,
          slot,
          shared: true,
          source: 'high'
        };
      }
      const noteIndex = extraIndex++;
      return {
        ...preset,
        color: defaultNoteColor(noteIndex),
        noteIndex,
        slot,
        shared: false,
        source: 'high'
      };
    });
  }

  function playableNotes() {
    const main = (state.instrument?.notes || []).map((note, noteIndex) => ({
      ...note,
      noteIndex,
      source: 'main'
    }));
    if (!highDrumEnabled()) return main;
    return main.concat(highDrumNotes().filter(note => !note.shared));
  }

  function playableNoteAt(noteIndex) {
    if (noteIndex < (state.instrument?.notes?.length || 0)) return state.instrument.notes[noteIndex];
    return highDrumEnabled() ? highDrumNotes().find(note => note.noteIndex === noteIndex) : null;
  }

  function highDrumSlotForLabel(label) {
    if (!highDrumEnabled()) return -1;
    const normalisedLabel = String(label || '').toLowerCase();
    const slot = configuredCompanionNotes().findIndex(note => note.label.toLowerCase() === normalisedLabel);
    if (slot < 0) return -1;

    // The companion repeats D5, E5 and F#5 (1̇, 2̇ and 3̇), which are already
    // present on the main 15-note drum. Automatic playback should always route
    // those shared pitches to the main drum. The companion is reserved for its
    // five range-extending pitches: 4̇, 5̇, 6̇, 7̇ and 1̇̇.
    const sharedWithMainDrum = (state.instrument?.notes || [])
      .some(note => String(note.label || '').toLowerCase() === normalisedLabel);
    return sharedWithMainDrum ? -1 : slot;
  }

  // The tonic ("1") of the middle octave, from the key + lowest-octave selects.
  function settingsTonicMidi() {
    const key = els.instrumentKeySelect?.value || 'C';
    const octave = Number(els.rootOctaveSelect?.value ?? 4);
    return 12 * (octave + 1) + (ROOT_PITCH_CLASS[key] ?? 0);
  }

  // Which octave dot a pitch calls for. Above the middle octave -> dot above,
  // below it -> dot below, inside it -> no dot. This is decided by the pitch, so the
  // editor only has to ask "dot or no dot", never "which dot".
  function octaveMarkForMidi(midi, tonicMidi = settingsTonicMidi()) {
    if (!Number.isFinite(midi)) return '';
    if (midi > tonicMidi + 11) return 'up';
    if (midi < tonicMidi) return 'down';
    return '';
  }

  function hasCenterTongue(count = state.instrument?.count) {
    return count === 11 || count === 13 || count === 15;
  }

  const fallbackPresets = [
    {
      id: 'moonlit-steps',
      title: 'Moonlit Steps',
      bpm: 72,
      scaleType: 'major',
      builtIn: true,
      sequence: '1 3 5 3 | 2 4 6 4 | 1 3 5 6 | 5 3 2 -'
    },
    {
      id: 'little-star',
      title: 'Twinkle Twinkle Little Star',
      bpm: 82,
      scaleType: 'major',
      builtIn: true,
      sequence: '1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 - | 5 5 4 4 | 3 3 2 - | 5 5 4 4 | 3 3 2 - | 1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 -'
    },
    {
      id: 'calm-water',
      title: 'Calm Water',
      bpm: 60,
      scaleType: 'major',
      builtIn: true,
      sequence: '1+5 - 3 2 | 4 - 6 5 | 3 2 1 - | 2+5 - 4 3'
    },
    {
      id: 'note-scale-practice',
      title: 'Note Scale Practice',
      bpm: 72,
      scaleType: 'major-pentatonic',
      builtIn: true,
      sequence: '1 2 3 5 | 6 1̇ 6 5 | 3 2 1 -'
    },
    {
      id: 'the-wind-rises',
      title: 'The Wind Rises 起风了',
      bpm: 130,
      scaleType: 'major',
      builtIn: true,
      sequence: '- - | 1:0.5 2:0.5 3:0.5 1:0.5 | 6+4̣ 5:0.5 6:0.5 -:0.25 -:0.25 -:0.25 1:0.25 | 7+5̣ 6:0.5 7:0.5 - | 7+3̣ 6:0.5 7:0.5 -:0.25 -:0.25 -:0.25 3:0.25 | 1̇+6̣ 2:0.25 1:0.25 7:0.25 6:0.25 5 | 6+4̣ 5:0.5 6:0.5 -:0.25 5:0.25 6:0.25 5:0.25 | 6+5̣ 5:0.5 2:0.5 - 5:0.5 -:0.5 | 3+3̣ 5̣:0.5 1 - | 1̇+5̣ 2:0.5 3:0.5 1:0.5 | 6+4̣ 5:0.5 6:0.5 -:0.25 -:0.25 -:0.25 1:0.25 | 7+5̣ 6:0.5 7:0.5 - | 7+3̣ 6:0.5 7:0.5 -:0.25 -:0.25 -:0.25 3:0.25 | 1̇+6̣ 2:0.25 1:0.25 7:0.25 6:0.25 5 | 6+4̣ 3̇:0.5 3̇:0.5 -:0.25 -:0.25 5:0.25 -:0.25 | 6+4̣ 3̇:0.5 3̇:0.5 - 5:0.5 6:0.5 | 6+6̣ 1 3 - - - - - |'
    }
  ];

  function demoCatalogId(song, index) {
    const source = String(song?.id || song?.title || `demo-${index + 1}`);
    return source.toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `demo-${index + 1}`;
  }

  const hasDemoCatalog = Array.isArray(window.ETHEREAL_DEMO_SONGS);
  const discoveredDemos = hasDemoCatalog
    ? window.ETHEREAL_DEMO_SONGS
      .filter(song => song && song.title && song.sequence && Number(song.bpm))
      .map((song, index) => ({
        ...song,
        id: demoCatalogId(song, index),
        builtIn: true,
        folder: 'demo'
      }))
    : [];

  const presets = hasDemoCatalog ? discoveredDemos : fallbackPresets;
  const discoveredCommunity = Array.isArray(window.ETHEREAL_COMMUNITY_SONGS)
    ? window.ETHEREAL_COMMUNITY_SONGS
      .filter(song => song && song.title && song.sequence && Number(song.bpm))
      .map((song, index) => ({
        ...song,
        id: `community-${demoCatalogId(song, index)}`,
        builtIn: true,
        folder: 'community'
      }))
    : [];
  let curatedSongs = [...presets, ...discoveredCommunity];
  let activeDemoCatalogVersion = String(window.ETHEREAL_DEMO_CATALOG_VERSION || '');
  let demoCatalogPollBusy = false;
  let walkthroughStepIndex = 0;
  let walkthroughKind = 'main';
  let activeWalkthroughSteps = WALKTHROUGH_STEPS;
  let walkthroughPreviewState = null;
  let communityUploadRequest = null;


  function catalogSongsFromGlobals() {
    const demos = Array.isArray(window.ETHEREAL_DEMO_SONGS)
      ? window.ETHEREAL_DEMO_SONGS
        .filter(song => song && song.title && song.sequence && Number(song.bpm))
        .map((song, index) => ({ ...song, id: demoCatalogId(song, index), builtIn: true, folder: 'demo' }))
      : [];
    const community = Array.isArray(window.ETHEREAL_COMMUNITY_SONGS)
      ? window.ETHEREAL_COMMUNITY_SONGS
        .filter(song => song && song.title && song.sequence && Number(song.bpm))
        .map((song, index) => ({ ...song, id: `community-${demoCatalogId(song, index)}`, builtIn: true, folder: 'community' }))
      : [];
    return [...demos, ...community];
  }

  function applyCatalogGlobals({ announce = false } = {}) {
    const nextCurated = catalogSongsFromGlobals();
    const customSongs = state.songs.filter(song => !song.builtIn);
    const selectedBefore = state.selectedId;
    curatedSongs = nextCurated;
    state.songs = [
      ...curatedSongs.filter(song => !state.hiddenDemoIds.has(song.id)).map(song => normaliseSong(song, 'major')),
      ...customSongs
        .filter(song => !curatedSongs.some(publicSong => publicSong.id === song.id))
        .filter(song => !isBundledScalePractice(song))
        .map(song => normaliseSong(song, 'any'))
    ];
    if (!state.songs.some(song => song.id === selectedBefore)) {
      state.selectedId = state.songs[0]?.id || null;
      if (state.selectedId) selectSong(state.selectedId);
      else { renderSongList(); renderSongLibrary(); }
    } else {
      state.selectedId = selectedBefore;
      renderSongList();
      renderSongLibrary();
    }
    if (announce) showToast('Song folders updated.', 'success');
  }

  const state = {
    songs: [],
    selectedId: null,
    instrument: null,
    parsedNotes: [],
    duration: 0,
    currentTime: 0,
    playing: false,
    countInActive: false,
    countInRemaining: 0,
    playbackStartedAt: 0,
    pausedAt: 0,
    speed: 1,
    mode: 'demo',
    visualMode: 'radial',
    metronome: false,
    loop: false,
    loopTimer: 0,
    loopA: null,
    loopB: null,
    sectionLoop: false,
    animationId: 0,
    audioContext: null,
    masterGain: null,
    lastScheduledIndex: -1,
    lastMetronomeBeat: -1,
    score: 0,
    attempts: 0,
    streak: 0,
    bestStreak: 0,
    hitNotes: new Set(),
    missedNoteIds: new Set(),
    lastResultMissed: [],
    recommendedSongId: null,
    waitingIndex: 0,
    focusMode: false,
    libraryTab: 'all',
    editorSongId: null,
    editorDraftKey: 'new',
    editorSelectionStart: 0,
    editorSelectionEnd: 0,
    editorTimeline: [],
    editorTimingSelectionIndex: -1,
    editorTimingSelection: [],
    editorRangeSelectArmed: false,
    draftSaveTimer: 0,
    expressiveTimingEnabled: false,
    showPitchNames: false,
    collapsedSongGroups: new Set(),
    hiddenDemoIds: new Set(),
    resizeObserver: null,
    colourTargetRow: null,
    stars: [],
    ambientId: 0,
    lastFrameAt: 0,
    lastVisualAt: 0,
    lastAmbientAt: 0,
    particlePhaseCache: new Map(),
    stageTonguePads: [],
    companionGeometryCache: null,
    companionGuideGeometryKey: '',
    micEnabled: false,
    micStream: null,
    micSource: null,
    micAnalyser: null,
    micTimeData: null,
    micAnimationId: 0,
    micPendingTimer: 0,
    micNoiseFloor: 0.008,
    micWasLoud: false,
    micLastTrigger: 0,
    tunerResult: null
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    sidebar: $('sidebar'), sidebarClose: $('sidebarClose'), sidebarScrim: $('sidebarScrim'), menuBtn: $('menuBtn'), songList: $('songList'), songSearch: $('songSearch'),
    newSongBtn: $('newSongBtn'), importBtn: $('importBtn'), importFile: $('importFile'), libraryBtn: $('libraryBtn'), libraryCountBadge: $('libraryCountBadge'), exportBtn: $('exportBtn'), deleteBtn: $('deleteBtn'), restoreDemosBtn: $('restoreDemosBtn'),
    currentTitle: $('currentTitle'), currentCollection: $('currentCollection'), currentDifficulty: $('currentDifficulty'), editBtn: $('editBtn'), settingsBtn: $('settingsBtn'), helpTourBtn: $('helpTourBtn'), mobileViewToggleBtn: $('mobileViewToggleBtn'), instrumentTitle: $('instrumentTitle'),
    noteCanvas: $('noteCanvas'), noteCanvasBack: $('noteCanvasBack'), noteStage: $('noteStage'), playBtn: $('playBtn'), loopBtn: $('loopBtn'), metronomeBtn: $('metronomeBtn'), focusModeBtn: $('focusModeBtn'),
    progress: $('progress'), elapsedLabel: $('elapsedLabel'), durationLabel: $('durationLabel'), speedSelect: $('speedSelect'), countInToggle: $('countInToggle'),
    setABtn: $('setABtn'), setBBtn: $('setBBtn'), abLoopBtn: $('abLoopBtn'), clearABBtn: $('clearABBtn'), abLoopStatus: $('abLoopStatus'), abMarkerA: $('abMarkerA'), abMarkerB: $('abMarkerB'),
    totalNotesLabel: $('totalNotesLabel'), tempoLabel: $('tempoLabel'), countIn: $('countIn'), scorePill: $('scorePill'), scoreValue: $('scoreValue'), streakPill: $('streakPill'), streakValue: $('streakValue'), notesLeftValue: $('notesLeftValue'), mobileScorePill: $('mobileScorePill'), mobileScoreValue: $('mobileScoreValue'), mobileStreakPill: $('mobileStreakPill'), mobileStreakValue: $('mobileStreakValue'), mobileNotesLeftValue: $('mobileNotesLeftValue'), modeHint: $('modeHint'),
    trainerGrid: $('trainerGrid'), practiceCard: $('practiceCard'), drumWrap: $('drumWrap'), stageDrumWrap: $('stageDrumWrap'), highDrumWrap: $('highDrumWrap'), keyboardHint: $('keyboardHint'), nextNoteValue: $('nextNoteValue'), nextNoteTime: $('nextNoteTime'),
    editorDialog: $('editorDialog'), editorForm: $('editorForm'), editorHeading: $('editorHeading'), songTitleInput: $('songTitleInput'), songBpmInput: $('songBpmInput'),
    sequenceInput: $('sequenceInput'), sequenceBackdrop: $('sequenceBackdrop'), copySequenceBtn: $('copySequenceBtn'), exportSheetBtn: $('exportSheetBtn'),
    printSheet: $('printSheet'),
    draftNotice: $('draftNotice'), draftNoticeText: $('draftNoticeText'), discardDraftBtn: $('discardDraftBtn'), songScaleSelect: $('songScaleSelect'), miniPads: $('miniPads'), expressiveTimingToggle: $('expressiveTimingToggle'), timingEditor: $('timingEditor'), timingTokenStrip: $('timingTokenStrip'), timingChoiceGroup: $('timingChoiceGroup'), timingRangeBtn: $('timingRangeBtn'), selectedTimingLabel: $('selectedTimingLabel'), appendChordBtn: $('appendChordBtn'), appendRestBtn: $('appendRestBtn'), appendBarBtn: $('appendBarBtn'), clearSequenceBtn: $('clearSequenceBtn'), showPitchNamesToggle: $('showPitchNamesToggle'), saveSongBtn: $('saveSongBtn'), deleteEditorBtn: $('deleteEditorBtn'), editorGuideBtn: $('editorGuideBtn'), songGuideDialog: $('songGuideDialog'), songGuideContent: $('songGuideContent'), communityDialog: $('communityDialog'), communitySelection: $('communitySelection'), submitCommunityBtn: $('submitCommunityBtn'), communityUploadProgress: $('communityUploadProgress'), communityUploadStatus: $('communityUploadStatus'), communityUploadPercent: $('communityUploadPercent'), communityProgressTrack: $('communityProgressTrack'), communityProgressFill: $('communityProgressFill'),
    songLibraryDialog: $('songLibraryDialog'), libraryTabAll: $('libraryTabAll'), libraryTabEasy: $('libraryTabEasy'), libraryTabMedium: $('libraryTabMedium'), libraryTabHard: $('libraryTabHard'), libraryTabExpert: $('libraryTabExpert'), librarySearch: $('librarySearch'), libraryGrid: $('libraryGrid'), libraryEmpty: $('libraryEmpty'), libraryCommunityBanner: $('libraryCommunityBanner'), libraryCommunityInfoBtn: $('libraryCommunityInfoBtn'), communitySongsCount: $('communitySongsCount'), communityEasyCount: $('communityEasyCount'), communityMediumCount: $('communityMediumCount'), communityHardCount: $('communityHardCount'), communityExpertCount: $('communityExpertCount'),
    myDrumDialog: $('myDrumDialog'), myDrumTitle: $('myDrumTitle'), myDrumBadges: $('myDrumBadges'), myDrumPreview: $('myDrumPreview'), myDrumNoteCount: $('myDrumNoteCount'), myDrumNoteList: $('myDrumNoteList'), myDrumCompanion: $('myDrumCompanion'), myDrumCompanionPreview: $('myDrumCompanionPreview'), exportInstrumentBtn: $('exportInstrumentBtn'), exportInstrumentFromSettingsBtn: $('exportInstrumentFromSettingsBtn'), importInstrumentBtn: $('importInstrumentBtn'), importInstrumentFile: $('importInstrumentFile'), editInstrumentBtn: $('editInstrumentBtn'),
    settingsDialog: $('settingsDialog'), settingsForm: $('settingsForm'), instrumentKeySelect: $('instrumentKeySelect'), scaleTypeSelect: $('scaleTypeSelect'), noteCountSelect: $('noteCountSelect'), rootOctaveSelect: $('rootOctaveSelect'), highDrumOption: $('highDrumOption'), highDrumAvailability: $('highDrumAvailability'), highDrumToggle: $('highDrumToggle'), highDrumAlwaysToggle: $('highDrumAlwaysToggle'), companionTuningSection: $('companionTuningSection'), companionTuningGrid: $('companionTuningGrid'), colourPopover: $('colourPopover'), pitchInfoBtn: $('pitchInfoBtn'), pitchInfo: $('pitchInfo'), noteGuideBody: $('noteGuideBody'), noteGuideOctave: $('noteGuideOctave'), tuningGrid: $('tuningGrid'), saveSettingsBtn: $('saveSettingsBtn'),
    toast: $('toast'), catalogUpdateBanner: $('catalogUpdateBanner'), catalogUpdateRefreshBtn: $('catalogUpdateRefreshBtn'), catalogUpdateLaterBtn: $('catalogUpdateLaterBtn'), micBtn: $('micBtn'), micStatus: $('micStatus'),
    tourOverlay: $('tourOverlay'), tourFocusRing: $('tourFocusRing'), tourCard: $('tourCard'), tourProgress: $('tourProgress'), tourTitle: $('tourTitle'), tourText: $('tourText'), tourSkipBtn: $('tourSkipBtn'), tourBackBtn: $('tourBackBtn'), tourNextBtn: $('tourNextBtn'), tourDontShowAgain: $('tourDontShowAgain'),
    tunerPanel: $('tunerPanel'), tunerLabel: $('tunerLabel'), tunerNoteName: $('tunerNoteName'), tunerCents: $('tunerCents'), tunerMeter: $('tunerMeter'), tunerNeedle: $('tunerNeedle'),
    resultDialog: $('resultDialog'), resultTitle: $('resultTitle'), resultSummary: $('resultSummary'), resultStats: $('resultStats'), resultHitValue: $('resultHitValue'), resultAccuracyValue: $('resultAccuracyValue'), resultStreakValue: $('resultStreakValue'), resultMistakes: $('resultMistakes'), resultRecommendation: $('resultRecommendation'), resultRecommendedBtn: $('resultRecommendedBtn'), resultReplayBtn: $('resultReplayBtn'), practiceMistakesBtn: $('practiceMistakesBtn'), resultNextBtn: $('resultNextBtn')
  };

  function makePresetInstrument(count = 6, key = 'C', rootOctave = 4, referencePitch = REFERENCE_PITCH, scaleType = 'major') {
    const safeKey = ROOT_PITCH_CLASS[key] === undefined ? 'C' : key;
    const safeScale = SCALE_INTERVALS[scaleType] ? scaleType : 'major';
    let notes = buildTunedNotes(count, safeScale, safeKey, Number(rootOctave));
    if (!notes) {
      const intervals = SCALE_INTERVALS[safeScale];
      const rootMidi = 12 * (Number(rootOctave) + 1) + ROOT_PITCH_CLASS[safeKey];
      notes = Array.from({ length: count }, (_, i) => ({
        label: String(i + 1),
        midi: rootMidi + Math.floor(i / intervals.length) * 12 + intervals[i % intervals.length],
        color: defaultNoteColor(i)
      }));
    }
    return {
      count,
      key: safeKey,
      scaleType: safeScale,
      rootOctave: Number(rootOctave),
      referencePitch: Number(referencePitch),
      name: `${count}-note ${safeKey} ${SCALE_NAMES[safeScale]} drum`,
      notes
    };
  }

  function makeDefaultInstrument(count = 15) {
    if (count === 15) {
      return {
        ...makePresetInstrument(15, 'D', 4, 440, 'major'),
        highDrumEnabled: true,
        highDrumAlwaysVisible: false,
        companionNotes: buildCompanionTunedNotes('D', 4)
      };
    }
    if (count === 8 || count === 11 || count === 13) return makePresetInstrument(count, 'C', 4, 440, 'major');
    return makePresetInstrument(count, 'C', 4, 440, 'major-pentatonic');
  }

  function detectPreset(notes) {
    if (!notes?.length) return { key: 'C', scaleType: 'custom' };
    for (const key of ['C', 'D']) {
      for (const scaleType of Object.keys(SCALE_INTERVALS)) {
        const octave = Math.floor(Number(notes[0].midi) / 12) - 1;
        const expected = makePresetInstrument(notes.length, key, octave, 440, scaleType).notes;
        if (expected.every((note, i) => note.midi === Number(notes[i]?.midi))) return { key, scaleType };
      }
    }
    const firstPitchClass = ((Number(notes[0]?.midi) % 12) + 12) % 12;
    return { key: firstPitchClass === ROOT_PITCH_CLASS.D ? 'D' : 'C', scaleType: 'custom' };
  }

  function normaliseInstrument(instrument) {
    if (!instrument || !Array.isArray(instrument.notes)) return makeDefaultInstrument(15);
    const count = Number(instrument.count) || instrument.notes.length;
    if (count === 12) {
      const replacement = makeDefaultInstrument(13);
      replacement.notes.forEach((note, i) => {
        note.color = normaliseColor(instrument.notes[i]?.color, i);
      });
      return replacement;
    }
    const detected = detectPreset(instrument.notes);
    const key = ['C', 'D'].includes(instrument.key) ? instrument.key : detected.key;
    const scaleType = ['major', 'major-pentatonic', 'minor-pentatonic', 'custom'].includes(instrument.scaleType)
      ? instrument.scaleType
      : detected.scaleType;
    const rootOctave = Number.isFinite(Number(instrument.rootOctave))
      ? Number(instrument.rootOctave)
      : Math.floor((Number(instrument.notes[0]?.midi) || 60) / 12) - 1;
    const referencePitch = REFERENCE_PITCH;
    const savedCompanion = instrument.companionNotes;
    const shouldMigrateCompanion = count === 15
      && key === 'C'
      && scaleType !== 'custom'
      && companionMatchesPreset(savedCompanion, 'D', rootOctave);
    const companionNotes = shouldMigrateCompanion
      ? buildCompanionTunedNotes('C', rootOctave).map((note, i) => ({
          ...note,
          color: normaliseColor(savedCompanion[i]?.color, 15 + i)
        }))
      : normaliseCompanionNotes(savedCompanion, key, rootOctave);
    return {
      ...instrument,
      count,
      key,
      scaleType,
      rootOctave,
      referencePitch,
      highDrumEnabled: count === 15 && (instrument.highDrumEnabled === undefined ? true : Boolean(instrument.highDrumEnabled)),
      highDrumAlwaysVisible: count === 15
        && (instrument.highDrumEnabled === undefined ? true : Boolean(instrument.highDrumEnabled))
        && Boolean(instrument.highDrumAlwaysVisible),
      companionNotes: count === 15 ? companionNotes : [],
      name: instrument.name || `${count}-note ${scaleType === 'custom' ? 'custom tuning' : `${key} ${SCALE_NAMES[scaleType]}`} drum`,
      notes: instrument.notes.slice(0, count).map((note, i) => ({
        label: String(note.label || i + 1),
        midi: Number(note.midi) || 60,
        color: normaliseColor(note.color, i)
      }))
    };
  }

  function normaliseSong(song, fallbackScale = 'any') {
    const scaleType = ['major', 'major-pentatonic', 'minor-pentatonic', 'any'].includes(song?.scaleType)
      ? song.scaleType
      : fallbackScale;
    const folder = song?.folder === 'community'
      ? 'community'
      : song?.builtIn
        ? 'demo'
        : 'library';
    return { ...song, scaleType, folder };
  }

  function isBundledScalePractice(song) {
    const title = String(song?.title || '').trim().toLocaleLowerCase();
    return title === '15-note scale practice' || title === 'note scale practice';
  }

  function loadData() {
    try {
      const hidden = JSON.parse(localStorage.getItem(STORAGE_HIDDEN_DEMOS) || '[]');
      state.hiddenDemoIds = new Set(Array.isArray(hidden) ? hidden.map(String) : []);
    } catch {
      state.hiddenDemoIds = new Set();
    }
    try {
      const customSongs = JSON.parse(localStorage.getItem(STORAGE_SONGS) || '[]');
      state.songs = [
        ...curatedSongs.filter(song => !state.hiddenDemoIds.has(song.id)).map(song => normaliseSong(song, 'major')),
        ...customSongs
          .filter(song => !curatedSongs.some(preset => preset.id === song.id))
          .filter(song => !isBundledScalePractice(song))
          .map(song => normaliseSong(song, 'any'))
      ];
    } catch {
      state.songs = curatedSongs.filter(song => !state.hiddenDemoIds.has(song.id)).map(song => normaliseSong(song, 'major'));
    }
    try {
      const instrument = JSON.parse(localStorage.getItem(STORAGE_INSTRUMENT) || 'null');
      state.instrument = normaliseInstrument(instrument);
    } catch {
      state.instrument = makeDefaultInstrument(15);
    }
    const savedView = localStorage.getItem(STORAGE_VIEW);
    state.visualMode = savedView === 'lanes' ? 'lanes' : 'radial';
    state.showPitchNames = localStorage.getItem(STORAGE_EDITOR_PITCH_NAMES) === 'true';
    state.expressiveTimingEnabled = localStorage.getItem(STORAGE_EDITOR_EXPRESSIVE_TIMING) === 'true';
    state.selectedId = state.songs[0]?.id || null;
  }

  function saveCustomSongs() {
    const customSongs = state.songs.filter(s => !s.builtIn);
    localStorage.setItem(STORAGE_SONGS, JSON.stringify(customSongs));
  }

  function saveHiddenDemos() {
    localStorage.setItem(STORAGE_HIDDEN_DEMOS, JSON.stringify([...state.hiddenDemoIds]));
  }

  function saveInstrument() {
    localStorage.setItem(STORAGE_INSTRUMENT, JSON.stringify(state.instrument));
  }

  function selectedSong() {
    return state.songs.find(s => s.id === state.selectedId) || state.songs[0];
  }

  function timedTokenParts(token) {
    const value = String(token || '').trim();
    if (!value || value === '|') return { core: value, durationBeats: 0, valid: value === '|' };
    const match = value.match(/^(.*?)(?::([0-9]+(?:\.[0-9]+)?))?$/u);
    if (!match || !match[1] || match[1].includes(':')) return { core: value, durationBeats: 1, valid: false };
    const durationBeats = match[2] === undefined ? 1 : Number(match[2]);
    return {
      core: match[1],
      durationBeats,
      valid: Number.isFinite(durationBeats) && durationBeats >= 0.125 && durationBeats <= 16
    };
  }

  function durationText(value) {
    return Number(value).toFixed(3).replace(/\.?0+$/, '');
  }

  function makeTimedToken(core, durationBeats = 1) {
    const duration = Number(durationBeats);
    return Math.abs(duration - 1) < 0.0001 ? core : `${core}:${durationText(duration)}`;
  }

  function timelineFromStoredSequence(sequence) {
    return sequenceInputItems(sequence).map(item => {
      if (item.core === '|') return { core: '|', durationBeats: 0, lyric: '' };
      const timed = timedTokenParts(item.core);
      return {
        core: timed.core,
        durationBeats: item.durationOverride ?? (timed.valid ? timed.durationBeats : 1),
        lyric: ''
      };
    });
  }

  function cleanSequenceFromTimeline(timeline = state.editorTimeline) {
    return timeline.map(item => item.core).join(' ');
  }

  // The note box accepts two readable Jianpu keyboard shortcuts. They belong to the
  // timing of the note immediately before them; they are never notes themselves.
  function sequenceInputItems(value = els.sequenceInput?.value || '') {
    return String(value).trim().split(/\s+/).filter(Boolean).map(raw => {
      if (raw === '|') return { raw, core: '|', durationOverride: 0 };
      let core = raw;
      let durationOverride = null;
      const shorthand = core.match(/([_=])$/u);
      if (shorthand) {
        core = core.slice(0, -1);
        durationOverride = shorthand[1] === '=' ? 0.25 : 0.5;
      }
      return { raw, core, durationOverride };
    });
  }

  function syncEditorTimelineFromCleanInput() {
    const inputItems = sequenceInputItems();
    const cores = inputItems.map(item => item.core);
    const previous = state.editorTimeline;

    // Rhythm is separate from pitch. If the user changes a number or octave mark while
    // keeping the same number of sequence tokens, preserve the existing Jianpu duration
    // at that position. Previously a pitch edit made the changed region look like brand
    // new notes, which reset Quick / Very quick underlines back to Regular.
    const sameShape = cores.length === previous.length;

    let prefix = 0;
    while (prefix < cores.length && prefix < previous.length && cores[prefix] === previous[prefix].core) prefix += 1;
    let suffix = 0;
    while (suffix < cores.length - prefix && suffix < previous.length - prefix
      && cores[cores.length - 1 - suffix] === previous[previous.length - 1 - suffix].core) suffix += 1;

    state.editorTimeline = cores.map((core, index) => {
      if (core === '|') return { core, durationBeats: 0, lyric: '' };
      const explicitDuration = inputItems[index].durationOverride;

      // A one-for-one pitch replacement keeps the rhythm and lyric attached to the same
      // musical position. Do not inherit from a bar line because bars have duration 0.
      if (sameShape && previous[index] && previous[index].core !== '|') return {
        core,
        durationBeats: explicitDuration ?? previous[index].durationBeats,
        lyric: previous[index].lyric || ''
      };

      if (index < prefix) return {
        core,
        durationBeats: explicitDuration ?? previous[index].durationBeats,
        lyric: previous[index].lyric || ''
      };
      if (index >= cores.length - suffix) {
        const previousIndex = previous.length - (cores.length - index);
        return {
          core,
          durationBeats: explicitDuration ?? previous[previousIndex].durationBeats,
          lyric: previous[previousIndex].lyric || ''
        };
      }
      return { core, durationBeats: explicitDuration ?? 1, lyric: '' };
    });
    if (state.editorTimingSelectionIndex >= state.editorTimeline.length
      || state.editorTimeline[state.editorTimingSelectionIndex]?.core === '|') {
      setTimingSelection(timingSelectionIndices(), null);
    }
  }

  function editorSequenceWithDurations() {
    syncEditorTimelineFromCleanInput();
    return state.editorTimeline.map(item => item.core === '|'
      ? '|'
      : makeTimedToken(item.core, item.durationBeats)).join(' ');
  }

  function timingWord(durationBeats) {
    const duration = Number(durationBeats);
    if (duration <= 0.375) return 'Very quick';
    if (duration <= 0.75) return 'Quick';
    if (duration <= 1.25) return 'Regular';
    if (duration <= 2.5) return 'Half note';
    return 'Whole note';
  }

  function timingDescription(durationBeats) {
    const word = timingWord(durationBeats);
    if (word === 'Very quick') return 'four notes fit into one regular beat';
    if (word === 'Quick') return 'two notes fit into one regular beat';
    if (word === 'Regular') return 'one note fills one regular beat';
    if (word === 'Half note') return 'the note lasts for two regular beats';
    return 'the note is held for four normal beats';
  }

  function jianpuBeamCount(durationBeats) {
    const duration = Number(durationBeats);
    if (duration <= 0.375) return 2;
    if (duration <= 0.75) return 1;
    return 0;
  }


  // Mirrors the textarea's text into the backdrop layer, swapping each combining octave
  // mark for a span that draws its own dot clear of the digit. Combining marks take no
  // horizontal space, so removing them leaves the two layers perfectly in step.
  // Mirrors the textarea into the backdrop layer: octave marks become drawn dots, and
  // each note carries the length mark the timing sheet gave it. Whitespace-separated
  // tokens line up 1:1 with state.editorTimeline, which is how the marks find their note.
  function renderSequenceBackdrop() {
    if (!els.sequenceBackdrop || !els.sequenceInput) return;
    const text = els.sequenceInput.value;
    const timeline = state.editorTimeline || [];
    let html = '';
    let tokenIndex = -1;
    let inToken = false;
    let previousTokenEnd = 0;
    let i = 0;
    while (i < text.length) {
      const character = text[i];
      if (/\s/.test(character)) {
        if (inToken) { html += '</span>'; inToken = false; }
        html += escapeHtml(character);
        i += 1;
        continue;
      }
      if (!inToken) {
        tokenIndex += 1;
        const item = timeline[tokenIndex];
        let tokenEnd = i;
        while (tokenEnd < text.length && !/\s/.test(text[tokenEnd])) tokenEnd += 1;
        let nextStart = tokenEnd;
        while (nextStart < text.length && /\s/.test(text[nextStart])) nextStart += 1;
        const beams = item && item.core !== '|' ? jianpuBeamCount(item.durationBeats) : 0;
        const previous = timeline[tokenIndex - 1];
        const next = timeline[tokenIndex + 1];
        const previousBeams = previous?.core !== '|' ? jianpuBeamCount(previous?.durationBeats) : 0;
        const nextBeams = next?.core !== '|' ? jianpuBeamCount(next?.durationBeats) : 0;
        const canJoinLeft = beams > 0 && previousBeams > 0 && !text.slice(previousTokenEnd, i).includes('\n');
        const canJoinRight = beams > 0 && nextBeams > 0 && nextStart < text.length && !text.slice(tokenEnd, nextStart).includes('\n');
        const classes = ['seq-token'];
        if (canJoinLeft && previousBeams >= 1) classes.push('join-l1-left');
        if (canJoinRight && nextBeams >= 1) classes.push('join-l1-right');
        if (beams >= 2 && canJoinLeft && previousBeams >= 2) classes.push('join-l2-left');
        if (beams >= 2 && canJoinRight && nextBeams >= 2) classes.push('join-l2-right');
        html += `<span class="${classes.join(' ')}" data-sequence-start="${i}" data-sequence-end="${tokenEnd}"${beams ? ` data-beams="${beams}"` : ''}>`;
        inToken = true;
        previousTokenEnd = tokenEnd;
      }
      let up = 0;
      let down = 0;
      let j = i + 1;
      while (j < text.length) {
        if (text[j] === DOT_ABOVE) { up += 1; j += 1; continue; }
        if (text[j] === DOT_BELOW) { down += 1; j += 1; continue; }
        break;
      }
      if (up || down) {
        const classes = ['seq-oct', up ? 'up' : 'down'];
        if (up > 1 || down > 1) classes.push('double');
        html += `<span class="${classes.join(' ')}">${escapeHtml(character)}</span>`;
      } else {
        html += escapeHtml(character);
      }
      i = j;
    }
    if (inToken) html += '</span>';
    // A trailing newline collapses in a div, which would knock the last line out of sync.
    els.sequenceBackdrop.innerHTML = `${html}\n`;
    els.sequenceBackdrop.scrollTop = els.sequenceInput.scrollTop;
    els.sequenceBackdrop.scrollLeft = els.sequenceInput.scrollLeft;
  }

  // The visible Jianpu layer and the native textarea can wrap a few pixels apart on
  // mobile browsers. Map a tap against the visible tokens so the caret lands where the
  // person tapped, including directly after the final note.
  function placeSequenceCaretFromBackdropPoint(event) {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    if (event.clientX === 0 && event.clientY === 0) return;
    const input = els.sequenceInput;
    const tokens = Array.from(els.sequenceBackdrop?.querySelectorAll('.seq-token[data-sequence-start]') || [])
      .map(element => ({
        element,
        start: Number(element.dataset.sequenceStart),
        end: Number(element.dataset.sequenceEnd),
        rect: element.getBoundingClientRect()
      }))
      .filter(token => Number.isFinite(token.start) && Number.isFinite(token.end) && token.rect.width > 0);
    if (!tokens.length) return;

    const lineHeight = Number.parseFloat(getComputedStyle(input).lineHeight) || 48;
    const firstTop = Math.min(...tokens.map(token => token.rect.top));
    const lastBottom = Math.max(...tokens.map(token => token.rect.bottom));
    let caret = null;
    if (event.clientY < firstTop - lineHeight * .35) caret = 0;
    if (event.clientY > lastBottom + lineHeight * .35) caret = input.value.length;

    if (caret === null) {
      const closest = tokens.reduce((best, token) => {
        const distance = Math.abs(event.clientY - (token.rect.top + token.rect.height / 2));
        return !best || distance < best.distance ? { token, distance } : best;
      }, null);
      const lineCentre = closest.token.rect.top + closest.token.rect.height / 2;
      const lineTokens = tokens
        .filter(token => Math.abs((token.rect.top + token.rect.height / 2) - lineCentre) < lineHeight * .42)
        .sort((left, right) => left.rect.left - right.rect.left);
      const first = lineTokens[0];
      const last = lineTokens[lineTokens.length - 1];
      if (event.clientX <= first.rect.left) {
        caret = first.start;
      } else if (event.clientX >= last.rect.right) {
        caret = last.end;
      } else {
        for (let index = 0; index < lineTokens.length; index += 1) {
          const token = lineTokens[index];
          if (event.clientX <= token.rect.right) {
            caret = event.clientX < token.rect.left + token.rect.width / 2 ? token.start : token.end;
            break;
          }
          const next = lineTokens[index + 1];
          if (next && event.clientX < next.rect.left) {
            caret = event.clientX < (token.rect.right + next.rect.left) / 2 ? token.end : next.start;
            break;
          }
        }
      }
    }

    if (caret === null) return;
    const placeCaret = () => {
      input.setSelectionRange(caret, caret);
      state.editorSelectionStart = caret;
      state.editorSelectionEnd = caret;
    };
    placeCaret();
    requestAnimationFrame(placeCaret);
  }

  function createJianpuDigit(label, className = 'jianpu-digit') {
    const octave = splitOctaveMark(label);
    const digit = document.createElement('span');
    const markClass = octaveMarkClass(octave);
    digit.className = `${className}${markClass ? ` ${markClass}` : ''}`;
    digit.textContent = octave.base;
    return digit;
  }

  function createTimingValueContent(core) {
    if (isRestCore(core)) {
      const rest = document.createElement('strong');
      rest.textContent = '0';
      return rest;
    }
    const parts = String(core).split('+').map(v => v.trim()).filter(Boolean);
    if (parts.length <= 1) {
      const number = document.createElement('strong');
      number.appendChild(createJianpuDigit(parts[0] || core));
      return number;
    }
    const chord = document.createElement('strong');
    chord.className = 'jianpu-chord-stack';
    parts.forEach(part => {
      const line = document.createElement('span');
      line.className = 'jianpu-chord-line';
      line.appendChild(createJianpuDigit(part));
      chord.appendChild(line);
    });
    return chord;
  }


  function coreHasLowerOctave(core) {
    if (!core || isRestCore(core)) return false;
    return String(core).split('+').some(part => splitOctaveMark(part.trim()).mark === 'down');
  }

  // Timing selection is a set so a run of notes can be re-timed in one go. The anchor is
  // the last plainly-clicked token, which is what shift+click measures its range from.
  function timingSelectionIndices() {
    return Array.isArray(state.editorTimingSelection) ? state.editorTimingSelection : [];
  }

  function isTimingSelectable(index) {
    const item = state.editorTimeline[index];
    return Boolean(item) && item.core !== '|';
  }

  function setTimingSelection(indices, anchor = null) {
    const clean = [...new Set(indices)]
      .filter(index => Number.isInteger(index) && isTimingSelectable(index))
      .sort((a, b) => a - b);
    state.editorTimingSelection = clean;
    state.editorTimingSelectionIndex = anchor !== null && clean.includes(anchor)
      ? anchor
      : (clean.length ? clean[clean.length - 1] : -1);
  }

  function clearTimingSelection() {
    state.editorTimingSelection = [];
    state.editorTimingSelectionIndex = -1;
    state.editorRangeSelectArmed = false;
  }

  // Builds the numbered sheet into any container. The print path uses this too, so a
  // PDF never depends on what the on-screen editor happens to be showing.
  function buildSheetInto(target, { interactive = true } = {}) {
    target.innerHTML = '';
    const selectedIndices = interactive ? new Set(timingSelectionIndices()) : new Set();
    const notesByLabel = new Map(playableNotes().map(note => [String(note.label), note]));
    const measures = [[]];
    let beatPosition = 0;

    state.editorTimeline.forEach((item, index) => {
      if (item.core === '|') {
        if (measures[measures.length - 1].length) measures.push([]);
        beatPosition = 0;
        return;
      }
      const duration = Math.max(0.25, Math.min(4, Number(item.durationBeats) || 1));
      measures[measures.length - 1].push({ item, index, duration, startBeat: beatPosition });
      beatPosition += duration;
    });
    while (measures.length > 1 && !measures[measures.length - 1].length) measures.pop();

    const measuresPerRow = 2;
    const consecutive = (a, b) => Math.abs((a.startBeat + a.duration) - b.startBeat) < 0.001;

    for (let rowStart = 0; rowStart < measures.length; rowStart += measuresPerRow) {
      const row = document.createElement('div');
      row.className = 'timing-sheet-row';
      measures.slice(rowStart, rowStart + measuresPerRow).forEach((measure, measureOffset, rowMeasures) => {
        const measureEl = document.createElement('div');
        measureEl.className = 'timing-measure';
        if (measureOffset === rowMeasures.length - 1) measureEl.classList.add('last-in-row');

        measure.forEach((entry, measureIndex) => {
          const { item, index, duration } = entry;
          const button = document.createElement('button');
          button.type = 'button';
          const isSelected = selectedIndices.has(index);
          button.className = `timing-token${isRestCore(item.core) ? ' is-rest' : ''}${isSelected ? ' selected' : ''}${index === state.editorTimingSelectionIndex && selectedIndices.size > 1 ? ' is-anchor' : ''}`;
          button.dataset.timelineIndex = String(index);
          button.dataset.timingWord = timingWord(duration).toLowerCase().replace(/\s+/g, '-');
          button.setAttribute('aria-pressed', String(isSelected));
          if (coreHasLowerOctave(item.core)) button.classList.add('has-lower-octave');
          if (String(item.core).includes('+')) button.classList.add('is-chord');

          const firstLabel = item.core.split('+')[0];
          const note = notesByLabel.get(firstLabel);
          if (note) setNoteColorVars(button, note.color || defaultNoteColor(note.noteIndex));

          const valueRow = document.createElement('span');
          valueRow.className = 'jianpu-value-row';
          valueRow.appendChild(createTimingValueContent(item.core));

          const extensionCount = duration >= 3.5 ? 3 : duration >= 1.5 ? 1 : 0;
          if (extensionCount) {
            const extensions = document.createElement('span');
            const rest = isRestCore(item.core);
            extensions.className = rest ? 'jianpu-rest-repeats' : 'jianpu-extensions';
            extensions.setAttribute('aria-hidden', 'true');
            for (let extension = 0; extension < extensionCount; extension++) {
              const extensionMark = document.createElement('i');
              if (rest) extensionMark.textContent = '0';
              extensions.appendChild(extensionMark);
            }
            valueRow.appendChild(extensions);
          }
          button.appendChild(valueRow);

          const beamCount = jianpuBeamCount(duration);
          if (beamCount) {
            const beams = document.createElement('span');
            beams.className = 'jianpu-beams';
            beams.setAttribute('aria-hidden', 'true');
            const previous = measure[measureIndex - 1];
            const next = measure[measureIndex + 1];
            for (let level = 1; level <= beamCount; level++) {
              const beam = document.createElement('i');
              beam.className = `jianpu-beam level-${level}`;
              const previousBeamCount = previous ? jianpuBeamCount(previous.duration) : 0;
              const nextBeamCount = next ? jianpuBeamCount(next.duration) : 0;
              // Join each underline level independently. Quick beside Very quick shares
              // the first underline; the second underline only joins when both have it.
              const joinsLeft = previous
                && previousBeamCount >= level
                && consecutive(previous, entry);
              const joinsRight = next
                && nextBeamCount >= level
                && consecutive(entry, next);
              beam.classList.toggle('joins-left', Boolean(joinsLeft));
              beam.classList.toggle('joins-right', Boolean(joinsRight));
              beams.appendChild(beam);
            }
            button.appendChild(beams);
          } else {
            const spacer = document.createElement('span');
            spacer.className = 'jianpu-beam-spacer';
            spacer.setAttribute('aria-hidden', 'true');
            button.appendChild(spacer);
          }

          if (interactive && item.core !== '|') {
            const lyric = document.createElement('input');
            lyric.className = 'timing-lyric';
            lyric.type = 'text';
            lyric.maxLength = 12;
            lyric.value = item.lyric || '';
            lyric.dataset.timelineIndex = String(index);
            lyric.placeholder = '+ lyrics';
            lyric.title = 'Add a lyric for this note';
            lyric.setAttribute('aria-label', `Lyric under note ${item.core}`);
            button.appendChild(lyric);
          }

          const timingLabel = timingWord(duration);
          button.title = `${isRestCore(item.core) ? 'Rest' : `Note ${item.core}`}: ${timingLabel} (${timingDescription(duration)})`;
          button.setAttribute('aria-label', `${isRestCore(item.core) ? 'Rest' : `Note ${item.core}`}, ${timingLabel}; ${timingDescription(duration)}`);
          measureEl.appendChild(button);
        });

        if (!measure.length) {
          const empty = document.createElement('span');
          empty.className = 'timing-empty-measure';
          empty.setAttribute('aria-hidden', 'true');
          measureEl.appendChild(empty);
        }
        row.appendChild(measureEl);
      });
      target.appendChild(row);
    }
    return target.children.length > 0;
  }

  function renderTimingEditor() {
    if (!els.timingEditor || !els.timingTokenStrip) return;
    const enabled = Boolean(state.expressiveTimingEnabled);
    const workspace = els.sequenceInput?.closest('.sequence-workspace');
    els.expressiveTimingToggle.checked = enabled;
    els.timingEditor.hidden = !enabled;
    workspace?.classList.toggle('timing-visible', enabled);
    if (!enabled) return;

    buildSheetInto(els.timingTokenStrip);

    const chosen = timingSelectionIndices().map(index => state.editorTimeline[index]).filter(Boolean);
    const choiceButtons = Array.from(els.timingChoiceGroup?.querySelectorAll('[data-duration]') || []);
    choiceButtons.forEach(button => {
      button.disabled = !chosen.length;
      const word = button.textContent.trim();
      button.classList.toggle('active', chosen.length > 0
        && chosen.every(item => timingWord(item.durationBeats) === word));
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
    if (els.timingRangeBtn) {
      const hasAnchor = state.editorTimingSelectionIndex >= 0;
      els.timingRangeBtn.disabled = !hasAnchor;
      els.timingRangeBtn.classList.toggle('active', Boolean(state.editorRangeSelectArmed));
      els.timingRangeBtn.setAttribute('aria-pressed', String(Boolean(state.editorRangeSelectArmed)));
      els.timingRangeBtn.textContent = state.editorRangeSelectArmed ? 'Tap last note' : '↔ Select range';
    }
    if (chosen.length > 1) {
      const words = new Set(chosen.map(item => timingWord(item.durationBeats).toLowerCase()));
      els.selectedTimingLabel.textContent = words.size === 1
        ? `${chosen.length} notes selected, all ${[...words][0]}. Pick a rhythm to change them together.`
        : `${chosen.length} notes selected. Pick a rhythm to apply it to all of them.`;
    } else if (chosen.length === 1) {
      const only = chosen[0];
      els.selectedTimingLabel.textContent = state.editorRangeSelectArmed
        ? `Now tap the last note in the range. Everything between the two notes will be selected.`
        : `${isRestCore(only.core) ? 'Rest' : `Note ${only.core}`} is ${timingWord(only.durationBeats).toLowerCase()}: ${timingDescription(only.durationBeats)}. Tap Select range, then tap the last note. On desktop, Shift-click also works.`;
    } else {
      els.selectedTimingLabel.textContent = 'Tap a number to select it. To select several notes on mobile, tap the first note, choose Select range, then tap the last note. One underline means quick; two mean very quick.';
    }
  }

  function setExpressiveTimingEnabled(enabled) {
    state.expressiveTimingEnabled = Boolean(enabled);
    clearTimingSelection();
    localStorage.setItem(STORAGE_EDITOR_EXPRESSIVE_TIMING, String(state.expressiveTimingEnabled));
    syncEditorTimelineFromCleanInput();
    renderTimingEditor();
  }

  function sequenceStats(sequence) {
    const raw = String(sequence || '').trim().split(/\s+/).filter(Boolean);
    let beats = 0;
    let noteCount = 0;
    let chordCount = 0;
    let playableTokenCount = 0;
    const invalidTokens = [];
    raw.forEach(token => {
      if (token === '|') return;
      const timed = timedTokenParts(token);
      if (!timed.valid || (!timed.core && !isRestCore(timed.core))) {
        invalidTokens.push(token);
        return;
      }
      beats += timed.durationBeats;
      if (isRestCore(timed.core)) return;
      const chordLabels = timed.core.split('+').map(value => value.trim()).filter(Boolean);
      if (!chordLabels.length) {
        invalidTokens.push(token);
        return;
      }
      playableTokenCount += 1;
      noteCount += chordLabels.length;
      if (chordLabels.length > 1) chordCount += 1;
    });
    return { beats, noteCount, chordCount, playableTokenCount, invalidTokens };
  }

  function parseSequence(sequence, bpm) {
    const secondsPerBeat = 60 / Math.max(30, Number(bpm) || 72);
    const raw = String(sequence || '').trim().split(/\s+/).filter(Boolean);
    const notes = [];
    const invalidTokens = [];
    const playableByLabel = new Map(playableNotes().map(note => [String(note.label).toLowerCase(), note]));
    let beat = 0;
    let bar = 1;

    raw.forEach(token => {
      if (token === '|') {
        bar += 1;
        return;
      }
      const timed = timedTokenParts(token);
      if (!timed.valid) {
        invalidTokens.push(token);
        return;
      }
      if (isRestCore(timed.core)) {
        beat += timed.durationBeats;
        return;
      }
      const chordLabels = timed.core.split('+').map(v => v.trim()).filter(Boolean);
      if (!chordLabels.length) invalidTokens.push(token);
      chordLabels.forEach(label => {
        const playable = playableByLabel.get(label.toLowerCase());
        if (playable) {
          notes.push({
            id: `${beat}-${playable.noteIndex}-${notes.length}`,
            label,
            noteIndex: playable.noteIndex,
            time: beat * secondsPerBeat,
            duration: timed.durationBeats * secondsPerBeat,
            durationBeats: timed.durationBeats,
            beat,
            bar
          });
        }
      });
      beat += timed.durationBeats;
    });

    return { notes, duration: Math.max(beat * secondsPerBeat, secondsPerBeat), totalBeats: beat, secondsPerBeat, invalidTokens };
  }

  function songTitleParts(title) {
    const fullTitle = String(title || '').trim();
    const match = fullTitle.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
    if (!match || !match[1].trim() || !match[2].trim()) {
      return { fullTitle, displayTitle: fullTitle, collection: '' };
    }
    return {
      fullTitle,
      displayTitle: match[1].trim(),
      collection: match[2].trim()
    };
  }

  function isCommunitySong(song) {
    return song?.folder === 'community';
  }

  function isDemoSong(song) {
    return !isCommunitySong(song) && (song?.builtIn || song?.folder === 'demo');
  }

  function songFolderInfo(song, title = songTitleParts(song?.title)) {
    if (isDemoSong(song)) return { key: 'folder:demo', label: 'Demo songs', order: 0 };
    if (isCommunitySong(song)) return { key: 'folder:community', label: 'Community gallery', order: 1 };
    const collection = title.collection.trim();
    return {
      key: collection
        ? `folder:library:${collection.toLocaleLowerCase().replace(/\s+/g, ' ')}`
        : 'folder:library',
      label: collection || 'My songs',
      order: 2
    };
  }

  function songMetrics(song) {
    const stats = sequenceStats(song?.sequence || '');
    const bpm = Math.max(30, Number(song?.bpm) || 72);
    return {
      bpm,
      beats: stats.beats,
      noteCount: stats.noteCount,
      chordCount: stats.chordCount,
      durationSeconds: stats.beats * 60 / bpm,
      chordRatio: stats.playableTokenCount ? stats.chordCount / stats.playableTokenCount : 0
    };
  }

  function songDifficulty(song) {
    const metrics = songMetrics(song);
    let score = 0;
    score += metrics.bpm >= 180 ? 3 : metrics.bpm >= 140 ? 2 : metrics.bpm >= 105 ? 1 : 0;
    score += metrics.durationSeconds >= 300 ? 3 : metrics.durationSeconds >= 180 ? 2 : metrics.durationSeconds >= 90 ? 1 : 0;
    score += metrics.noteCount >= 300 ? 2 : metrics.noteCount >= 150 ? 1 : 0;
    if (metrics.chordRatio >= 0.12) score += 1;

    let level = 'easy';
    if (metrics.bpm >= 210 || score >= 6) level = 'expert';
    else if (metrics.bpm >= 175 || metrics.durationSeconds >= 240 || score >= 4) level = 'hard';
    else if (score >= 2) level = 'medium';

    return {
      level,
      label: level[0].toUpperCase() + level.slice(1),
      metrics
    };
  }

  function selectSong(id) {
    stopPlayback(false);
    state.selectedId = id;
    state.currentTime = 0;
    state.pausedAt = 0;
    state.score = 0;
    state.attempts = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.hitNotes.clear();
    state.missedNoteIds.clear();
    state.lastResultMissed = [];
    state.loopA = null;
    state.loopB = null;
    state.sectionLoop = false;
    if (els.resultDialog?.open) els.resultDialog.close();
    state.waitingIndex = 0;
    const song = selectedSong();
    if (!song) return;
    const parsed = parseSequence(song.sequence, song.bpm);
    state.parsedNotes = parsed.notes;
    state.duration = parsed.duration;
    state.secondsPerBeat = parsed.secondsPerBeat;
    state.totalBeats = parsed.totalBeats;
    const title = songTitleParts(song.title);
    const folder = songFolderInfo(song, title);
    const difficulty = songDifficulty(song);
    els.currentTitle.textContent = title.displayTitle;
    if (els.currentCollection) {
      els.currentCollection.textContent = folder.label;
      els.currentCollection.hidden = false;
    }
    if (els.currentDifficulty) {
      els.currentDifficulty.textContent = `${difficulty.label} difficulty`;
      els.currentDifficulty.dataset.level = difficulty.level;
    }
    els.tempoLabel.textContent = `${song.bpm} BPM`;
    els.durationLabel.textContent = formatTime(state.duration);
    els.progress.value = 0;
    renderSongList();
    updateTransportUI();
    updateABLoopUI();
    updatePracticeUI();
    renderFrame();
  }

  function renderSidebarSongItem(song, sourceLabel) {
    const title = songTitleParts(song.title);
    const difficulty = songDifficulty(song);
    const metrics = difficulty.metrics;
    const button = document.createElement('button');
    button.className = `song-item ${song.id === state.selectedId ? 'active' : ''}`;
    button.title = title.fullTitle;
    button.innerHTML = `
      <span class="song-item-title"><strong>${escapeHtml(title.displayTitle)}</strong><em class="difficulty-badge" data-level="${difficulty.level}">${difficulty.label}</em></span>
      <span>${song.bpm} BPM · ${metrics.noteCount} notes${sourceLabel ? ` · ${escapeHtml(sourceLabel)}` : ''}</span>`;
    button.addEventListener('click', () => {
      selectSong(song.id);
      els.sidebar.classList.remove('open');
    });
    return button;
  }

  function renderSongList() {
    const q = els.songSearch.value.trim().toLowerCase();
    els.songList.innerHTML = '';
    if (els.restoreDemosBtn) els.restoreDemosBtn.hidden = state.hiddenDemoIds.size === 0;
    const matchesSearch = song => {
      const title = songTitleParts(song.title);
      return `${title.fullTitle} ${title.displayTitle} ${title.collection}`.toLowerCase().includes(q);
    };

    const demos = state.songs.filter(isDemoSong).filter(matchesSearch);
    const demoGroup = document.createElement('section');
    demoGroup.className = 'song-group catalogue-collection demo-collection';
    const demoHeading = document.createElement('div');
    demoHeading.className = 'song-group-heading static-heading';
    demoHeading.innerHTML = `<span>Demo songs</span><small>${demos.length}</small>`;
    demoGroup.appendChild(demoHeading);
    const demoItems = document.createElement('div');
    demoItems.className = 'song-group-items';
    demos.forEach(song => demoItems.appendChild(renderSidebarSongItem(song, 'Demo')));
    if (!demos.length) {
      const empty = document.createElement('p');
      empty.className = 'community-empty';
      empty.textContent = q ? 'No demo songs match that search.' : 'No demo songs are available.';
      demoItems.appendChild(empty);
    }
    demoGroup.appendChild(demoItems);
    els.songList.appendChild(demoGroup);

    const mine = personalSongs().filter(matchesSearch);
    const myGroup = document.createElement('section');
    myGroup.className = 'song-group catalogue-collection personal-collection';
    const myHeading = document.createElement('div');
    myHeading.className = 'song-group-heading static-heading';
    myHeading.innerHTML = `<span>My songs</span><small>${mine.length}</small>`;
    myGroup.appendChild(myHeading);
    const myItems = document.createElement('div');
    myItems.className = 'song-group-items';
    mine.forEach(song => {
      const title = songTitleParts(song.title);
      myItems.appendChild(renderSidebarSongItem(song, title.collection || 'My song'));
    });
    if (!mine.length) {
      const empty = document.createElement('p');
      empty.className = 'community-empty';
      empty.textContent = q ? 'No My songs match that search.' : 'Create or import a song and it will appear here.';
      myItems.appendChild(empty);
    }
    myGroup.appendChild(myItems);
    els.songList.appendChild(myGroup);
    updateLibraryCounts();
  }

  function personalSongs() { return state.songs.filter(song => !song.builtIn && !isCommunitySong(song)); }
  function communitySongs() { return state.songs.filter(isCommunitySong); }

  function updateLibraryCounts() {
    const community = communitySongs();
    const counts = { easy:0, medium:0, hard:0, expert:0 };
    community.forEach(song => {
      const level = songDifficulty(song).level;
      if (Object.prototype.hasOwnProperty.call(counts, level)) counts[level] += 1;
    });
    if (els.libraryCountBadge) els.libraryCountBadge.textContent = String(community.length);
    if (els.communitySongsCount) els.communitySongsCount.textContent = String(community.length);
    if (els.communityEasyCount) els.communityEasyCount.textContent = String(counts.easy);
    if (els.communityMediumCount) els.communityMediumCount.textContent = String(counts.medium);
    if (els.communityHardCount) els.communityHardCount.textContent = String(counts.hard);
    if (els.communityExpertCount) els.communityExpertCount.textContent = String(counts.expert);
  }

  function stableSongHash(song) {
    const value = String(song?.id || song?.title || 'song');
    let hash = 2166136261;
    for (let i=0;i<value.length;i+=1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash,16777619); }
    return hash >>> 0;
  }

  function songCoverMarkup(song) {
    const hash = stableSongHash(song), theme = hash % 8;
    const symbols = ['✦','☾','✿','♫','✧','☁','❋','♪'];
    const symbol = symbols[(hash >>> 3) % symbols.length];
    return `<span class="album-cover cover-theme-${theme}" aria-hidden="true"><i>${symbol}</i><b></b></span>`;
  }

  function normaliseDifficultyFilter(value) { return ['all','easy','medium','hard','expert'].includes(value) ? value : 'all'; }

  function renderSongLibrary() {
    if (!els.libraryGrid) return;
    updateLibraryCounts();
    const tab = normaliseDifficultyFilter(state.libraryTab);
    const q = String(els.librarySearch?.value || '').trim().toLowerCase();
    const songs = communitySongs().filter(song => {
      const title = songTitleParts(song.title), difficulty = songDifficulty(song);
      return (tab === 'all' || difficulty.level === tab) && `${title.fullTitle} ${title.displayTitle} ${title.collection}`.toLowerCase().includes(q);
    });
    const tabMap = { all:els.libraryTabAll, easy:els.libraryTabEasy, medium:els.libraryTabMedium, hard:els.libraryTabHard, expert:els.libraryTabExpert };
    Object.entries(tabMap).forEach(([key,button]) => { button?.classList.toggle('active',key===tab); button?.setAttribute('aria-selected',String(key===tab)); });
    if (els.libraryCommunityBanner) els.libraryCommunityBanner.hidden = false;
    els.libraryGrid.innerHTML = '';
    songs.forEach(song => {
      const title = songTitleParts(song.title), difficulty = songDifficulty(song), metrics = difficulty.metrics;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `album-card ${song.id === state.selectedId ? 'selected' : ''}`;
      card.innerHTML = `${songCoverMarkup(song)}<span class="album-copy"><span class="album-title-row"><strong>${escapeHtml(title.displayTitle)}</strong><em class="difficulty-badge" data-level="${difficulty.level}">${difficulty.label}</em></span><small>${song.bpm} BPM · ${metrics.noteCount} notes</small><span class="album-source">${escapeHtml(title.collection || 'Community gallery')}</span></span>`;
      card.addEventListener('click', () => { selectSong(song.id); els.songLibraryDialog?.close(); els.sidebar.classList.remove('open'); });
      els.libraryGrid.appendChild(card);
    });
    if (els.libraryEmpty) {
      els.libraryEmpty.hidden = songs.length > 0;
      if (!songs.length) {
        if (q) els.libraryEmpty.innerHTML = '<strong>No matches</strong><span>Try another song name or difficulty.</span>';
        else if (tab !== 'all') { const label = tab[0].toUpperCase()+tab.slice(1); els.libraryEmpty.innerHTML = `<strong>No ${label} community songs yet</strong><span>Try another difficulty or check back after more songs are approved.</span>`; }
        else els.libraryEmpty.innerHTML = '<strong>No approved community songs yet</strong><span>Approved files in community-songs appear after the starter indexes the folder. Keep START_TRAINER_Win.bat open while editing the local collection.</span>';
      }
    }
  }

  function setLibraryTab(tab) { state.libraryTab = normaliseDifficultyFilter(tab); renderSongLibrary(); }
  function openSongLibrary(tab='all') { if (!els.songLibraryDialog) return; state.libraryTab = normaliseDifficultyFilter(tab); if (els.librarySearch) els.librarySearch.value=''; renderSongLibrary(); els.songLibraryDialog.showModal(); }

  function instrumentDisplayName(instrument = state.instrument) {
    if (!instrument) return 'My Drum';
    const scaleName = instrument.scaleType === 'custom' ? 'Custom tuning' : `${instrument.key} ${SCALE_NAMES[instrument.scaleType]}`;
    return `${instrument.count}-note ${scaleName}`;
  }

  function renderMyDrumCompanion() {
    if (!els.myDrumCompanion || !els.myDrumCompanionPreview) return;
    const visible = highDrumEnabled();
    els.myDrumCompanion.hidden = !visible;
    els.myDrumCompanionPreview.innerHTML = '';
    if (!visible) return;
    highDrumNotes().forEach(note => {
      const pad = document.createElement('span');
      pad.className = 'my-companion-note';
      pad.style.setProperty('--slot-angle', `${note.slot * 45}deg`);
      setNoteColorVars(pad, note.color);
      const octave = splitOctaveMark(note.label);
      const markClass = octaveMarkClass(octave);
      pad.innerHTML = `<strong${markClass ? ` class="${markClass}"` : ''}>${escapeHtml(octave.base)}</strong><small>${escapeHtml(midiToName(note.midi))}</small>`;
      els.myDrumCompanionPreview.appendChild(pad);
    });
    const centre = document.createElement('span');
    centre.className = 'my-companion-centre';
    centre.textContent = 'HIGH';
    els.myDrumCompanionPreview.appendChild(centre);
  }

  function renderMyDrum() {
    if (!els.myDrumDialog || !state.instrument) return;
    const instrument = state.instrument;
    const scaleLabel = instrument.scaleType === 'custom' ? 'Custom tuning' : SCALE_NAMES[instrument.scaleType];
    els.myDrumTitle.textContent = instrumentDisplayName(instrument);
    els.myDrumBadges.innerHTML = `
      <span>${escapeHtml(instrument.key || 'Custom')} key</span>
      <span>${escapeHtml(scaleLabel)}</span>
      <span>${instrument.count} tongues</span>
      <span>${highDrumEnabled() ? 'Companion on' : 'Main drum only'}</span>`;
    els.myDrumNoteCount.textContent = `${instrument.count} tongues`;
    createDrum(els.myDrumPreview, false);
    els.myDrumNoteList.innerHTML = '';
    instrument.notes.forEach((note, index) => {
      const chip = document.createElement('div');
      chip.className = 'my-drum-note-chip';
      setNoteColorVars(chip, note.color || defaultNoteColor(index));
      const octave = splitOctaveMark(note.label);
      const markClass = octaveMarkClass(octave);
      chip.innerHTML = `<i aria-hidden="true"></i><strong${markClass ? ` class="${markClass}"` : ''}>${escapeHtml(octave.base)}</strong><span>${escapeHtml(midiToName(note.midi))}</span>`;
      els.myDrumNoteList.appendChild(chip);
    });
    renderMyDrumCompanion();
  }

  function openMyDrum() {
    renderMyDrum();
    els.myDrumDialog?.showModal();
  }

  function instrumentSettingsDocument() {
    return {
      format: INSTRUMENT_SETTINGS_FORMAT,
      exportedAt: new Date().toISOString(),
      instrument: state.instrument
    };
  }

  function exportInstrumentSettings() {
    if (!state.instrument) return;
    const payload = instrumentSettingsDocument();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(instrumentDisplayName(state.instrument))}.drumsettings`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Drum settings exported.', 'success');
  }

  async function importInstrumentSettings(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data?.format !== INSTRUMENT_SETTINGS_FORMAT || !data?.instrument || !Array.isArray(data.instrument.notes)) {
        throw new Error('Unsupported drum settings file');
      }
      state.instrument = normaliseInstrument(data.instrument);
      saveInstrument();
      renderInstrument();
      selectSong(state.selectedId);
      renderMyDrum();
      showToast('Drum settings restored.', 'success');
    } catch (error) {
      console.error(error);
      showToast('That drum settings file could not be imported.', 'warning');
    } finally {
      if (els.importInstrumentFile) els.importInstrumentFile.value = '';
    }
  }

  function getDrumPlacement(noteIndex, count = state.instrument.count) {
    const layout = DRUM_LAYOUTS[count];
    if (layout?.[noteIndex]) return { ...layout[noteIndex], manual: true, ring: 'single' };
    return { angle: (360 / count) * noteIndex, ring: 'single', size: 'regular' };
  }

  function createDrum(container, isStage = false) {
    if (!container) return;
    container.innerHTML = '';
    const body = document.createElement('div');
    const centreTongue = hasCenterTongue(state.instrument.count) ? ' has-center-tongue' : '';
    body.className = `drum-body drum-${state.instrument.count}${centreTongue}${isStage ? ' stage-drum-body' : ''}`;
    state.instrument.notes.forEach((note, i) => {
      const placement = getDrumPlacement(i);
      const pad = document.createElement('button');
      pad.type = 'button';
      pad.className = 'tongue';
      pad.dataset.noteIndex = String(i);
      if (placement.manual) {
        pad.classList.add('manual-placement');
        // xp/yp are percentages of the drum diameter; x/y are absolute pixels (legacy layouts).
        const offsetX = placement.xp !== undefined ? `${placement.xp}%` : `${placement.x}px`;
        const offsetY = placement.yp !== undefined ? `${placement.yp}%` : `${placement.y}px`;
        pad.style.left = `calc(50% + ${offsetX})`;
        pad.style.top = `calc(50% + ${offsetY})`;
        pad.style.setProperty('--rotation', `${placement.rotate || 0}deg`);
      } else {
        pad.style.setProperty('--angle', `${placement.angle}deg`);
      }
      if (placement.size) pad.classList.add(`tone-${placement.size}`);
      setNoteColorVars(pad, note.color || defaultNoteColor(i));
      pad.setAttribute('aria-label', `Play note ${note.label}, ${midiToName(note.midi)}`);
      const octave = splitOctaveMark(note.label);
      const markClassName = octaveMarkClass(octave);
      const markClass = markClassName ? ` class="${markClassName}"` : '';
      pad.innerHTML = `<span class="tongue-face"><strong${markClass}>${escapeHtml(octave.base)}</strong><small>${midiToName(note.midi)}</small></span>`;
      pad.addEventListener('pointerdown', () => handleUserNote(i));
      body.appendChild(pad);
    });
    if (!hasCenterTongue(state.instrument.count)) {
      const center = document.createElement('div');
      center.className = 'center-dome';
      center.textContent = 'Ethereal';
      body.appendChild(center);
    }
    container.appendChild(body);
  }

  function renderHighDrum() {
    if (!els.highDrumWrap) return;
    els.highDrumWrap.innerHTML = '';
    els.highDrumWrap.classList.remove('visible', 'always-visible');
    if (!highDrumEnabled()) return;

    const heading = document.createElement('div');
    heading.className = 'companion-zone-heading';
    heading.innerHTML = '<span>Companion drum</span><small>high notes</small>';

    const guides = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    guides.classList.add('companion-guides');
    guides.setAttribute('aria-hidden', 'true');
    for (let slot = 0; slot < 8; slot++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.dataset.slot = String(slot);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      guides.appendChild(line);
    }

    const body = document.createElement('div');
    body.className = 'high-drum-body';
    highDrumNotes().forEach(note => {
      const pad = document.createElement('button');
      pad.type = 'button';
      pad.className = 'tongue high-tongue';
      pad.dataset.noteIndex = String(note.noteIndex);
      pad.dataset.highSlot = String(note.slot);
      pad.style.setProperty('--angle', `${note.slot * 45}deg`);
      setNoteColorVars(pad, note.color);
      const octave = splitOctaveMark(note.label);
      const markClass = octaveMarkClass(octave);
      pad.innerHTML = `<span class="tongue-face"><strong${markClass ? ` class="${markClass}"` : ''}>${escapeHtml(octave.base)}</strong><small>${midiToName(note.midi)}</small></span>`;
      pad.setAttribute('aria-label', `Play high note ${note.label}, ${midiToName(note.midi)}`);
      pad.addEventListener('pointerdown', () => handleUserNote(note.noteIndex));
      body.appendChild(pad);
    });
    const center = document.createElement('div');
    center.className = 'high-drum-center';
    body.appendChild(center);
    els.highDrumWrap.append(heading, guides, body);
  }

  function renderInstrument() {
    const scaleName = state.instrument.scaleType === 'custom'
      ? 'custom tuning'
      : `${state.instrument.key} ${SCALE_NAMES[state.instrument.scaleType]}`;
    els.instrumentTitle.textContent = `${state.instrument.count}-note ${scaleName}${highDrumEnabled() ? ' + high 8-note drum' : ''}`;
    createDrum(els.drumWrap, false);
    createDrum(els.stageDrumWrap, true);
    renderHighDrum();
    state.stageTonguePads = [
      ...els.stageDrumWrap.querySelectorAll('.tongue'),
      ...els.highDrumWrap.querySelectorAll('.tongue')
    ];
    state.companionGeometryCache = null;
    state.companionGuideGeometryKey = '';
    state.particlePhaseCache.clear();
    if (els.keyboardHint) {
      els.keyboardHint.textContent = highDrumEnabled()
        ? 'Keys 1-9, 0, Q-P'
        : state.instrument.count >= 15
          ? 'Keys 1-9, 0, Q-T'
        : state.instrument.count >= 13
          ? 'Keys 1-9, 0, Q-E'
          : state.instrument.count >= 11
            ? 'Keys 1-9, 0, Q'
            : state.instrument.count >= 10
              ? 'Keys 1-9, 0'
              : 'Keys 1-9';
    }
    renderMiniPads();
    applyVisualMode();
    updatePracticeUI();
    renderFrame();
  }

  function makeMiniPad(note, index) {
    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = 'mini-pad';
    const octave = splitOctaveMark(note.label);
    // Same drawn dot as the tongues. The raw combining character is invisible at this size.
    const markClass = octaveMarkClass(octave);
    pad.innerHTML = `
      <span class="mini-pad-number${markClass ? ` ${markClass}` : ''}">${escapeHtml(octave.base)}</span>
      <small class="mini-pad-note-name">${escapeHtml(midiToName(note.midi))}</small>`;
    pad.title = `Insert ${note.label} (${midiToName(note.midi)}) at the cursor`;
    setNoteColorVars(pad, note.color || defaultNoteColor(index));
    pad.addEventListener('click', () => insertTokenAtCursor(note.label));
    return pad;
  }

  // Grouped middle / high / low rather than tongue order, so the pads read like a keyboard.
  function renderMiniPads() {
    els.miniPads.innerHTML = '';
    els.miniPads.classList.toggle('show-pitch-names', state.showPitchNames);
    if (els.showPitchNamesToggle) els.showPitchNamesToggle.checked = state.showPitchNames;
    const tagged = playableNotes().map(note => ({ note, index: note.noteIndex, mark: splitOctaveMark(note.label).mark }));
    const group = mark => tagged.filter(item => item.mark === mark).sort((a, b) => a.note.midi - b.note.midi);
    const middle = group('');
    const high = group('up');
    const low = group('down');

    const addRow = groups => {
      const filled = groups.filter(g => g.items.length);
      if (!filled.length) return;
      const row = document.createElement('div');
      row.className = 'mini-pad-row';
      filled.forEach(({ items, caption }) => {
        const cluster = document.createElement('div');
        cluster.className = 'mini-pad-group';
        const label = document.createElement('span');
        label.className = 'mini-pad-caption';
        label.textContent = caption;
        cluster.appendChild(label);
        const pads = document.createElement('div');
        pads.className = 'mini-pad-pads';
        pads.style.setProperty('--mini-pad-count', String(items.length));
        items.forEach(item => pads.appendChild(makeMiniPad(item.note, item.index)));
        cluster.appendChild(pads);
        row.appendChild(cluster);
      });
      els.miniPads.appendChild(row);
    };
    addRow([{ items: middle, caption: 'Middle notes' }, { items: high, caption: 'High notes' }]);
    addRow([{ items: low, caption: 'Low notes' }]);
  }

  function updatePracticeUI() {
    const current = state.currentTime;
    let next;
    if (state.mode === 'wait') {
      next = state.parsedNotes[state.waitingIndex];
    } else {
      let nextIndex = noteIndexAtOrAfter(current - 0.06);
      while (nextIndex < state.parsedNotes.length && state.hitNotes.has(state.parsedNotes[nextIndex].id)) nextIndex += 1;
      next = state.parsedNotes[nextIndex];
    }
    if (next) {
      els.nextNoteValue.textContent = next.label;
      const delta = Math.max(0, next.time - current);
      els.nextNoteTime.textContent = delta < .05 ? 'Now' : `in ${delta.toFixed(1)}s`;
    } else {
      els.nextNoteValue.textContent = '✓';
      els.nextNoteTime.textContent = state.playing ? 'Finishing' : 'Complete';
    }
    const firstFutureIndex = noteIndexAtOrAfter(current - 0.06);
    const sectionEndIndex = state.sectionLoop && Number.isFinite(state.loopB)
      ? noteIndexAtOrAfter(state.loopB + 0.02)
      : state.parsedNotes.length;
    const notesLeft = state.mode === 'wait'
      ? Math.max(0, state.parsedNotes.length - state.waitingIndex)
      : Math.max(0, sectionEndIndex - firstFutureIndex);
    const totalNotes = state.parsedNotes.length;
    els.totalNotesLabel.textContent = `${totalNotes} ${totalNotes === 1 ? 'note' : 'notes'} total`;
    els.notesLeftValue.textContent = String(notesLeft);
    if (els.mobileNotesLeftValue) els.mobileNotesLeftValue.textContent = String(notesLeft);
    els.elapsedLabel.textContent = formatTime(current);
    els.progress.value = state.duration ? Math.round((current / state.duration) * 1000) : 0;
    const scorePercent = state.attempts ? Math.round((state.score / state.attempts) * 100) : 0;
    els.scoreValue.textContent = `${scorePercent}%`;
    els.streakValue.textContent = String(state.streak);
    if (els.mobileScoreValue) els.mobileScoreValue.textContent = `${scorePercent}%`;
    if (els.mobileStreakValue) els.mobileStreakValue.textContent = String(state.streak);
    const scoreTone = !state.attempts || scorePercent === 0
      ? 'neutral'
      : scorePercent >= 80
        ? 'success'
        : scorePercent >= 40
          ? 'warning'
          : 'danger';
    const streakTone = state.streak === 0 ? 'neutral' : state.streak >= 3 ? 'success' : 'building';
    els.scorePill.dataset.tone = scoreTone;
    els.streakPill.dataset.tone = streakTone;
    if (els.mobileScorePill) els.mobileScorePill.dataset.tone = scoreTone;
    if (els.mobileStreakPill) els.mobileStreakPill.dataset.tone = streakTone;
  }

  function resizeCanvas() {
    const rect = els.noteCanvas.getBoundingClientRect();
    // Two animated canvases at DPR 2 are expensive on phones/tablets. A 1.5 cap keeps
    // the same CSS size and appearance while cutting the number of painted pixels by
    // roughly 44%. Desktop remains at DPR 2.
    const compactCanvas = rect.width <= 1100 || window.matchMedia?.('(pointer: coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, compactCanvas ? 1.5 : 2);
    [els.noteCanvas, els.noteCanvasBack].forEach(canvas => {
      if (!canvas) return;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    state.companionGeometryCache = null;
    state.companionGuideGeometryKey = '';
    buildStarField(rect.width, rect.height);
    renderFrame();
  }

  // Has the player actually started? Before that the drum stays clean: no expected-note
  // highlight and no note parked on top of a tongue hiding its label.
  function playbackStarted() {
    return state.playing || state.countInActive || state.currentTime > 0.001;
  }

  // parsedNotes is time-sorted. Binary-searching the visible time window means long songs
  // no longer scan every hidden note several times per animation frame.
  function noteIndexAtOrAfter(time) {
    let low = 0;
    let high = state.parsedNotes.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (state.parsedNotes[mid].time < time) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  function noteWindow(startTime, endTime) {
    const start = noteIndexAtOrAfter(startTime);
    let end = start;
    while (end < state.parsedNotes.length && state.parsedNotes[end].time <= endTime) end += 1;
    return { start, end };
  }

  function renderFrame() {
    const canvas = els.noteCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const now = performance.now() / 1000;
    const delta = Math.min(0.1, Math.max(0, now - (state.lastFrameAt || now)));
    state.lastFrameAt = now;
    ctx.clearRect(0, 0, width, height);

    const back = els.noteCanvasBack?.getContext('2d');
    if (back) back.clearRect(0, 0, width, height);
    updateHighDrumCue();

    let activeIndices;
    if (state.visualMode === 'radial') {
      if (back) renderRadialBackdrop(back, width, height, now, delta);
      activeIndices = state.mode === 'tuner' ? new Set() : renderRadialFrame(ctx, width, height);
    } else {
      activeIndices = state.mode === 'tuner' ? new Set() : renderLaneFrame(ctx, width, height);
    }

    const playbackPads = state.stageTonguePads.length
      ? state.stageTonguePads
      : [...els.stageDrumWrap.querySelectorAll('.tongue'), ...els.highDrumWrap.querySelectorAll('.tongue')];
    playbackPads.forEach(pad => {
      const idx = Number(pad.dataset.noteIndex);
      if (pad.classList.contains('high-tongue')) {
        const slot = Number(pad.dataset.highSlot);
        const label = highDrumNotes()[slot]?.label;
        const routesToCompanion = highDrumSlotForLabel(label) >= 0;
        pad.classList.toggle('expected', routesToCompanion && activeIndices.has(idx));
      } else {
        pad.classList.toggle('expected', activeIndices.has(idx));
      }
    });
  }

  function updateHighDrumCue() {
    if (!els.highDrumWrap) return;
    const previewSeconds = 4.2 / state.speed;
    const enabled = highDrumEnabled();
    const alwaysVisible = enabled && Boolean(state.instrument?.highDrumAlwaysVisible);

    if (!enabled) {
      els.highDrumWrap.classList.remove('visible', 'always-visible', 'engaged');
      els.highDrumWrap.style.setProperty('--high-cue', '0');
      return;
    }

    let hasApproachingNote = false;
    let nearest = previewSeconds;
    if (state.playing && !state.countInActive) {
      const { start, end } = noteWindow(state.currentTime - 0.35, state.currentTime + previewSeconds);
      for (let index = start; index < end; index += 1) {
        const note = state.parsedNotes[index];
        if (highDrumSlotForLabel(note.label) < 0) continue;
        const dt = note.time - state.currentTime;
        hasApproachingNote = true;
        nearest = Math.min(nearest, Math.abs(dt));
      }
    }

    const visible = alwaysVisible || hasApproachingNote;
    const cue = hasApproachingNote ? Math.max(0, Math.min(1, 1 - nearest / previewSeconds)) : 0;
    els.highDrumWrap.classList.toggle('visible', visible);
    els.highDrumWrap.classList.toggle('always-visible', alwaysVisible);
    els.highDrumWrap.classList.toggle('engaged', hasApproachingNote);
    els.highDrumWrap.style.setProperty('--high-cue', cue.toFixed(3));
    if (visible) updateCompanionGuides(previewSeconds);
  }

  function companionGeometry() {
    if (state.companionGeometryCache) return state.companionGeometryCache;
    if (!els.highDrumWrap) return null;
    const body = els.highDrumWrap.querySelector('.high-drum-body');
    if (!body || !body.offsetWidth) return null;
    const zoneX = els.highDrumWrap.offsetLeft;
    const zoneY = els.highDrumWrap.offsetTop;
    const localCx = body.offsetLeft;
    const localCy = body.offsetTop;
    state.companionGeometryCache = {
      zoneX,
      zoneY,
      zoneWidth: els.highDrumWrap.offsetWidth,
      zoneHeight: els.highDrumWrap.offsetHeight,
      localCx,
      localCy,
      cx: zoneX + localCx,
      cy: zoneY + localCy,
      drumSize: body.offsetWidth
    };
    return state.companionGeometryCache;
  }

  function companionGuideStrengths(previewSeconds) {
    const strengths = new Map();
    if (!state.playing || state.countInActive || state.mode === 'tuner') return strengths;
    const { start, end } = noteWindow(state.currentTime - 0.16, state.currentTime + previewSeconds);
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      const slot = highDrumSlotForLabel(note.label);
      if (slot < 0) continue;
      const dt = note.time - state.currentTime;
      const proximity = Math.max(0, Math.min(1, 1 - Math.max(0, dt) / previewSeconds));
      const hitFade = dt < 0 ? Math.max(0, 1 + dt / 0.16) : 1;
      const strength = Math.pow(proximity, 1.55) * hitFade;
      strengths.set(slot, Math.max(strengths.get(slot) || 0, strength));
    }
    return strengths;
  }

  function updateCompanionGuides(previewSeconds = 4.2 / state.speed) {
    const geometry = companionGeometry();
    const svg = els.highDrumWrap?.querySelector('.companion-guides');
    if (!geometry || !svg) return;
    const geometryKey = [geometry.zoneWidth, geometry.zoneHeight, geometry.localCx, geometry.localCy, geometry.drumSize].join(':');
    if (state.companionGuideGeometryKey !== geometryKey) {
      svg.setAttribute('viewBox', `0 0 ${geometry.zoneWidth} ${geometry.zoneHeight}`);
      svg.querySelectorAll('line').forEach(line => {
        const slot = Number(line.dataset.slot);
        const angle = slot * Math.PI / 4;
        const dx = Math.sin(angle);
        const dy = -Math.cos(angle);
        const tongueRadius = geometry.drumSize * .31;
        const startRadius = tongueRadius + geometry.drumSize * .13;
        const edgeRadius = distanceToStageEdge(geometry.localCx, geometry.localCy, dx, dy, geometry.zoneWidth, geometry.zoneHeight, 15);
        line.setAttribute('x1', (geometry.localCx + dx * startRadius).toFixed(2));
        line.setAttribute('y1', (geometry.localCy + dy * startRadius).toFixed(2));
        line.setAttribute('x2', (geometry.localCx + dx * edgeRadius).toFixed(2));
        line.setAttribute('y2', (geometry.localCy + dy * edgeRadius).toFixed(2));
      });
      state.companionGuideGeometryKey = geometryKey;
    }
    const strengths = companionGuideStrengths(previewSeconds);
    svg.querySelectorAll('line').forEach(line => {
      const slot = Number(line.dataset.slot);
      line.style.setProperty('--guide-strength', (strengths.get(slot) || 0).toFixed(3));
    });
  }

  const STAR_COUNT = 110;

  function buildStarField(width, height) {
    if (!width || !height) return;
    state.stars = Array.from({ length: STAR_COUNT }, () => {
      const depth = Math.random() ** 1.4;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        depth,
        r: 0.35 + depth * 1.25,
        base: 0.13 + depth * 0.52,
        speed: 0.3 + Math.random() * 1.9,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.7 + Math.random() * 0.6
      };
    });
  }

  // Parallax: every star slides along the same axis, but near ones move several times
  // faster than far ones, which reads as depth rather than as noise.
  const PARALLAX = { x: -5.2, y: 2.1 };

  function drawStars(ctx, width, height, now, delta) {
    if (!state.stars?.length) buildStarField(width, height);
    const pace = (state.playing ? 1 : 0.32) * delta;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    state.stars.forEach(star => {
      const rate = 0.18 + star.depth * 1.05;
      star.x = (star.x + PARALLAX.x * rate * star.wobble * pace + width) % width;
      star.y = (star.y + PARALLAX.y * rate * pace + height) % height;
      const twinkle = 0.5 + 0.5 * Math.sin(now * star.speed + star.phase);
      ctx.globalAlpha = star.base * (0.3 + 0.7 * twinkle);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Soft overlapping lobes rather than one traced outline. Each lobe is a radial gradient
  // that fades to fully transparent, so there is no edge to go crisp or pixelated, and the
  // lobes orbit at different rates so the combined silhouette keeps crawling.
  const AMOEBA_LOBES = [
    { orbit: 0.11, speed: 0.130, phase: 0.0, size: 0.62, tint: '123,146,255', alpha: 0.15 },
    { orbit: 0.17, speed: -0.092, phase: 1.9, size: 0.53, tint: '99,130,246', alpha: 0.13 },
    { orbit: 0.14, speed: 0.074, phase: 3.4, size: 0.58, tint: '94,234,212', alpha: 0.10 },
    { orbit: 0.21, speed: -0.109, phase: 5.0, size: 0.45, tint: '167,139,250', alpha: 0.11 },
    { orbit: 0.08, speed: 0.161, phase: 2.4, size: 0.70, tint: '110,140,255', alpha: 0.08 }
  ];

  function drawAmoeba(ctx, cx, cy, size, now) {
    const compactLayout = ctx.canvas.clientWidth <= 1100 || window.matchMedia?.('(pointer: coarse)').matches;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (compactLayout) {
      // The backdrop canvas is now locked to the stage size, so this broad compact-screen
      // light stays centred on the drum. Keep it to one soft gradient for mobile performance.
      const breathe = 1 + Math.sin(now * 0.42) * 0.035;
      const radius = size * 0.73 * breathe;
      const gradient = ctx.createRadialGradient(cx, cy, size * 0.22, cx, cy, radius);
      gradient.addColorStop(0, 'rgba(112,143,255,.17)');
      gradient.addColorStop(0.34, 'rgba(99,130,246,.115)');
      gradient.addColorStop(0.66, 'rgba(99,130,246,.05)');
      gradient.addColorStop(0.86, 'rgba(94,234,212,.016)');
      gradient.addColorStop(1, 'rgba(109,130,246,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    AMOEBA_LOBES.forEach(lobe => {
      const breathe = 1 + 0.19 * Math.sin(now * lobe.speed * 2.3 + lobe.phase);
      const ox = cx + Math.cos(now * lobe.speed + lobe.phase) * size * lobe.orbit;
      const oy = cy + Math.sin(now * lobe.speed * 1.27 + lobe.phase * 1.4) * size * lobe.orbit * 0.82;
      const radius = size * lobe.size * breathe;
      const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      gradient.addColorStop(0, `rgba(${lobe.tint},${lobe.alpha})`);
      gradient.addColorStop(0.42, `rgba(${lobe.tint},${(lobe.alpha * 0.42).toFixed(4)})`);
      gradient.addColorStop(1, `rgba(${lobe.tint},0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ox, oy, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawDrumHalo(ctx, cx, cy, size, now) {
    const pulse = 1 + Math.sin(now * 0.82) * 0.035;
    const compactLayout = ctx.canvas.clientWidth <= 1100 || window.matchMedia?.('(pointer: coarse)').matches;
    const innerRadius = size * (compactLayout ? 0.45 : 0.47);
    const outerRadius = size * (compactLayout ? 0.72 : 0.76) * pulse;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
    halo.addColorStop(0, compactLayout ? 'rgba(126,156,255,.30)' : 'rgba(126,156,255,.3)');
    halo.addColorStop(0.22, compactLayout ? 'rgba(116,147,255,.17)' : 'rgba(116,147,255,.17)');
    halo.addColorStop(0.58, compactLayout ? 'rgba(109,130,246,.06)' : 'rgba(109,130,246,.07)');
    halo.addColorStop(1, 'rgba(109,130,246,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.36 + Math.sin(now * 0.82) * 0.08;
    ctx.strokeStyle = 'rgba(170,186,255,.72)';
    ctx.lineWidth = Math.max(2, size * 0.009);
    ctx.shadowColor = 'rgba(112,143,255,.85)';
    ctx.shadowBlur = size * 0.07;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.505, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function radialGuideStrengths(previewSeconds) {
    const strengths = new Map();
    if (!state.playing || state.countInActive || state.mode === 'tuner') return strengths;
    const { start, end } = noteWindow(state.currentTime - 0.16, state.currentTime + previewSeconds);
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      if (highDrumSlotForLabel(note.label) >= 0) continue;
      const dt = note.time - state.currentTime;
      const proximity = Math.max(0, Math.min(1, 1 - Math.max(0, dt) / previewSeconds));
      const hitFade = dt < 0 ? Math.max(0, 1 + dt / 0.16) : 1;
      const strength = Math.pow(proximity, 1.65) * hitFade;
      strengths.set(note.noteIndex, Math.max(strengths.get(note.noteIndex) || 0, strength));
    }
    return strengths;
  }

  // Everything that belongs behind the drum: stars, amoeba, halo, flight guide lines.
  function renderRadialBackdrop(ctx, width, height, now, delta) {
    drawStars(ctx, width, height, now, delta);
    const geometry = radialGeometry(width, height);
    drawAmoeba(ctx, geometry.cx, geometry.cy, geometry.drumSize, now);
    drawDrumHalo(ctx, geometry.cx, geometry.cy, geometry.drumSize, now);
    const guideStrengths = radialGuideStrengths(4.2 / state.speed);
    ctx.save();
    state.instrument.notes.forEach((note, i) => {
      const strength = guideStrengths.get(i) || 0;
      const target = getPlacementTarget(getDrumPlacement(i), geometry.scale, geometry.cx, geometry.cy);
      const edgeRadius = distanceToStageEdge(geometry.cx, geometry.cy, target.dx, target.dy, width, height, 12);
      const startX = target.x + target.dx * 16 * geometry.scale;
      const startY = target.y + target.dy * 16 * geometry.scale;
      const edgeX = geometry.cx + target.dx * edgeRadius;
      const edgeY = geometry.cy + target.dy * edgeRadius;
      const lineGradient = ctx.createLinearGradient(startX, startY, edgeX, edgeY);
      lineGradient.addColorStop(0, `rgba(255,255,255,${(0.09 + strength * 0.84).toFixed(3)})`);
      lineGradient.addColorStop(0.24, `rgba(255,255,255,${(0.065 + strength * 0.43).toFixed(3)})`);
      lineGradient.addColorStop(0.62, `rgba(255,255,255,${(0.03 + strength * 0.12).toFixed(3)})`);
      lineGradient.addColorStop(1, `rgba(255,255,255,${(0.006 + strength * 0.012).toFixed(3)})`);
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 1 + strength * 1.25;
      ctx.shadowColor = 'rgba(255,255,255,.9)';
      ctx.shadowBlur = strength * 8;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(edgeX, edgeY);
      ctx.stroke();
    });
    ctx.restore();
  }

  function renderLaneFrame(ctx, width, height) {
    const lanes = playableNotes().length;
    const laneW = width / lanes;
    const hitY = height - 52;
    const previewSeconds = 4.2 / state.speed;
    const compactNotes = width <= 760 || window.matchMedia?.('(pointer: coarse)').matches;

    ctx.lineWidth = 1;
    for (let i = 0; i <= lanes; i++) {
      ctx.strokeStyle = 'rgba(255,255,255,.035)';
      ctx.beginPath();
      ctx.moveTo(i * laneW, 0);
      ctx.lineTo(i * laneW, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(94,234,212,.7)';
    ctx.shadowColor = 'rgba(94,234,212,.5)';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(width, hitY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const activeIndices = new Set();
    const { start, end } = noteWindow(state.currentTime - 0.55, state.currentTime + previewSeconds);
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      const dt = note.time - state.currentTime;
      const y = hitY - (dt / previewSeconds) * (hitY - 26);
      const x = note.noteIndex * laneW + laneW / 2;
      const travelProgress = Math.max(0, Math.min(1, 1 - dt / previewSeconds));
      const growth = compactNotes
        ? 0.72 + Math.pow(travelProgress, 0.72) * 0.48
        : 1;
      const baseNoteWidth = compactNotes
        ? Math.max(40, Math.min(56, width * .12))
        : Math.max(14, Math.min(56, laneW * .64));
      const radius = baseNoteWidth * growth / 2;
      const baseNoteHeight = compactNotes
        ? Math.max(28, Math.min(36, width * .08))
        : laneW < 30 ? 22 : 28;
      const noteHeight = baseNoteHeight * growth;
      const color = noteColor(note.noteIndex);
      const alpha = dt < -0.2 ? Math.max(0, 1 + dt * 2) : 1;
      const noteIsMoving = state.playing && !state.countInActive && state.mode !== 'wait';
      if (noteIsMoving) drawFallingNoteParticles(ctx, note, x, y, radius, noteHeight, color, alpha);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = dt < .15 && dt > -.15 ? 24 : 10;
      roundRect(ctx, x - radius, y - noteHeight / 2, radius * 2, noteHeight, noteHeight / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      const labelSize = compactNotes
        ? Math.max(13, Math.min(18, width * .04 * growth))
        : laneW < 30 ? 10 : 13;
      drawFlyingNoteLabel(ctx, note.label, x, y, labelSize, noteInkColor(color));
      ctx.globalAlpha = 1;
      if (Math.abs(dt) < .14) activeIndices.add(note.noteIndex);
    }
    return activeIndices;
  }

  function getPlacementTarget(placement, scale, cx, cy) {
    if (placement.manual) {
      // xp/yp are percentages of the drum diameter; x/y are pixels at the STAGE_DRUM_BASE size.
      const drumSize = STAGE_DRUM_BASE * scale;
      const x = cx + (placement.xp !== undefined ? (placement.xp / 100) * drumSize : placement.x * scale);
      const y = cy + (placement.yp !== undefined ? (placement.yp / 100) * drumSize : placement.y * scale);
      const vx = x - cx;
      const vy = y - cy;
      const length = Math.max(1, Math.hypot(vx, vy));
      return { x, y, dx: vx / length, dy: vy / length, distance: length };
    }
    const rad = placement.angle * Math.PI / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const distance = getTargetRadius(placement.ring) * scale;
    return { x: cx + dx * distance, y: cy + dy * distance, dx, dy, distance };
  }

  // Keeps the starfield twinkling and the amoeba drifting while the transport is idle.
  // Throttled to ~30fps, and it stands aside completely while playback drives the frames.
  function ambientTick(now) {
    state.ambientId = 0;
    if (state.visualMode !== 'radial') return;
    // Wait-for-note mode has no playback clock, so the ambient loop draws those frames too.
    const drivenByPlayback = state.playing && state.mode !== 'wait';
    if (!drivenByPlayback && !document.hidden && now - state.lastAmbientAt > 33) {
      state.lastAmbientAt = now;
      renderFrame();
    }
    startAmbientLoop();
  }

  function startAmbientLoop() {
    if (state.ambientId || state.visualMode !== 'radial') return;
    state.ambientId = requestAnimationFrame(ambientTick);
  }

  function stopAmbientLoop() {
    cancelAnimationFrame(state.ambientId);
    state.ambientId = 0;
  }

  function radialGeometry(width, height) {
    const aspect = width / Math.max(height, 1);
    let drumSize;

    // Phones and tablets previously fell into the 260px minimum because the desktop
    // width ratio is intentionally conservative. Give touch layouts more of the stage
    // while keeping enough breathing room for flying notes around the drum.
    if (width <= 760) {
      const mobileFloor = Math.min(290, Math.max(250, width - 20));
      const mobileTarget = Math.min(360, width * 0.54, height * 0.68);
      drumSize = Math.max(mobileFloor, mobileTarget);
    } else if (width <= 1100) {
      const tabletFloor = Math.min(320, Math.max(280, width - 28));
      const tabletTarget = Math.min(400, width * 0.42, height * 0.64);
      drumSize = Math.max(tabletFloor, tabletTarget);
    } else {
      // Desktop should feel consistent across window shapes, not jump between narrow
      // width presets. Let the drum grow mainly with the available stage height while
      // still respecting the stage width. This preserves the compact drum on short,
      // ultra-wide windows but makes it substantially larger on taller desktop layouts.
      const desktopFromHeight = height * 0.61;
      const desktopFromWidth = width * 0.38;
      drumSize = Math.max(270, Math.min(450, Math.min(desktopFromHeight, desktopFromWidth)));
    }

    const cx = width / 2;
    const cy = height / 2 + Math.min(14, height * .02);

    // Keep the main drum centred on every screen size. The companion drum occupies
    // its own overlay area and must not push the primary instrument off-centre on mobile.
    return {
      drumSize,
      scale: drumSize / STAGE_DRUM_BASE,
      cx,
      cy
    };
  }

  function getHighDrumTarget(label, cx, cy) {
    const slot = highDrumSlotForLabel(label);
    const geometry = companionGeometry();
    if (slot < 0 || !geometry) return null;
    const angle = slot * Math.PI / 4;
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const tongueRadius = geometry.drumSize * .31;
    const x = geometry.cx + dx * tongueRadius;
    const y = geometry.cy + dy * tongueRadius;
    return {
      x,
      y,
      dx,
      dy,
      distance: tongueRadius,
      high: true,
      slot,
      companion: geometry
    };
  }

  function noteFlightRadius(dt, previewSeconds, targetRadius, startRadius) {
    const progress = Math.max(0, Math.min(1.18, 1 - dt / previewSeconds));
    const eased = 1 - Math.pow(1 - Math.min(progress, 1), 1.25);
    return startRadius + (targetRadius - startRadius) * eased;
  }

  function particleSeed(noteId, index, salt = 0) {
    const value = `${noteId}:${index}:${salt}`;
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  // One reusable particle template is animated for every note. Notes only receive a
  // cached phase offset, so we no longer run four string hashes for every particle on
  // every frame. The trails keep their varied look without repeated random work.
  const PARTICLE_TEMPLATE = Array.from({ length: 36 }, (_, index) => {
    const wave = value => (Math.sin(value * 12.9898 + index * 78.233) * 43758.5453) % 1;
    const unit = value => Math.abs(wave(value));
    return {
      stream: index % 3 - 1,
      streamIndex: Math.floor(index / 3),
      side: unit(1.3),
      size: unit(2.7),
      phase: unit(4.1),
      speed: unit(6.9)
    };
  });

  function particlePhase(noteId) {
    if (state.particlePhaseCache.has(noteId)) return state.particlePhaseCache.get(noteId);
    const phase = particleSeed(noteId, 0, 91);
    state.particlePhaseCache.set(noteId, phase);
    return phase;
  }

  function drawFlyingNoteLabel(ctx, label, x, y, fontSize, inkColor) {
    const octave = splitOctaveMark(label);
    ctx.save();
    ctx.fillStyle = inkColor;
    ctx.font = `850 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(octave.base, x, y + 0.5);
    if (octave.mark) {
      const dotRadius = Math.max(2, Math.min(3, fontSize * 0.17));
      const dotOffset = Math.max(6, fontSize * 0.62);
      const dotY = y + (octave.mark === 'down' ? dotOffset : -dotOffset);
      const count = Math.max(1, octave.count || 1);
      const spacing = dotRadius * 2.65;
      for (let dot = 0; dot < count; dot++) {
        const dotX = x + (dot - (count - 1) / 2) * spacing;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawFallingNoteParticles(ctx, note, x, y, radius, noteHeight, color, alpha) {
    const { r, g, b } = hexToRgb(color);
    const lightR = Math.round(r + (255 - r) * 0.38);
    const lightG = Math.round(g + (255 - g) * 0.38);
    const lightB = Math.round(b + (255 - b) * 0.38);
    const clock = performance.now() / 1000;
    const notePhase = particlePhase(note.id);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let particle = 0; particle < 27; particle++) {
      const template = PARTICLE_TEMPLATE[particle];
      const stream = template.stream;
      const streamIndex = template.streamIndex;
      const sideSeed = template.side;
      const sizeSeed = template.size;
      const phaseSeed = (template.phase + notePhase) % 1;
      const speedSeed = template.speed;
      const flow = (streamIndex / 9 + clock * (0.58 + speedSeed * 0.26) + phaseSeed * 0.08) % 1;
      const life = Math.sin(flow * Math.PI);
      const tailLength = noteHeight * (0.34 + flow * 2.35) * (stream === 0 ? 1.18 : 1);
      const spread = radius * (0.12 + flow * 0.42);
      const weave = Math.sin(clock * (2 + speedSeed) + phaseSeed * Math.PI * 2) * radius * 0.1;
      const particleX = x + stream * spread + weave + (sideSeed - 0.5) * radius * 0.16;
      const particleY = y - tailLength;
      const twinkle = 0.55 + 0.45 * Math.abs(Math.sin(clock * (3 + sizeSeed * 3) + phaseSeed * Math.PI * 2));
      const particleSize = (0.65 + sizeSeed * 1.45) * (0.62 + life * 0.68);
      ctx.globalAlpha = alpha * (0.14 + life * 0.72) * twinkle;
      ctx.fillStyle = stream === 0 && streamIndex % 3 === 0
        ? '#ffffff'
        : `rgb(${lightR},${lightG},${lightB})`;
      ctx.shadowColor = `rgba(${r},${g},${b},.9)`;
      ctx.shadowBlur = 5 + life * 7;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function renderRadialFrame(ctx, width, height) {
    const previewSeconds = 4.2 / state.speed;
    const { drumSize, scale, cx, cy } = radialGeometry(width, height);
    const compactNotes = width <= 760 || window.matchMedia?.('(pointer: coarse)').matches;
    if (els.stageDrumWrap) {
      els.stageDrumWrap.style.left = `${cx}px`;
      els.stageDrumWrap.style.top = `${cy}px`;
      els.stageDrumWrap.style.setProperty('--stage-scale', scale.toFixed(4));
    }

    const started = playbackStarted();
    const activeIndices = new Set();
    const { start, end } = noteWindow(state.currentTime - 0.48, state.currentTime + previewSeconds);
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      const dt = note.time - state.currentTime;
      // Before the transport rolls, keep notes clear of the drum so every label is legible.
      if (!started && dt < 0.42) continue;
      if (!started && highDrumSlotForLabel(note.label) >= 0) continue;

      const target = getHighDrumTarget(note.label, cx, cy)
        || getPlacementTarget(getDrumPlacement(note.noteIndex), scale, cx, cy);
      const progress = Math.max(0, Math.min(1.18, 1 - dt / previewSeconds));
      const eased = 1 - Math.pow(1 - Math.min(progress, 1), 1.25);

      let x;
      let y;
      let impactX;
      let impactY;
      let trailDx = target.dx;
      let trailDy = target.dy;
      let targetRadius = target.distance + 12 * scale;

      if (target.high) {
        const geometry = target.companion;
        const edgeRadius = distanceToStageEdge(
          geometry.localCx,
          geometry.localCy,
          target.dx,
          target.dy,
          geometry.zoneWidth,
          geometry.zoneHeight,
          17
        );
        const startX = geometry.cx + target.dx * edgeRadius;
        const startY = geometry.cy + target.dy * edgeRadius;
        x = startX + (target.x - startX) * eased;
        y = startY + (target.y - startY) * eased;
        impactX = target.x;
        impactY = target.y;
      } else {
        const startRadius = Math.max(
          targetRadius + 75,
          distanceToStageEdge(cx, cy, target.dx, target.dy, width, height, 22)
        );
        const radius = noteFlightRadius(dt, previewSeconds, targetRadius, startRadius);
        x = cx + target.dx * radius;
        y = cy + target.dy * radius;
        impactX = cx + target.dx * targetRadius;
        impactY = cy + target.dy * targetRadius;
      }

      // Flying notes always stay on the foreground canvas. Sending a main note to the
      // backdrop when it crossed the companion area also placed it behind the main drum.
      const drawCtx = ctx;
      const depthAlpha = 1;

      // Companion animation is clipped to its own panel. It can no longer spill over the
      // main drum, toolbar or neighbouring companion meridians.
      let companionClip = false;
      if (target.high) {
        const geometry = target.companion;
        drawCtx.save();
        roundRect(
          drawCtx,
          geometry.zoneX + 2,
          geometry.zoneY + 2,
          geometry.zoneWidth - 4,
          geometry.zoneHeight - 4,
          22
        );
        drawCtx.clip();
        companionClip = true;
      }

      const color = noteColor(note.noteIndex);
      const { r, g, b } = hexToRgb(color);
      const highlightR = Math.round(r + (255 - r) * 0.56);
      const highlightG = Math.round(g + (255 - g) * 0.56);
      const highlightB = Math.round(b + (255 - b) * 0.56);
      const lightR = Math.round(r + (255 - r) * 0.3);
      const lightG = Math.round(g + (255 - g) * 0.3);
      const lightB = Math.round(b + (255 - b) * 0.3);
      const travelProgress = Math.max(0, Math.min(1, 1 - dt / previewSeconds));
      const growth = (compactNotes ? 0.72 : 0.58)
        + Math.pow(travelProgress, 0.72) * (compactNotes ? 0.48 : 0.54);
      const alpha = (dt < -0.18 ? Math.max(0, 1 + dt * 2.5) : 1) * depthAlpha;
      const approach = Math.max(0, Math.min(1, 1 - Math.abs(dt) / 0.6));
      const mainCapsuleW = compactNotes
        ? Math.max(40, Math.min(56, 44 * scale + 10))
        : Math.max(32, Math.min(48, 38 * scale + 8));
      const mainCapsuleH = compactNotes
        ? Math.max(28, Math.min(36, 30 * scale + 7))
        : Math.max(22, Math.min(30, 24 * scale + 5));
      const companionGem = target.high
        ? compactNotes
          ? Math.max(28, Math.min(38, 24 + target.companion.drumSize * .075))
          : Math.max(23, Math.min(34, 20 + target.companion.drumSize * .07))
        : 0;
      const capsuleW = (target.high ? companionGem : mainCapsuleW) * growth * (1 + approach * 0.06);
      const capsuleH = (target.high ? companionGem : mainCapsuleH) * growth * (1 + approach * 0.06);
      const angle = target.high ? 0 : Math.atan2(target.dy, target.dx);
      const noteIsMoving = state.playing && !state.countInActive && state.mode !== 'wait';

      if (noteIsMoving) {
        // Companion trails are intentionally shorter and calmer. The diamond shape plus
        // the cool halo makes them distinct without replacing each tongue's note colour.
        const particleClock = performance.now() / 1000;
        const notePhase = particlePhase(note.id);
        const perpendicularX = -trailDy;
        const perpendicularY = trailDx;
        const particleCount = target.high ? 18 : 36;
        drawCtx.save();
        drawCtx.globalCompositeOperation = 'lighter';
        for (let particle = 0; particle < particleCount; particle++) {
          const template = PARTICLE_TEMPLATE[particle];
          const stream = template.stream;
          const streamIndex = template.streamIndex;
          const sideSeed = template.side;
          const sizeSeed = template.size;
          const phaseSeed = (template.phase + notePhase) % 1;
          const speedSeed = template.speed;
          const rows = target.high ? 6 : 12;
          const flow = (streamIndex / rows + particleClock * (0.55 + speedSeed * 0.24) + phaseSeed * 0.08) % 1;
          const life = Math.sin(flow * Math.PI);
          const centreTailStretch = stream === 0 ? (target.high ? 1.16 : 1.38) : 1;
          const along = capsuleW * (target.high ? 0.18 + flow * 0.43 : 0.25 + flow * 0.58) * centreTailStretch;
          const streamGap = capsuleH * (target.high ? 0.2 + flow * 0.13 : 0.3 + flow * 0.2);
          const weave = Math.sin(particleClock * (1.7 + speedSeed * 0.8) + phaseSeed * Math.PI * 2 + stream * 1.9)
            * capsuleH * (target.high ? 0.04 : 0.065);
          const jitter = (sideSeed - 0.5) * capsuleH * (target.high ? 0.09 : 0.16);
          const sideways = stream * streamGap + weave + jitter;
          const particleX = x + trailDx * along + perpendicularX * sideways;
          const particleY = y + trailDy * along + perpendicularY * sideways;
          const twinkle = 0.55 + 0.45 * Math.abs(Math.sin(particleClock * (2.8 + sizeSeed * 3.2) + phaseSeed * Math.PI * 2));
          const particleSize = (0.55 + sizeSeed * 1.5) * (0.6 + life * 0.65) * (0.72 + growth * 0.28);
          drawCtx.globalAlpha = alpha * (target.high ? 0.12 + life * 0.52 : 0.16 + life * 0.7) * twinkle;
          drawCtx.fillStyle = target.high && streamIndex % 3 === 0
            ? 'rgb(165,243,252)'
            : stream === 0 && streamIndex % 4 === 0
              ? `rgb(${highlightR},${highlightG},${highlightB})`
              : `rgb(${lightR},${lightG},${lightB})`;
          drawCtx.shadowColor = target.high ? 'rgba(103,232,249,.9)' : `rgba(${r},${g},${b},.9)`;
          drawCtx.shadowBlur = target.high ? 4 + life * 5 : 5 + life * 7;
          drawCtx.beginPath();
          drawCtx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          drawCtx.fill();
        }
        drawCtx.restore();
      }

      // Impact ring as the note lands on its tongue.
      if (noteIsMoving && Math.abs(dt) < 0.26) {
        const hit = 1 - Math.abs(dt) / 0.26;
        drawCtx.save();
        drawCtx.globalAlpha = alpha * hit * (target.high ? 0.7 : 0.55);
        drawCtx.strokeStyle = target.high ? 'rgb(103,232,249)' : `rgb(${r},${g},${b})`;
        drawCtx.lineWidth = target.high ? 1.8 * hit : 2.4 * hit;
        drawCtx.beginPath();
        drawCtx.arc(impactX, impactY, (target.high ? 9 + (1 - hit) * 22 : (12 + (1 - hit) * 34) * scale), 0, Math.PI * 2);
        drawCtx.stroke();
        drawCtx.restore();
      }

      drawCtx.save();
      drawCtx.globalAlpha = alpha;
      drawCtx.translate(x, y);
      drawCtx.rotate(angle);
      // A pronounced jewel-like gradient that stays entirely within the note colour.
      const noteGradient = drawCtx.createLinearGradient(-capsuleW * 0.42, -capsuleH * 0.45, capsuleW * 0.42, capsuleH * 0.45);
      noteGradient.addColorStop(0, `rgb(${highlightR},${highlightG},${highlightB})`);
      noteGradient.addColorStop(0.3, `rgb(${lightR},${lightG},${lightB})`);
      noteGradient.addColorStop(0.62, `rgb(${r},${g},${b})`);
      noteGradient.addColorStop(1, `rgb(${lightR},${lightG},${lightB})`);
      drawCtx.fillStyle = noteGradient;
      drawCtx.shadowColor = target.high ? 'rgba(103,232,249,.95)' : `rgba(${r},${g},${b},.9)`;
      drawCtx.shadowBlur = target.high
        ? 8 + approach * 16
        : (10 + approach * 24) * Math.max(0.8, scale);
      if (target.high) roundedDiamond(drawCtx, capsuleW, Math.max(6, capsuleW * .24));
      else roundRect(drawCtx, -capsuleW / 2, -capsuleH / 2, capsuleW, capsuleH, capsuleH / 2);
      drawCtx.fill();
      drawCtx.shadowBlur = 0;
      drawCtx.strokeStyle = target.high ? 'rgba(207,250,254,.76)' : 'rgba(255,255,255,.28)';
      drawCtx.lineWidth = target.high ? 1.25 : 1;
      drawCtx.stroke();
      drawCtx.restore();

      drawCtx.save();
      drawCtx.globalAlpha = alpha;
      const labelSize = target.high
        ? compactNotes
          ? Math.max(12, Math.min(16, (12 + target.companion.drumSize * .012) * growth))
          : Math.max(8, Math.min(13, (9.5 + target.companion.drumSize * .012) * growth))
        : compactNotes
          ? Math.max(13, Math.min(18, (14 + scale * 3) * growth))
          : Math.max(8, Math.min(15, (11 + scale * 2) * growth));
      drawFlyingNoteLabel(drawCtx, note.label, x, y, labelSize, noteInkColor(color));
      drawCtx.restore();

      if (companionClip) drawCtx.restore();
      if (started && Math.abs(dt) < .14) activeIndices.add(note.noteIndex);
    }
    return activeIndices;
  }

  function getTargetRadius(ring) {
    if (state.instrument.count === 11 || state.instrument.count === 13) return 126;
    if (state.instrument.count === 8) return 116;
    return 102;
  }

  function distanceToStageEdge(cx, cy, dx, dy, width, height, margin) {
    const values = [];
    if (dx > .0001) values.push((width - margin - cx) / dx);
    if (dx < -.0001) values.push((margin - cx) / dx);
    if (dy > .0001) values.push((height - margin - cy) / dy);
    if (dy < -.0001) values.push((margin - cy) / dy);
    return Math.max(0, Math.min(...values.filter(value => value > 0)));
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function roundedDiamond(ctx, size, corner = 5) {
    const half = size / 2;
    const c = Math.min(corner, half * .32);
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.quadraticCurveTo(c, -half + c, half - c, -c);
    ctx.quadraticCurveTo(half, 0, half - c, c);
    ctx.quadraticCurveTo(c, half - c, 0, half);
    ctx.quadraticCurveTo(-c, half - c, -half + c, c);
    ctx.quadraticCurveTo(-half, 0, -half + c, -c);
    ctx.quadraticCurveTo(-c, -half + c, 0, -half);
    ctx.closePath();
  }

  async function ensureAudio() {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      state.masterGain = state.audioContext.createGain();
      state.masterGain.gain.value = document.hidden ? 0 : 1;
      state.masterGain.connect(state.audioContext.destination);
    }
    if (state.audioContext.state === 'suspended') await state.audioContext.resume();
    return state.audioContext;
  }

  function setAudioMuted(muted) {
    if (!state.audioContext || !state.masterGain) return;
    const now = state.audioContext.currentTime;
    state.masterGain.gain.cancelScheduledValues(now);
    state.masterGain.gain.setValueAtTime(muted ? 0 : 1, now);
  }

  async function playMidi(midi, referencePitch = 440, accent = false) {
    const context = await ensureAudio();
    const frequency = Number(referencePitch) * Math.pow(2, (Number(midi) - 69) / 12);
    const now = context.currentTime;
    const master = context.createGain();
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const filter = context.createBiquadFilter();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);
    osc2.frequency.setValueAtTime(frequency * 2.003, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3500, frequency * 7), now);
    filter.Q.value = .8;

    const peak = accent ? .32 : .24;
    master.gain.setValueAtTime(.0001, now);
    master.gain.exponentialRampToValueAtTime(peak, now + .008);
    master.gain.exponentialRampToValueAtTime(.0001, now + 1.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(master);
    master.connect(state.masterGain || context.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.4);
    osc2.stop(now + 1.4);
  }

  async function playTone(noteIndex, accent = false) {
    const midi = playableNoteAt(noteIndex)?.midi ?? 60;
    return playMidi(midi, state.instrument.referencePitch || 440, accent);
  }

  async function playClick(accent) {
    const context = await ensureAudio();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'square';
    osc.frequency.value = accent ? 1300 : 900;
    gain.gain.setValueAtTime(.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .045);
    osc.connect(gain).connect(state.masterGain || context.destination);
    osc.start();
    osc.stop(context.currentTime + .05);
  }

  function flashPad(noteIndex, className = 'active', duration = 190, noteLabel = null) {
    const pads = document.querySelectorAll(`.tongue[data-note-index="${noteIndex}"]`);
    const routesToCompanion = noteLabel === null ? null : highDrumSlotForLabel(noteLabel) >= 0;
    pads.forEach(pad => {
      if (routesToCompanion !== null) {
        const isCompanionPad = pad.classList.contains('high-tongue');
        if (isCompanionPad !== routesToCompanion) return;
      }
      pad.classList.add(className);
      window.setTimeout(() => pad.classList.remove(className), duration);
    });
  }

  function handleUserNote(noteIndex, options = {}) {
    if (options.source !== 'microphone') playTone(noteIndex, true).catch(() => {});
    flashPad(noteIndex, 'active');
    if (!state.playing && state.mode !== 'wait') return;

    if (state.mode === 'wait') {
      const expected = state.parsedNotes[state.waitingIndex];
      if (!expected) return;
      state.attempts += 1;
      if (expected.noteIndex === noteIndex) {
        state.score += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.hitNotes.add(expected.id);
        state.waitingIndex += 1;
        state.currentTime = Math.min(state.duration, (state.parsedNotes[state.waitingIndex]?.time ?? state.duration));
        if (state.waitingIndex >= state.parsedNotes.length) finishPlayback();
      } else {
        state.missedNoteIds.add(expected.id);
        state.streak = 0;
        flashPad(noteIndex, 'wrong');
      }
      updatePracticeUI();
      renderFrame();
      return;
    }

    if (state.mode === 'practice') {
      const windowSize = .42 / state.speed;
      const candidates = state.parsedNotes.filter(n => !state.hitNotes.has(n.id) && Math.abs(n.time - state.currentTime) <= windowSize);
      state.attempts += 1;
      const match = candidates.find(n => n.noteIndex === noteIndex);
      if (match) {
        state.hitNotes.add(match.id);
        const timing = Math.abs(match.time - state.currentTime);
        state.score += timing < .16 ? 1 : .75;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
      } else {
        const nearestExpected = candidates.slice().sort((a, b) => Math.abs(a.time - state.currentTime) - Math.abs(b.time - state.currentTime))[0];
        if (nearestExpected) state.missedNoteIds.add(nearestExpected.id);
        state.streak = 0;
        flashPad(noteIndex, 'wrong');
      }
      updatePracticeUI();
    }
  }

  function frequencyForMidi(midi, referencePitch = 440) {
    return Number(referencePitch) * Math.pow(2, (Number(midi) - 69) / 12);
  }

  function setMicStatus(message, stateName = '') {
    if (!els.micStatus) return;
    els.micStatus.textContent = message;
    els.micStatus.classList.remove('listening', 'heard', 'error');
    if (stateName) els.micStatus.classList.add(stateName);
  }

  function resetTunerDisplay(message = 'Turn on the microphone to begin') {
    state.tunerResult = null;
    if (!els.tunerPanel) return;
    els.tunerPanel.dataset.tone = 'neutral';
    els.tunerLabel.textContent = '...';
    els.tunerNoteName.textContent = state.micEnabled ? 'Strike a tongue' : 'Microphone off';
    els.tunerCents.textContent = message;
    els.tunerNeedle.style.left = '50%';
    els.tunerMeter.setAttribute('aria-valuenow', '0');
  }

  function updateTunerDisplay(result) {
    if (!result || !els.tunerPanel) {
      resetTunerDisplay('Pitch unclear. Try one firm strike.');
      return;
    }
    state.tunerResult = result;
    const note = playableNoteAt(result.noteIndex);
    const signedCents = Number.isFinite(result.signedCents) ? result.signedCents : null;
    const roundedCents = signedCents === null ? null : Math.round(signedCents);
    const inTune = roundedCents !== null && Math.abs(roundedCents) <= 12;
    const tone = roundedCents === null ? 'neutral' : inTune ? 'in-tune' : roundedCents < 0 ? 'flat' : 'sharp';
    const direction = inTune ? 'In tune' : roundedCents === null ? 'Pitch unstable' : roundedCents < 0 ? 'Slightly flat' : 'Slightly sharp';
    const centsText = roundedCents === null ? direction : `${roundedCents > 0 ? '+' : ''}${roundedCents} cents, ${direction.toLowerCase()}`;
    const meterCents = Math.max(-50, Math.min(50, roundedCents || 0));

    els.tunerPanel.dataset.tone = tone;
    els.tunerLabel.textContent = note.label;
    els.tunerNoteName.textContent = midiToName(note.midi);
    els.tunerCents.textContent = centsText;
    els.tunerNeedle.style.left = `${50 + meterCents}%`;
    els.tunerMeter.setAttribute('aria-valuenow', String(roundedCents || 0));
  }

  function updateMicUI() {
    if (!els.micBtn) return;
    els.micBtn.classList.toggle('active', state.micEnabled);
    els.micBtn.setAttribute('aria-pressed', String(state.micEnabled));
    els.micBtn.innerHTML = `${MIC_ICON} Microphone ${state.micEnabled ? 'on' : 'off'}`;
    if (!state.micEnabled) {
      setMicStatus(state.mode === 'tuner' ? 'Turn on the microphone to tune' : 'Use in Practice, Wait, or Tuner mode');
      if (state.mode === 'tuner') resetTunerDisplay();
    }
  }

  async function toggleMicrophone() {
    if (state.micEnabled) {
      stopMicrophone();
      showToast('Microphone turned off.', 'success');
      return;
    }
    await startMicrophone();
  }

  async function startMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('Microphone unavailable', 'error');
      showToast('Microphone access is unavailable here. Open the app through HTTPS or localhost in Chrome or Edge.', 'warning');
      return;
    }
    try {
      const context = await ensureAudio();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false
      });
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.12;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      state.micStream = stream;
      state.micSource = source;
      state.micAnalyser = analyser;
      state.micTimeData = new Float32Array(analyser.fftSize);
      state.micNoiseFloor = 0.008;
      state.micWasLoud = false;
      state.micEnabled = true;
      updateMicUI();
      setMicStatus(state.mode === 'tuner' ? 'Tuner listening... strike one tongue' : 'Listening... strike one tongue at a time', 'listening');
      if (state.mode === 'tuner') resetTunerDisplay('Listening for a clear pitch');
      cancelAnimationFrame(state.micAnimationId);
      state.micAnimationId = requestAnimationFrame(microphoneLoop);
      showToast('Microphone enabled. Strike one tongue at a time.', 'success');
    } catch (error) {
      state.micEnabled = false;
      updateMicUI();
      const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
      setMicStatus(denied ? 'Permission denied' : 'Could not start microphone', 'error');
      showToast(denied
        ? 'Microphone permission was denied. Allow microphone access in the browser and try again.'
        : 'The microphone could not be started. Check that another app is not using it.', 'warning');
    }
  }

  function stopMicrophone() {
    state.micEnabled = false;
    cancelAnimationFrame(state.micAnimationId);
    clearTimeout(state.micPendingTimer);
    state.micPendingTimer = 0;
    try { state.micSource?.disconnect(); } catch {}
    state.micStream?.getTracks().forEach(track => track.stop());
    state.micStream = null;
    state.micSource = null;
    state.micAnalyser = null;
    state.micTimeData = null;
    state.micWasLoud = false;
    updateMicUI();
  }

  function microphoneLoop(now) {
    if (!state.micEnabled || !state.micAnalyser || !state.micTimeData) return;
    state.micAnalyser.getFloatTimeDomainData(state.micTimeData);
    let sum = 0;
    for (let i = 0; i < state.micTimeData.length; i++) sum += state.micTimeData[i] * state.micTimeData[i];
    const rms = Math.sqrt(sum / state.micTimeData.length);
    const quiet = rms < Math.max(0.012, state.micNoiseFloor * 1.6);
    if (quiet) state.micNoiseFloor = state.micNoiseFloor * 0.985 + rms * 0.015;
    const threshold = Math.max(0.018, state.micNoiseFloor * 2.8);

    if (rms > threshold && !state.micWasLoud && now - state.micLastTrigger > 280) {
      state.micWasLoud = true;
      clearTimeout(state.micPendingTimer);
      state.micPendingTimer = window.setTimeout(analyseMicrophoneStrike, 48);
    } else if (rms < threshold * 0.58) {
      state.micWasLoud = false;
    }
    state.micAnimationId = requestAnimationFrame(microphoneLoop);
  }

  function analyseMicrophoneStrike() {
    if (!state.micEnabled || !state.micAnalyser || !state.micTimeData) return;
    state.micAnalyser.getFloatTimeDomainData(state.micTimeData);
    const result = recogniseInstrumentNote(state.micTimeData, state.audioContext.sampleRate);
    if (!result) {
      setMicStatus('Strike heard, pitch unclear', 'error');
      if (state.mode === 'tuner') resetTunerDisplay('Pitch unclear. Try one firm strike.');
      return;
    }
    state.micLastTrigger = performance.now();
    const note = playableNoteAt(result.noteIndex);
    setMicStatus(`Heard ${note.label} · ${midiToName(note.midi)}`, 'heard');
    flashPad(result.noteIndex, 'mic-heard', state.mode === 'tuner' ? 900 : 360);
    if (state.mode === 'tuner') updateTunerDisplay(result);
    if (state.mode === 'practice' || state.mode === 'wait') {
      handleUserNote(result.noteIndex, { source: 'microphone' });
    }
  }

  function recogniseInstrumentNote(samples, sampleRate) {
    let rmsSum = 0;
    for (let i = 0; i < samples.length; i++) rmsSum += samples[i] * samples[i];
    if (Math.sqrt(rmsSum / samples.length) < 0.012) return null;

    const pitch = autoCorrelatePitch(samples, sampleRate);
    const candidates = playableNotes().map(note => {
      const noteIndex = note.noteIndex;
      const frequency = frequencyForMidi(note.midi, state.instrument.referencePitch || 440);
      const fundamental = goertzelPower(samples, sampleRate, frequency);
      const harmonic2 = frequency * 2 < sampleRate / 2 ? goertzelPower(samples, sampleRate, frequency * 2) : 0;
      const harmonic3 = frequency * 3 < sampleRate / 2 ? goertzelPower(samples, sampleRate, frequency * 3) : 0;
      const spectral = fundamental + harmonic2 * 0.16 + harmonic3 * 0.06;
      let signedCents = pitch > 0 ? 1200 * Math.log2(pitch / frequency) : null;
      // Steel tongues have strong overtones. Fold an octave-doubled reading back onto
      // the configured fundamental before showing the tuner direction.
      if (signedCents !== null) {
        while (signedCents > 600) signedCents -= 1200;
        while (signedCents < -600) signedCents += 1200;
      }
      const cents = signedCents === null ? 999 : Math.abs(signedCents);
      const pitchBonus = pitch > 0 ? Math.max(0, 1 - Math.min(cents, 180) / 180) : 0;
      return { noteIndex, frequency, detectedPitch: pitch, signedCents, fundamental, spectral, cents, score: Math.log10(spectral + 1e-12) + pitchBonus * 1.35 };
    }).sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const second = candidates[1];
    if (!best || best.spectral <= 1e-8) return null;
    const closePitch = best.cents < 85;
    const clearSpectralLead = !second || best.spectral > second.spectral * 1.18;
    if (!closePitch && !clearSpectralLead) return null;
    return best;
  }

  function goertzelPower(samples, sampleRate, targetFrequency) {
    const omega = 2 * Math.PI * targetFrequency / sampleRate;
    const coefficient = 2 * Math.cos(omega);
    let q0 = 0, q1 = 0, q2 = 0;
    const length = samples.length;
    for (let i = 0; i < length; i++) {
      const windowed = samples[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (length - 1)));
      q0 = coefficient * q1 - q2 + windowed;
      q2 = q1;
      q1 = q0;
    }
    return Math.max(0, q1 * q1 + q2 * q2 - coefficient * q1 * q2) / (length * length);
  }

  function autoCorrelatePitch(buffer, sampleRate) {
    const size = buffer.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / size);
    if (rms < 0.012) return -1;

    const minFrequency = 80;
    const maxFrequency = 1600;
    const minOffset = Math.floor(sampleRate / maxFrequency);
    const maxOffset = Math.min(Math.floor(sampleRate / minFrequency), Math.floor(size / 2));
    let bestOffset = -1;
    let bestCorrelation = 0;
    const correlations = new Float32Array(maxOffset + 1);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
      let difference = 0;
      const limit = size - offset;
      for (let i = 0; i < limit; i++) difference += Math.abs(buffer[i] - buffer[i + offset]);
      const correlation = 1 - difference / limit;
      correlations[offset] = correlation;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    if (bestOffset < 0 || bestCorrelation < 0.72) return -1;
    const before = correlations[bestOffset - 1] || bestCorrelation;
    const after = correlations[bestOffset + 1] || bestCorrelation;
    const shift = (after - before) / Math.max(0.0001, 2 * (2 * bestCorrelation - before - after));
    return sampleRate / (bestOffset + Math.max(-1, Math.min(1, shift)));
  }

  function sectionLoopAvailable() {
    return state.mode === 'demo' || state.mode === 'practice';
  }

  function updateABLoopUI() {
    if (!els.abLoopBtn) return;
    const hasA = Number.isFinite(state.loopA);
    const hasB = Number.isFinite(state.loopB);
    const ready = hasA && hasB && state.loopB > state.loopA + 0.05;
    const allowed = sectionLoopAvailable();

    els.setABtn.disabled = !allowed || !state.duration;
    els.setBBtn.disabled = !allowed || !state.duration;
    els.abLoopBtn.disabled = !allowed || !ready;
    els.clearABBtn.disabled = !hasA && !hasB;
    els.abLoopBtn.classList.toggle('active', state.sectionLoop);
    els.abLoopBtn.setAttribute('aria-pressed', String(state.sectionLoop));
    els.abLoopBtn.textContent = state.sectionLoop ? 'A–B on' : 'Loop A–B';

    if (els.abMarkerA) {
      els.abMarkerA.hidden = !hasA || !state.duration;
      if (hasA && state.duration) els.abMarkerA.style.left = `${Math.max(0, Math.min(100, state.loopA / state.duration * 100))}%`;
    }
    if (els.abMarkerB) {
      els.abMarkerB.hidden = !hasB || !state.duration;
      if (hasB && state.duration) els.abMarkerB.style.left = `${Math.max(0, Math.min(100, state.loopB / state.duration * 100))}%`;
    }

    if (!allowed) {
      els.abLoopStatus.textContent = state.mode === 'wait'
        ? 'A–B looping is available in Demo and Practice modes.'
        : 'A–B looping is unavailable in Tuner mode.';
    } else if (ready) {
      els.abLoopStatus.textContent = `${state.sectionLoop ? 'Looping' : 'Section'} ${formatTime(state.loopA)} – ${formatTime(state.loopB)}.`;
    } else if (hasA) {
      els.abLoopStatus.textContent = `A is ${formatTime(state.loopA)}. Move the timeline and set B.`;
    } else if (hasB) {
      els.abLoopStatus.textContent = `B is ${formatTime(state.loopB)}. Set A before it.`;
    } else {
      els.abLoopStatus.textContent = 'Set A and B from the timeline to practise a section.';
    }
  }

  function seekToTime(time, { clearSectionHits = false } = {}) {
    const target = Math.max(0, Math.min(state.duration, Number(time) || 0));
    state.currentTime = target;
    if (clearSectionHits && Number.isFinite(state.loopA) && Number.isFinite(state.loopB)) {
      state.parsedNotes.forEach(note => {
        if (note.time >= state.loopA - 0.02 && note.time < state.loopB + 0.02) state.hitNotes.delete(note.id);
      });
    }
    if (state.mode === 'wait') {
      state.waitingIndex = state.parsedNotes.findIndex(note => note.time >= target - 0.01);
      if (state.waitingIndex < 0) state.waitingIndex = state.parsedNotes.length;
    }
    if (state.playing && state.mode !== 'wait') {
      state.playbackStartedAt = performance.now() - (target / state.speed) * 1000;
    }
    state.lastScheduledIndex = state.parsedNotes.findIndex(note => note.time >= target - 0.02) - 1;
    state.lastMetronomeBeat = Math.floor(target / state.secondsPerBeat) - 1;
    updatePracticeUI();
    renderFrame();
  }

  function setLoopPoint(which) {
    if (!sectionLoopAvailable() || !state.duration) {
      showToast('A–B looping is available in Demo and Practice modes.', 'warning');
      return;
    }
    const minimumGap = Math.max(0.4, (state.secondsPerBeat || 0.5) * 0.5);
    if (which === 'A') {
      state.loopA = Math.max(0, Math.min(state.currentTime, state.duration - minimumGap));
      if (Number.isFinite(state.loopB) && state.loopB <= state.loopA + minimumGap) state.loopB = null;
      showToast(`A set at ${formatTime(state.loopA)}.`, 'success');
    } else {
      if (!Number.isFinite(state.loopA)) state.loopA = Math.max(0, Math.min(state.currentTime - minimumGap, state.duration - minimumGap));
      state.loopB = Math.max(state.loopA + minimumGap, Math.min(state.duration, state.currentTime));
      state.loopB = Math.min(state.duration, state.loopB);
      if (state.loopB <= state.loopA + 0.05) {
        state.loopB = Math.min(state.duration, state.loopA + Math.max(minimumGap, state.secondsPerBeat || 0.5));
      }
      showToast(`B set at ${formatTime(state.loopB)}.`, 'success');
    }
    if (!(Number.isFinite(state.loopA) && Number.isFinite(state.loopB) && state.loopB > state.loopA + 0.05)) state.sectionLoop = false;
    updateTransportUI();
    updateABLoopUI();
  }

  function clearABLoop(showMessage = true) {
    state.sectionLoop = false;
    state.loopA = null;
    state.loopB = null;
    updateTransportUI();
    updateABLoopUI();
    if (showMessage) showToast('A–B section cleared.', 'success');
  }

  function toggleSectionLoop() {
    if (!sectionLoopAvailable()) {
      showToast('Switch to Demo or Practice to use A–B looping.', 'warning');
      return;
    }
    const ready = Number.isFinite(state.loopA) && Number.isFinite(state.loopB) && state.loopB > state.loopA + 0.05;
    if (!ready) {
      showToast('Set A and B first.', 'warning');
      return;
    }
    state.sectionLoop = !state.sectionLoop;
    if (state.sectionLoop) {
      state.loop = false;
      clearLoopTimer();
      if (state.currentTime < state.loopA || state.currentTime >= state.loopB) seekToTime(state.loopA, { clearSectionHits: true });
      showToast(`Looping ${formatTime(state.loopA)} – ${formatTime(state.loopB)}.`, 'success');
    } else {
      showToast('A–B loop paused. Your A and B points are saved.', 'success');
    }
    updateTransportUI();
    updateABLoopUI();
  }

  function restartSectionLoopCycle(now = performance.now()) {
    if (!state.sectionLoop || !Number.isFinite(state.loopA) || !Number.isFinite(state.loopB)) return;
    state.currentTime = state.loopA;
    state.streak = 0;
    state.parsedNotes.forEach(note => {
      if (note.time >= state.loopA - 0.02 && note.time < state.loopB + 0.02) state.hitNotes.delete(note.id);
    });
    state.playbackStartedAt = now - (state.currentTime / state.speed) * 1000;
    state.lastScheduledIndex = state.parsedNotes.findIndex(note => note.time >= state.currentTime - 0.02) - 1;
    state.lastMetronomeBeat = Math.floor(state.currentTime / state.secondsPerBeat) - 1;
    updatePracticeUI();
    renderFrame();
  }

  function setFocusMode(enabled) {
    state.focusMode = Boolean(enabled) && window.innerWidth <= 1100;
    document.body.classList.toggle('focus-mode', state.focusMode);
    if (els.focusModeBtn) {
      els.focusModeBtn.classList.toggle('active', state.focusMode);
      els.focusModeBtn.setAttribute('aria-pressed', String(state.focusMode));
      els.focusModeBtn.setAttribute('aria-label', state.focusMode ? 'Exit focus mode' : 'Enter focus mode');
      els.focusModeBtn.title = state.focusMode ? 'Exit focus mode' : 'Focus mode';
      els.focusModeBtn.innerHTML = `<span aria-hidden="true">${state.focusMode ? '×' : '⛶'}</span><b>${state.focusMode ? 'Exit Focus' : 'Focus Mode'}</b>`;
    }
    requestAnimationFrame(() => {
      resizeCanvas();
      renderFrame();
    });
  }

  function toggleFocusMode() {
    setFocusMode(!state.focusMode);
  }

  function collectMissedNotes() {
    const ids = new Set(state.missedNoteIds);
    if (state.mode === 'practice') {
      state.parsedNotes.forEach(note => {
        if (!state.hitNotes.has(note.id)) ids.add(note.id);
      });
    }
    return state.parsedNotes.filter(note => ids.has(note.id));
  }

  function songNoteIndexSet(song) {
    return new Set(parseSequence(song?.sequence || '', song?.bpm || 72).notes.map(note => note.noteIndex));
  }

  function recommendNextSong(currentSong) {
    if (!currentSong) return null;
    const currentDifficulty = songDifficulty(currentSong), currentNotes = songNoteIndexSet(currentSong);
    const order = { easy:0, medium:1, hard:2, expert:3 };
    return state.songs.filter(song => song && song.id !== currentSong.id).map(song => {
      const difficulty = songDifficulty(song), notes = songNoteIndexSet(song);
      const intersection = [...currentNotes].filter(note => notes.has(note)).length;
      const union = new Set([...currentNotes,...notes]).size || 1;
      const overlap = intersection/union, coverage = currentNotes.size ? intersection/currentNotes.size : 0;
      const distance = Math.abs((order[difficulty.level]??0)-(order[currentDifficulty.level]??0));
      const difficultyScore = distance===0 ? 10 : distance===1 ? 4 : 0;
      const bpmDistance = Math.abs((Number(song.bpm)||72)-(Number(currentSong.bpm)||72));
      const tempoScore = Math.max(0,2.5-bpmDistance/35);
      const scaleScore = String(song.scaleType||'')===String(currentSong.scaleType||'') ? 1.5 : 0;
      return { song, difficulty, intersection, score:difficultyScore+overlap*9+coverage*4+tempoScore+scaleScore };
    }).sort((a,b) => b.score-a.score || b.intersection-a.intersection || String(a.song.title).localeCompare(String(b.song.title)))[0] || null;
  }

  function renderRecommendedNext(song) {
    if (!els.resultRecommendation || !els.resultRecommendedBtn) return;
    const rec = recommendNextSong(song);
    state.recommendedSongId = rec?.song?.id || null;
    els.resultRecommendation.hidden = !rec;
    if (!rec) { els.resultRecommendedBtn.innerHTML=''; return; }
    const next = rec.song, title = songTitleParts(next.title), difficulty = rec.difficulty;
    const shared = rec.intersection===1 ? '1 shared pitch' : `${rec.intersection} shared pitches`;
    els.resultRecommendedBtn.innerHTML = `${songCoverMarkup(next)}<span class="result-recommended-copy"><span><strong>${escapeHtml(title.displayTitle)}</strong><em class="difficulty-badge" data-level="${difficulty.level}">${difficulty.label}</em></span><small>${shared} · ${next.bpm} BPM</small></span><b class="result-recommended-arrow" aria-hidden="true">→</b>`;
  }

  function playRecommendedFromResults() {
    const id = state.recommendedSongId;
    if (!id || !state.songs.some(song => song.id===id)) return;
    if (els.resultDialog?.open) els.resultDialog.close();
    selectSong(id);
    togglePlayback().catch(()=>{});
  }

  function showSessionResults() {
    if (!els.resultDialog) return;
    const song = selectedSong();
    const title = songTitleParts(song?.title || 'Song').displayTitle;
    const training = state.mode === 'practice' || state.mode === 'wait';
    const missed = training ? collectMissedNotes() : [];
    state.lastResultMissed = missed.map(note => note.id);
    const total = state.parsedNotes.length;
    const hitCount = state.mode === 'wait' ? total : state.hitNotes.size;
    const inputAccuracy = state.attempts ? Math.max(0, Math.min(100, Math.round((state.score / state.attempts) * 100))) : 0;

    els.resultTitle.textContent = `${title} complete`;
    if (training) {
      els.resultSummary.textContent = missed.length
        ? `${missed.length} ${missed.length === 1 ? 'note needs' : 'notes need'} another look.`
        : 'Great run — no missed notes to practise.';
      els.resultStats.hidden = false;
      els.resultHitValue.textContent = `${Math.min(hitCount, total)}/${total}`;
      els.resultAccuracyValue.textContent = `${inputAccuracy}%`;
      els.resultStreakValue.textContent = String(state.bestStreak);
      els.resultMistakes.textContent = missed.length
        ? `Practice mistakes will loop a short phrase around your first missed section.`
        : 'You can replay the song or continue with the recommended next song.';
      els.practiceMistakesBtn.hidden = !missed.length;
    } else {
      els.resultSummary.textContent = `You reached the end of ${title}.`;
      els.resultStats.hidden = true;
      els.resultMistakes.textContent = 'Replay it, choose the recommendation below, or continue to the next song in the list.';
      els.practiceMistakesBtn.hidden = true;
    }
    renderRecommendedNext(song);
    if (!els.resultDialog.open) els.resultDialog.showModal();
  }

  function replayFromResults() {
    if (els.resultDialog?.open) els.resultDialog.close();
    restartSong();
    togglePlayback().catch(() => {});
  }

  function selectNextSongFromResults() {
    if (els.resultDialog?.open) els.resultDialog.close();
    if (!state.songs.length) return;
    const currentIndex = Math.max(0, state.songs.findIndex(song => song.id === state.selectedId));
    selectSong(state.songs[(currentIndex + 1) % state.songs.length].id);
  }

  function practiceMistakesFromResults() {
    const missedIds = [...state.lastResultMissed];
    const missed = state.parsedNotes.filter(note => missedIds.includes(note.id)).sort((a, b) => a.time - b.time);
    if (!missed.length) {
      showToast('No missed notes to practise.', 'success');
      return;
    }
    const first = missed[0];
    const clusterWindow = Math.max(8, (state.secondsPerBeat || 0.5) * 12);
    const cluster = missed.filter(note => note.time <= first.time + clusterWindow);
    const last = cluster[cluster.length - 1] || first;
    const padBefore = Math.max(1, (state.secondsPerBeat || 0.5) * 2);
    const padAfter = Math.max(1.5, (state.secondsPerBeat || 0.5) * 3);
    const start = Math.max(0, first.time - padBefore);
    const end = Math.min(state.duration, Math.max(last.time + padAfter, start + Math.max(5, (state.secondsPerBeat || 0.5) * 8)));

    if (els.resultDialog?.open) els.resultDialog.close();
    setMode('practice');
    state.loop = false;
    state.loopA = start;
    state.loopB = end;
    state.sectionLoop = true;
    seekToTime(start, { clearSectionHits: true });
    updateTransportUI();
    updateABLoopUI();
    showToast(`Practising missed section ${formatTime(start)} – ${formatTime(end)}.`, 'success');
    togglePlayback().catch(() => {});
  }

  async function togglePlayback() {
    if (state.mode === 'tuner') {
      if (!state.micEnabled) await startMicrophone();
      return;
    }
    if (state.playing) {
      pausePlayback();
      return;
    }
    await ensureAudio();
    if (state.sectionLoop && Number.isFinite(state.loopA) && Number.isFinite(state.loopB) && state.currentTime >= state.loopB - .02) {
      seekToTime(state.loopA, { clearSectionHits: true });
    } else if (state.currentTime >= state.duration - .02) {
      restartSong();
    }
    if (state.mode === 'wait') {
      state.playing = true;
      state.waitingIndex = state.parsedNotes.findIndex(n => n.time >= state.currentTime - .01);
      if (state.waitingIndex < 0) state.waitingIndex = 0;
      updateTransportUI();
      updatePracticeUI();
      renderFrame();
      return;
    }
    if (els.countInToggle.checked && state.currentTime < .02) {
      runCountIn();
    } else {
      startPlaybackClock();
    }
  }

  function runCountIn() {
    state.countInActive = true;
    state.countInRemaining = 3;
    els.countIn.hidden = false;
    els.countIn.textContent = '3';
    updateTransportUI();
    playClick(true).catch(() => {});
    const timer = window.setInterval(() => {
      state.countInRemaining -= 1;
      if (state.countInRemaining <= 0) {
        clearInterval(timer);
        state.countInActive = false;
        els.countIn.hidden = true;
        startPlaybackClock();
      } else {
        els.countIn.textContent = String(state.countInRemaining);
        playClick(state.countInRemaining === 1).catch(() => {});
      }
    }, COUNT_IN_INTERVAL_MS);
  }

  function startPlaybackClock() {
    state.playing = true;
    state.playbackStartedAt = performance.now() - (state.currentTime / state.speed) * 1000;
    state.lastScheduledIndex = state.parsedNotes.findIndex(n => n.time >= state.currentTime - .02) - 1;
    state.lastMetronomeBeat = Math.floor(state.currentTime / state.secondsPerBeat) - 1;
    state.lastVisualAt = 0;
    updateTransportUI();
    cancelAnimationFrame(state.animationId);
    state.animationId = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.playing || state.mode === 'wait' || document.hidden) return;
    state.currentTime = Math.min(state.duration, ((now - state.playbackStartedAt) / 1000) * state.speed);
    scheduleDueAudio();
    if (state.metronome) scheduleMetronome();
    // Audio stays checked every animation frame, while the expensive canvases can run at
    // ~50fps on touch layouts. The motion remains visually smooth and frees GPU/CPU time.
    const compactVisuals = els.noteCanvas.clientWidth <= 1100 || window.matchMedia?.('(pointer: coarse)').matches;
    const visualInterval = compactVisuals ? 20 : 0;
    if (!visualInterval || !state.lastVisualAt || now - state.lastVisualAt >= visualInterval) {
      state.lastVisualAt = now;
      updatePracticeUI();
      renderFrame();
    }
    if (state.sectionLoop && Number.isFinite(state.loopB) && state.currentTime >= state.loopB - .002) {
      restartSectionLoopCycle(now);
      state.animationId = requestAnimationFrame(tick);
      return;
    }
    if (state.currentTime >= state.duration) {
      finishPlayback();
      return;
    }
    state.animationId = requestAnimationFrame(tick);
  }

  function scheduleDueAudio() {
    if (state.mode === 'practice') return;
    for (let i = state.lastScheduledIndex + 1; i < state.parsedNotes.length; i++) {
      const note = state.parsedNotes[i];
      if (note.time <= state.currentTime + .03) {
        playTone(note.noteIndex).catch(() => {});
        const flashDuration = Math.max(170, Math.min(420, note.duration * 450));
        flashPad(note.noteIndex, 'active', flashDuration, note.label);
        state.lastScheduledIndex = i;
      } else break;
    }
  }

  function scheduleMetronome() {
    const beat = Math.floor(state.currentTime / state.secondsPerBeat);
    if (beat > state.lastMetronomeBeat) {
      playClick(beat % 4 === 0).catch(() => {});
      state.lastMetronomeBeat = beat;
    }
  }

  function clearLoopTimer() {
    clearTimeout(state.loopTimer);
    state.loopTimer = 0;
  }

  function toggleLoop() {
    state.loop = !state.loop;
    if (state.loop) state.sectionLoop = false;
    if (!state.loop) clearLoopTimer();
    updateTransportUI();
    updateABLoopUI();
    showToast(state.loop ? 'Whole-song loop enabled.' : 'Whole-song loop disabled.', 'success');
  }

  function startNextLoop() {
    state.loopTimer = 0;
    if (!state.loop || state.mode === 'tuner' || state.playing) return;
    restartSong();
    if (state.mode === 'wait') {
      state.playing = true;
      state.waitingIndex = 0;
      updateTransportUI();
      updatePracticeUI();
      renderFrame();
      return;
    }
    startPlaybackClock();
  }

  function pausePlayback() {
    clearLoopTimer();
    state.playing = false;
    state.countInActive = false;
    cancelAnimationFrame(state.animationId);
    els.countIn.hidden = true;
    updateTransportUI();
  }

  function stopPlayback(reset = true) {
    pausePlayback();
    if (reset) restartSong();
  }

  function restartSong() {
    clearLoopTimer();
    state.playing = false;
    state.currentTime = 0;
    state.pausedAt = 0;
    state.lastScheduledIndex = -1;
    state.lastMetronomeBeat = -1;
    state.score = 0;
    state.attempts = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.waitingIndex = 0;
    state.hitNotes.clear();
    state.missedNoteIds.clear();
    updateTransportUI();
    updatePracticeUI();
    renderFrame();
  }

  function finishPlayback() {
    state.playing = false;
    state.currentTime = state.duration;
    updateTransportUI();
    updatePracticeUI();
    renderFrame();
    if (state.loop && state.mode !== 'tuner') {
      state.loopTimer = window.setTimeout(startNextLoop, 700);
      return;
    }
    if (state.mode !== 'tuner') showSessionResults();
  }

  function updateTransportUI() {
    const isPaused = state.playing || state.countInActive;
    els.playBtn.innerHTML = isPaused
      ? '<span class="pause-icon" aria-hidden="true"><span></span><span></span></span>'
      : '<span class="play-icon" aria-hidden="true"></span>';
    els.playBtn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    els.loopBtn.classList.toggle('active', state.loop);
    els.loopBtn.setAttribute('aria-pressed', String(state.loop));
    els.loopBtn.setAttribute('aria-label', state.loop ? 'Turn off song loop' : 'Loop song');
    els.loopBtn.title = state.loop ? 'Turn off song loop' : 'Loop song';
    els.metronomeBtn.classList.toggle('active', state.metronome);
    updateABLoopUI();
  }

  function setMode(mode) {
    pausePlayback();
    restartSong();
    state.mode = mode;
    if (!sectionLoopAvailable()) state.sectionLoop = false;
    document.querySelectorAll('.segment').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    const tunerMode = mode === 'tuner';
    els.trainerGrid?.classList.toggle('tuner-mode', tunerMode);
    if (els.tunerPanel) els.tunerPanel.hidden = !tunerMode;
    const hints = {
      demo: 'Listen and watch the notes.',
      practice: 'Play on screen, keyboard, or enable the microphone.',
      wait: 'The song advances after the correct tap, key, or recognised drum note.',
      tuner: 'Strike one tongue at a time. The matching tongue and pitch meter will respond.'
    };
    els.modeHint.textContent = hints[mode];
    if (tunerMode) {
      if (state.visualMode !== 'radial') {
        state.visualMode = 'radial';
        applyVisualMode();
      }
      resetTunerDisplay(state.micEnabled ? 'Listening for a clear pitch' : 'Turn on the microphone to begin');
      if (!state.micEnabled) startMicrophone();
    }
    updateTransportUI();
    updatePracticeUI();
    renderFrame();
  }

  function applyVisualMode() {
    const radial = state.visualMode === 'radial';
    els.noteStage.classList.toggle('radial-view', radial);
    if (radial) startAmbientLoop(); else stopAmbientLoop();
    els.trainerGrid?.classList.toggle('radial-layout', radial);
    document.querySelectorAll('.view-segment').forEach(button => {
      button.classList.toggle('active', button.dataset.view === state.visualMode);
      button.setAttribute('aria-pressed', String(button.dataset.view === state.visualMode));
    });
    if (els.mobileViewToggleBtn) {
      const nextView = radial ? 'Falling lanes' : 'Drum centre';
      els.mobileViewToggleBtn.dataset.view = state.visualMode;
      els.mobileViewToggleBtn.setAttribute('aria-label', `Switch display to ${nextView}`);
      els.mobileViewToggleBtn.title = `Switch to ${nextView}`;
    }
    window.requestAnimationFrame(resizeCanvas);
  }

  function setVisualMode(view) {
    if (!['lanes', 'radial'].includes(view) || view === state.visualMode) return;
    state.visualMode = view;
    localStorage.setItem(STORAGE_VIEW, view);
    applyVisualMode();
    showToast(view === 'radial' ? 'Centre-drum display enabled.' : 'Falling-lane display enabled.', 'success');
  }

  function formatSequenceIntoLines(sequence, barsPerLine = 4) {
    const tokens = String(sequence || '').trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return '';
    if (!tokens.includes('|')) {
      const lines = [];
      for (let index = 0; index < tokens.length; index += 16) {
        lines.push(tokens.slice(index, index + 16).join(' '));
      }
      return lines.join('\n');
    }
    const lines = [];
    let line = [];
    let bars = 0;
    tokens.forEach(token => {
      line.push(token);
      if (token !== '|') return;
      bars += 1;
      if (bars >= barsPerLine) {
        lines.push(line.join(' '));
        line = [];
        bars = 0;
      }
    });
    if (line.length) lines.push(line.join(' '));
    return lines.join('\n');
  }

  function sequenceOffsetAfterLogicalCharacters(text, characterCount, afterWhitespace = false) {
    let offset = 0;
    let seen = 0;
    while (offset < text.length && seen < characterCount) {
      if (!/\s/u.test(text[offset])) seen += 1;
      offset += 1;
    }
    if (afterWhitespace) {
      while (offset < text.length && /\s/u.test(text[offset])) offset += 1;
    }
    return offset;
  }

  // Line formatting changes whitespace only, so map the selection by musical
  // characters and keep the caret attached to the same note.
  function autoFormatSequenceInput() {
    const input = els.sequenceInput;
    const value = input.value;
    const formatted = formatSequenceIntoLines(value);
    if (formatted === value) return false;
    const oldStart = input.selectionStart ?? value.length;
    const oldEnd = input.selectionEnd ?? oldStart;
    const startText = value.slice(0, oldStart);
    const endText = value.slice(0, oldEnd);
    const startCount = [...startText].filter(character => !/\s/u.test(character)).length;
    const endCount = [...endText].filter(character => !/\s/u.test(character)).length;
    input.value = formatted;
    const start = sequenceOffsetAfterLogicalCharacters(formatted, startCount, /\s$/u.test(startText));
    const end = sequenceOffsetAfterLogicalCharacters(formatted, endCount, /\s$/u.test(endText));
    input.setSelectionRange(start, end);
    rememberSequenceSelection();
    return true;
  }

  function formatSequenceEditor() {
    syncEditorTimelineFromCleanInput();
    autoFormatSequenceInput();
    renderSequenceBackdrop();
    els.sequenceInput.focus();
  }

  function openEditor(song = null) {
    state.editorSongId = song?.id || null;
    state.editorDraftKey = state.editorSongId
      ? `song:${state.editorSongId}`
      : song?.sourceSongId
        ? `copy:${song.sourceSongId}`
        : 'new';
    els.editorHeading.textContent = song ? 'Edit song' : 'Create a song';
    const savedCustomSong = state.editorSongId
      ? state.songs.find(item => item.id === state.editorSongId && !item.builtIn)
      : null;
    els.deleteEditorBtn.hidden = !savedCustomSong;
    els.songTitleInput.value = song?.title || '';
    setSongBpmValue(song?.bpm || 120);
    const currentScale = state.instrument.scaleType === 'custom' ? 'any' : state.instrument.scaleType;
    els.songScaleSelect.value = song?.scaleType || currentScale || 'any';
    state.editorTimeline = timelineFromStoredSequence(song?.sequence || '');
    if (Array.isArray(song?.lyrics)) {
      song.lyrics.forEach((lyric, index) => {
        if (state.editorTimeline[index]) state.editorTimeline[index].lyric = String(lyric || '');
      });
    }
    clearTimingSelection();
    els.sequenceInput.value = formatSequenceIntoLines(cleanSequenceFromTimeline());
    renderSequenceBackdrop();
    if (els.draftNotice) els.draftNotice.hidden = true;
    const draft = readDraft();
    if (draftMatchesEditor(draft)) applyDraft(draft);
    if (els.expressiveTimingToggle) els.expressiveTimingToggle.checked = state.expressiveTimingEnabled;
    state.editorSelectionStart = els.sequenceInput.value.length;
    state.editorSelectionEnd = els.sequenceInput.value.length;
    renderMiniPads();
    renderTimingEditor();
    els.editorDialog.showModal();
    window.setTimeout(() => els.songTitleInput.focus(), 30);
  }


  // ---------------------------------------------------------------- copy / print / drafts

  function plainTextColumnWidth(value) {
    return [...String(value || '').normalize('NFD')]
      .filter(character => !/\p{M}/u.test(character)).length;
  }

  // Plain text cannot draw Jianpu beams, so Copy text uses '-' for a Quick run and
  // '=' for a Very quick run on a second aligned row. Spaces between consecutive
  // notes in the same run are filled to make one continuous line, matching the sheet.
  function jianpuCopyText() {
    const sourceLines = String(els.sequenceInput?.value || '').trim().split(/\n/u);
    const output = [];
    let timelineIndex = 0;
    sourceLines.forEach(sourceLine => {
      const tokens = sourceLine.trim().split(/\s+/u).filter(Boolean);
      if (!tokens.length) return;
      const noteLine = tokens.join(' ');
      const timingColumns = [];
      let column = 0;
      let previousMark = '';
      let previousWasBar = true;
      tokens.forEach((token, tokenIndex) => {
        if (tokenIndex) column += 1;
        const item = state.editorTimeline[timelineIndex++];
        const width = Math.max(1, plainTextColumnWidth(token));
        const beams = item?.core === '|' ? 0 : jianpuBeamCount(item?.durationBeats);
        const mark = beams >= 2 ? '=' : beams === 1 ? '-' : '';
        if (mark) {
          if (tokenIndex && previousMark === mark && !previousWasBar) timingColumns[column - 1] = mark;
          for (let offset = 0; offset < width; offset += 1) timingColumns[column + offset] = mark;
        }
        previousMark = mark;
        previousWasBar = item?.core === '|';
        column += width;
      });
      const timingLine = Array.from({ length: column }, (_, index) => timingColumns[index] || ' ')
        .join('').trimEnd();
      output.push(noteLine);
      if (timingLine.trim()) output.push(timingLine);
    });
    return output.join('\n');
  }

  async function copySequenceText() {
    syncEditorTimelineFromCleanInput();
    stripTimingShortcutsFromInput();
    autoFormatSequenceInput();
    renderSequenceBackdrop();
    const text = jianpuCopyText();
    if (!text) {
      showToast('There is nothing to copy yet.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Note sequence copied.', 'success');
      return;
    } catch {
      // Clipboard API needs a secure context, which file:// is not. Fall back to a
      // throwaway textarea and the legacy copy command.
    }
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    scratch.style.position = 'fixed';
    scratch.style.top = '-1000px';
    document.body.appendChild(scratch);
    scratch.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    document.body.removeChild(scratch);
    showToast(copied ? 'Note sequence copied.' : 'Copy failed. Select the text and press Ctrl+C.', copied ? 'success' : 'warning');
  }

  // The print sheet is a plain snapshot of the on-screen music, so what prints is exactly
  // what the editor shows. Print CSS hides the rest of the page.
  function buildPrintSheet() {
    if (!els.printSheet) return false;
    // Read the sequence box straight into the timeline so the PDF matches what is on
    // screen whether or not the expressive sheet is currently showing.
    syncEditorTimelineFromCleanInput();
    if (!state.editorTimeline.some(item => item.core && item.core !== '|')) return false;

    const music = document.createElement('div');
    music.className = 'timing-token-strip';
    if (!buildSheetInto(music, { interactive: false })) return false;
    music.querySelectorAll('.timing-token').forEach(token => {
      token.classList.remove('selected', 'is-anchor');
      token.removeAttribute('aria-pressed');
    });
    // If the song has any lyrics at all, every note gets a lyric line even when the word
    // is blank. Otherwise the tokens end up different heights and the numbers stop
    // lining up across the bar. A song with no lyrics gets no lines at all.
    const tokens = [...music.querySelectorAll('.timing-token[data-timeline-index]')];
    const lyricFor = token => String(state.editorTimeline[Number(token.dataset.timelineIndex)]?.lyric || '').trim();
    const hasLyrics = tokens.some(token => lyricFor(token));
    if (hasLyrics) {
      tokens.forEach(token => {
        const printed = document.createElement('span');
        printed.className = 'timing-lyric-print';
        printed.textContent = lyricFor(token);
        token.appendChild(printed);
      });
    }
    music.classList.toggle('has-lyrics', hasLyrics);

    const title = els.songTitleInput?.value.trim() || 'Untitled song';
    const bpm = Number(els.songBpmInput?.value) || 72;
    const scaleName = SCALE_NAMES[els.songScaleSelect?.value] || '';
    const drum = state.instrument ? `${state.instrument.count}-note drum` : '';
    const key = state.instrument ? `${state.instrument.key} ${scaleName}`.trim() : scaleName;
    // Counted off the sheet itself, and chord members count individually, so this matches
    // the note count shown beside the song in the sidebar.
    const noteCount = state.editorTimeline.reduce((total, item) => {
      const core = String(item.core || '');
      if (!core || core === '|' || isRestCore(core)) return total;
      return total + core.split('+').filter(Boolean).length;
    }, 0);
    els.printSheet.innerHTML = '';
    const heading = document.createElement('h1');
    heading.textContent = title;
    const meta = document.createElement('p');
    meta.className = 'print-meta';
    meta.textContent = [`${bpm} BPM`, drum, key, `${noteCount} note${noteCount === 1 ? '' : 's'} in the song`]
      .filter(Boolean).join('  \u00b7  ');
    els.printSheet.append(heading, meta, music);
    return true;
  }

  function exportSheetPdf() {
    if (!buildPrintSheet()) {
      showToast('Add some notes before exporting.', 'warning');
      return;
    }
    document.body.classList.add('printing');
    const cleanUp = () => {
      document.body.classList.remove('printing');
      window.removeEventListener('afterprint', cleanUp);
    };
    window.addEventListener('afterprint', cleanUp);
    // Give the clone a frame to lay out before the dialog freezes rendering.
    requestAnimationFrame(() => {
      window.print();
      setTimeout(cleanUp, 800);
    });
  }

  function currentDraft() {
    return {
      songId: state.editorSongId || null,
      draftKey: state.editorDraftKey,
      title: els.songTitleInput?.value || '',
      bpm: els.songBpmInput?.value || '',
      scaleType: els.songScaleSelect?.value || '',
      sequence: els.sequenceInput?.value || '',
      timeline: (state.editorTimeline || []).map(item => ({
        core: item.core,
        durationBeats: item.durationBeats,
        lyric: item.lyric || ''
      })),
      savedAt: Date.now()
    };
  }

  function draftHasContent(draft) {
    return Boolean(draft && (draft.title.trim() || draft.sequence.trim()));
  }

  function writeDraft() {
    const draft = currentDraft();
    if (!draftHasContent(draft)) {
      clearDraft();
      return;
    }
    try { localStorage.setItem(STORAGE_EDITOR_DRAFT, JSON.stringify(draft)); } catch {}
  }

  function queueDraftSave() {
    if (!els.editorDialog?.open) return;
    clearTimeout(state.draftSaveTimer);
    state.draftSaveTimer = setTimeout(writeDraft, 400);
  }

  function readDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_EDITOR_DRAFT);
      if (!raw) return null;
      const draft = JSON.parse(raw);
      return draftHasContent(draft) ? draft : null;
    } catch {
      return null;
    }
  }

  function draftMatchesEditor(draft) {
    if (!draft) return false;
    if (draft.draftKey) return draft.draftKey === state.editorDraftKey;
    if (!state.editorSongId) return state.editorDraftKey === 'new' && !draft.songId;
    return draft.songId === state.editorSongId;
  }

  function clearDraft() {
    clearTimeout(state.draftSaveTimer);
    try { localStorage.removeItem(STORAGE_EDITOR_DRAFT); } catch {}
    if (els.draftNotice) els.draftNotice.hidden = true;
  }

  function setSongBpmValue(bpm) {
    const select = els.songBpmInput;
    if (!select) return;
    select.querySelectorAll('option[data-song-tempo]').forEach(option => option.remove());
    const value = String(Math.round(Number(bpm) || 120));
    const existing = Array.from(select.options).some(option => option.value === value);
    if (!existing) {
      const option = new Option(`${value} BPM (Song tempo)`, value);
      option.dataset.songTempo = 'true';
      const nextOption = Array.from(select.options).find(item => Number(item.value) > Number(value));
      select.insertBefore(option, nextOption || null);
    }
    select.value = value;
  }

  function applyDraft(draft) {
    els.songTitleInput.value = draft.title || '';
    if (draft.bpm) setSongBpmValue(draft.bpm);
    if (draft.scaleType) els.songScaleSelect.value = draft.scaleType;
    els.sequenceInput.value = draft.sequence || '';
    state.editorTimeline = Array.isArray(draft.timeline) && draft.timeline.length
      ? draft.timeline.map(item => {
        const rawCore = String(item.core);
        const parsedCore = sequenceInputItems(rawCore)[0] || { core: rawCore, durationOverride: null };
        return {
          core: parsedCore.core,
          durationBeats: parsedCore.durationOverride
            ?? (Number(item.durationBeats) || (parsedCore.core === '|' ? 0 : 1)),
          lyric: String(item.lyric || '')
        };
      })
      : timelineFromStoredSequence(draft.sequence || '');
    syncEditorTimelineFromCleanInput();
    stripTimingShortcutsFromInput();
    els.sequenceInput.value = formatSequenceIntoLines(cleanSequenceFromTimeline());
    renderSequenceBackdrop();
    clearTimingSelection();
    if (els.draftNotice) {
      els.draftNotice.hidden = false;
      const when = new Date(draft.savedAt || Date.now());
      const stamp = Number.isNaN(when.getTime()) ? '' : ` from ${when.toLocaleString()}`;
      els.draftNoticeText.textContent = `Unsaved draft restored${stamp}.`;
    }
  }

  function saveEditorSong(event) {
    event.preventDefault();
    clearInvalidFields(els.editorForm);
    const title = els.songTitleInput.value.trim();
    const bpm = Number(els.songBpmInput.value);
    const cleanSequence = els.sequenceInput.value.trim();
    const sequence = editorSequenceWithDurations();
    const scaleType = els.songScaleSelect.value;
    const folder = 'library';
    const invalid = [];
    if (!title) invalid.push(els.songTitleInput);
    if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) invalid.push(els.songBpmInput);
    if (!cleanSequence) invalid.push(els.sequenceInput);
    if (invalid.length) {
      invalid.forEach(field => field.classList.add('invalid-field'));
      focusInvalidField(invalid[0]);
      showToast('Please add a title, a tempo from 30 to 240 BPM, and a note sequence.', 'warning');
      return;
    }
    if (cleanSequence.includes(':')) {
      els.sequenceInput.classList.add('invalid-field');
      focusInvalidField(els.sequenceInput);
      showToast('Keep this box to note numbers only. Use Music sheet (Jianpu) to change the timing.', 'warning');
      return;
    }
    const stats = sequenceStats(sequence);
    if (stats.invalidTokens.length) {
      els.sequenceInput.classList.add('invalid-field');
      focusInvalidField(els.sequenceInput);
      showToast(`These notes could not be read: ${stats.invalidTokens.slice(0, 3).join(', ')}.`, 'warning');
      return;
    }
    const parsed = parseSequence(sequence, bpm);
    if (!parsed.notes.length) {
      els.sequenceInput.classList.add('invalid-field');
      focusInvalidField(els.sequenceInput);
      showToast('No valid notes were found. Check that the song numbers match your tongue labels.', 'warning');
      return;
    }

    const existing = state.songs.find(s => s.id === state.editorSongId);
    if (existing && !existing.builtIn) {
      existing.title = title;
      existing.bpm = bpm;
      existing.sequence = sequence;
      existing.scaleType = scaleType;
      existing.folder = folder;
      existing.lyrics = state.editorTimeline.map(item => item.lyric || '');
      state.selectedId = existing.id;
    } else {
      const song = {
        id: `song-${Date.now().toString(36)}`,
        title,
        bpm,
        sequence,
        scaleType,
        folder,
        lyrics: state.editorTimeline.map(item => item.lyric || ''),
        builtIn: false
      };
      state.songs.push(song);
      state.selectedId = song.id;
    }
    clearDraft();
    saveCustomSongs();
    els.editorDialog.close();
    selectSong(state.selectedId);
    showToast('Song saved privately in this browser. Export a backup for another device.', 'success');
  }

  function rememberSequenceSelection() {
    if (document.activeElement !== els.sequenceInput) return;
    state.editorSelectionStart = els.sequenceInput.selectionStart ?? els.sequenceInput.value.length;
    state.editorSelectionEnd = els.sequenceInput.selectionEnd ?? state.editorSelectionStart;
  }


  // ---- typing in the sequence box -------------------------------------------------
  // Notes separate themselves, so a song can be typed as "1212" rather than "1 2 1 2".
  // A digit only keeps the caret inside the current token while a longer label could
  // still be completed, which is what lets multi-character labels like "10" be typed.
  function sequenceLabelBases() {
    const bases = new Set();
    playableNotes().forEach(note => bases.add(splitOctaveMark(note.label).base));
    return bases;
  }

  // Split compact input such as 123 into playable labels. The fallback search also
  // supports custom multi-digit tongue labels when the current instrument uses them.
  function splitCompactDigitRun(run) {
    const value = String(run || '');
    const bases = [...sequenceLabelBases()].filter(base => /^\d+$/u.test(base));
    if (!value || bases.includes(value)) return [value];
    const byLength = bases.sort((a, b) => b.length - a.length);
    const memo = new Map();
    const visit = offset => {
      if (offset === value.length) return [];
      if (memo.has(offset)) return memo.get(offset);
      let best = null;
      byLength.forEach(base => {
        if (!value.startsWith(base, offset)) return;
        const rest = visit(offset + base.length);
        if (!rest) return;
        const candidate = [base, ...rest];
        if (!best || candidate.length < best.length) best = candidate;
      });
      memo.set(offset, best);
      return best;
    };
    return visit(0) || [...value];
  }

  function normalizeSequenceTextInput(text) {
    let value = String(text || '');
    // Pasted bars become their own token, while "5 =" is accepted as the same timing
    // shortcut as "5=".
    value = value.replace(/([^\s])\|/gu, '$1 |').replace(/\|([^\s])/gu, '| $1');
    value = value.replace(/(\S)-(?=\S)/gu, '$1 - ');
    value = value.replace(/([^\s|])[\t ]+([_=])(?=\s|$)/gu, '$1$2');
    return value.split(/(\s+)/u).map(part => {
      if (!part || /^\s+$/u.test(part)) return part;
      const compact = part.match(/^(\d{2,})([_=])?$/u);
      if (!compact) return part;
      const notes = splitCompactDigitRun(compact[1]);
      if (notes.length <= 1) return part;
      if (compact[2]) notes[notes.length - 1] += compact[2];
      return notes.join(' ');
    }).join('');
  }

  function normalizeSequenceInputValue() {
    const input = els.sequenceInput;
    const value = input.value;
    const normalized = normalizeSequenceTextInput(value);
    if (normalized === value) return false;
    const start = normalizeSequenceTextInput(value.slice(0, input.selectionStart ?? value.length)).length;
    const end = normalizeSequenceTextInput(value.slice(0, input.selectionEnd ?? value.length)).length;
    input.value = normalized;
    input.setSelectionRange(Math.min(start, normalized.length), Math.min(end, normalized.length));
    rememberSequenceSelection();
    return true;
  }

  // _ and = are keyboard commands, not visible notation. Pasted legacy shorthand is
  // absorbed into editorTimeline and then removed without moving the caret unexpectedly.
  function stripTimingShortcutsFromInput() {
    const input = els.sequenceInput;
    const value = input.value;
    const strip = text => text.replace(/([_=])(?=\s|$)/gu, '');
    const cleaned = strip(value);
    if (cleaned === value) return false;
    const start = strip(value.slice(0, input.selectionStart ?? value.length)).length;
    const end = strip(value.slice(0, input.selectionEnd ?? value.length)).length;
    input.value = cleaned;
    input.setSelectionRange(Math.min(start, cleaned.length), Math.min(end, cleaned.length));
    rememberSequenceSelection();
    return true;
  }

  function timingShortcutIndexBeforeCaret() {
    const input = els.sequenceInput;
    const before = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\s+$/u, '');
    if (!/[_=]$/u.test(before)) return -1;
    return Math.max(-1, (before.match(/\S+/gu) || []).length - 1);
  }

  function syncInputTimingMarkers() {
    stripTimingShortcutsFromInput();
  }

  function tokenBeforeCaret(value, caret) {
    const start = value.lastIndexOf(' ', caret - 1) + 1;
    const newline = value.lastIndexOf('\n', caret - 1) + 1;
    return value.slice(Math.max(start, newline), caret);
  }

  // Deciding where one note ends and the next begins, given only the characters typed so
  // far. Returns whether to open a gap before the new character, after it, or neither.
  //   "1" with labels 1-7            -> close now:  "1 "
  //   "1" with a label "10" defined  -> wait, "10" is still reachable
  //   then "2"                       -> "10" is dead, so the 1 was complete: split to "1 2"
  function resolveDigitSpacing(value, caret, typed) {
    const bases = sequenceLabelBases();
    const segment = tokenBeforeCaret(value, caret).split('+').pop();
    if (segment === '-' || segment === '0') return { before: ' ', after: ' ' };
    const candidate = segment + typed;
    for (const base of bases) {
      if (base.length > candidate.length && base.startsWith(candidate)) return { before: '', after: '' };
    }
    if (bases.has(candidate)) return { before: '', after: ' ' };
    if (segment && bases.has(segment)) return { before: ' ', after: ' ' };
    return { before: '', after: ' ' };
  }

  // Replace a stretch of the box and keep the browser's own undo history intact.
  function replaceSequenceRange(start, end, text, caretOffset = text.length) {
    const input = els.sequenceInput;
    input.setSelectionRange(start, end);
    let inserted = false;
    try { inserted = document.execCommand('insertText', false, text); } catch { inserted = false; }
    if (!inserted) {
      const value = input.value;
      input.value = `${value.slice(0, start)}${text}${value.slice(end)}`;
    }
    const caret = start + caretOffset;
    input.setSelectionRange(caret, caret);
    rememberSequenceSelection();
    syncEditorTimelineFromCleanInput();
    renderSequenceBackdrop();
    renderTimingEditor();
    queueDraftSave();
  }

  function handleSequenceTyping(event) {
    if (event.inputType !== 'insertText' || !event.data) return;
    const input = els.sequenceInput;
    const typed = event.data;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;
    const before = value.slice(0, start);

    // Some keyboards deliver a compact run in one event. It receives the same spacing
    // as ordinary one-key-at-a-time input.
    if (typed.length > 1) {
      if (!/^\d+$/u.test(typed)) return;
      event.preventDefault();
      const separated = splitCompactDigitRun(typed).join(' ');
      const after = value.slice(end);
      const lead = before && !/\s$/u.test(before) ? ' ' : '';
      const trail = after && !/^\s/u.test(after) ? ' ' : '';
      replaceSequenceRange(start, end, `${lead}${separated}${trail}`);
      return;
    }

    // ' and . retro-fit an octave dot onto the number just typed.
    if (typed === "'" || typed === '.') {
      const mark = typed === "'" ? DOT_ABOVE : DOT_BELOW;
      const trimmed = before.replace(/\s+$/, '');
      if (!trimmed || /[|+]$/.test(trimmed)) return;
      event.preventDefault();
      replaceSequenceRange(trimmed.length, end, mark + before.slice(trimmed.length));
      return;
    }
    // + joins the previous note into a chord, so the auto-space is taken back out.
    if (typed === '+') {
      const trimmed = before.replace(/\s+$/, '');
      if (!trimmed || /[|+]$/.test(trimmed)) return;
      event.preventDefault();
      replaceSequenceRange(trimmed.length, end, '+');
      return;
    }
    // _ and = modify the previous note instead of becoming sheet tokens. Selecting that
    // note immediately makes Quick or Very quick light up in the timing controls.
    if (typed === '_' || typed === '=') {
      const trimmed = before.replace(/\s+$/u, '');
      const match = trimmed.match(/([^\s|]+)$/u);
      if (!match) return;
      const token = match[1];
      const core = token.replace(/[_=]+$/u, '');
      if (!core || /[+]$/u.test(core)) return;
      event.preventDefault();
      const tokenStart = trimmed.length - token.length;
      const targetIndex = (value.slice(0, tokenStart).match(/\S+/gu) || []).length;
      syncEditorTimelineFromCleanInput();
      const item = state.editorTimeline[targetIndex];
      if (item && item.core !== '|') item.durationBeats = typed === '=' ? 0.25 : 0.5;
      setTimingSelection([targetIndex], targetIndex);
      renderSequenceBackdrop();
      renderTimingEditor();
      queueDraftSave();
      return;
    }
    if (typed === '|') {
      event.preventDefault();
      const spacer = before && !/\s$/.test(before) ? ' ' : '';
      replaceSequenceRange(start, end, `${spacer}| `);
      return;
    }
    if (!/[0-9-]/.test(typed)) return;
    event.preventDefault();
    const after = value.slice(end);
    const spacing = typed === '-' ? { before: ' ', after: ' ' } : resolveDigitSpacing(value, start, typed);
    const lead = spacing.before && !/\s$/.test(before) ? spacing.before : '';
    const trail = spacing.after && !/^\s/.test(after) ? spacing.after : '';
    const insertion = `${lead}${typed}${trail}`;
    replaceSequenceRange(start, end, insertion, insertion.length);
  }

  function prepareChordAtCursor() {
    const input = els.sequenceInput;
    const value = input.value;
    const caret = Math.max(0, Math.min(value.length, state.editorSelectionStart));
    const before = value.slice(0, caret);
    const trimmed = before.replace(/\s+$/u, '');
    const match = trimmed.match(/([^\s|]+)$/u);
    if (!match || /\+$/u.test(match[1])) {
      showToast('Add a note first, then choose Add chord.', 'warning');
      return;
    }
    replaceSequenceRange(trimmed.length, caret, '+');
  }

  function insertTokenAtCursor(token) {
    const value = els.sequenceInput.value;
    const start = Math.max(0, Math.min(value.length, state.editorSelectionStart));
    const end = Math.max(start, Math.min(value.length, state.editorSelectionEnd));
    const savedScrollTop = els.sequenceInput.scrollTop;
    const savedScrollLeft = els.sequenceInput.scrollLeft;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before && !/[\s+]$/.test(before) ? ' ' : '';
    const suffix = after && !/^\s/.test(after) ? ' ' : '';
    const insertion = `${prefix}${token}${suffix}`;
    els.sequenceInput.value = `${before}${insertion}${after}`;
    renderSequenceBackdrop();
    const nextPosition = start + insertion.length;
    els.sequenceInput.setSelectionRange(nextPosition, nextPosition);
    try {
      els.sequenceInput.focus({ preventScroll: true });
    } catch {
      els.sequenceInput.focus();
    }
    const restoreEditorViewport = () => {
      els.sequenceInput.setSelectionRange(nextPosition, nextPosition);
      els.sequenceInput.scrollTop = savedScrollTop;
      els.sequenceInput.scrollLeft = savedScrollLeft;
    };
    restoreEditorViewport();
    requestAnimationFrame(restoreEditorViewport);
    state.editorSelectionStart = nextPosition;
    state.editorSelectionEnd = nextPosition;
    els.sequenceInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function songFileDocument(song, { folder = null } = {}) {
    if (!song) return null;
    return {
      format: SONG_FORMAT,
      song: {
        title: song.title,
        bpm: song.bpm,
        sequence: song.sequence,
        scaleType: song.scaleType || 'any',
        folder: folder || song.folder || (song.builtIn ? 'demo' : 'library')
      }
    };
  }

  function communitySongFingerprint(song) {
    if (!song) return '';
    const source = [
      COMMUNITY_REVIEW_FINGERPRINT_VERSION,
      String(song.title || '').trim(),
      String(Number(song.bpm) || ''),
      String(song.sequence || '').trim(),
      String(song.scaleType || 'any')
    ].join('\u001f');
    let hash = 2166136261;
    for (let i = 0; i < source.length; i += 1) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${COMMUNITY_REVIEW_FINGERPRINT_VERSION}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  function songIsUnderCommunityReview(song) {
    return Boolean(song && !song.builtIn
      && song.communitySubmittedFingerprint
      && song.communitySubmittedFingerprint === communitySongFingerprint(song));
  }

  function downloadSongFile(song, { folder = null, suffix = '' } = {}) {
    const payload = songFileDocument(song, { folder });
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(song.title)}${suffix}.drumsong`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSong() {
    downloadSongFile(selectedSong());
  }

  function setCommunityUploadProgress(percent, status, tone = '') {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    if (!els.communityUploadProgress) return;
    els.communityUploadProgress.hidden = false;
    els.communityUploadProgress.classList.toggle('success', tone === 'success');
    els.communityUploadProgress.classList.toggle('error', tone === 'error');
    els.communityUploadStatus.textContent = status;
    els.communityUploadPercent.textContent = tone === 'error' ? 'Failed' : `${Math.round(value)}%`;
    els.communityProgressFill.style.width = `${value}%`;
    els.communityProgressTrack.setAttribute('aria-valuenow', String(Math.round(value)));
  }

  function resetCommunityUploadProgress() {
    if (!els.communityUploadProgress || communityUploadRequest) return;
    els.communityUploadProgress.hidden = true;
    els.communityUploadProgress.classList.remove('success', 'error');
    els.communityUploadStatus.textContent = 'Preparing submission...';
    els.communityUploadPercent.textContent = '0%';
    els.communityProgressFill.style.width = '0%';
    els.communityProgressTrack.setAttribute('aria-valuenow', '0');
  }

  function validCommunityMessageOrigin(origin) {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' && (
        url.hostname === 'script.google.com'
        || url.hostname === 'script.googleusercontent.com'
        || url.hostname.endsWith('.googleusercontent.com')
      );
    } catch {
      return false;
    }
  }

  function pollCommunityUploadStatus(nonce) {
    const request = communityUploadRequest;
    if (!request || request.nonce !== nonce) return;
    const statusScript = document.createElement('script');
    const statusUrl = new URL(COMMUNITY_UPLOAD_URL);
    statusUrl.searchParams.set('nonce', nonce);
    statusUrl.searchParams.set('callback', COMMUNITY_STATUS_CALLBACK);
    statusUrl.searchParams.set('status-check', String(Date.now()));
    statusScript.src = statusUrl.href;
    statusScript.async = true;
    statusScript.onload = statusScript.onerror = () => statusScript.remove();
    document.head.appendChild(statusScript);
  }

  window[COMMUNITY_STATUS_CALLBACK] = response => {
    const request = communityUploadRequest;
    if (!request || !response || response.pending || response.nonce !== request.nonce) return;
    finishCommunityUpload(request.nonce, Boolean(response.ok), String(response.message || ''));
  };

  function finishCommunityUpload(nonce, ok, message) {
    const request = communityUploadRequest;
    if (!request || request.nonce !== nonce) return;
    window.clearInterval(request.progressTimer);
    window.clearInterval(request.pollTimer);
    window.clearTimeout(request.timeoutTimer);
    window.removeEventListener('message', request.onMessage);
    request.form.remove();
    window.setTimeout(() => request.frame.remove(), 80);
    communityUploadRequest = null;

    if (ok) {
      const song = selectedSong();
      if (song && !song.builtIn) {
        song.communitySubmittedFingerprint = communitySongFingerprint(song);
        song.communitySubmittedAt = new Date().toISOString();
        saveCustomSongs();
      }
      setCommunityUploadProgress(100, message || 'Song submitted for review.', 'success');
      els.submitCommunityBtn.textContent = 'Song under review';
      els.submitCommunityBtn.disabled = true;
      setCommunitySelectionMessage(song, 'This version has been submitted and is waiting for owner review. Edit the song to submit a revised version.');
      showToast(message || 'Song submitted for Community review.', 'success');
      return;
    }

    setCommunityUploadProgress(request.progress, message || 'Upload failed. Please try again.', 'error');
    els.submitCommunityBtn.textContent = 'Try again';
    els.submitCommunityBtn.disabled = false;
    showToast(message || 'Community submission failed.', 'warning');
  }

  function setCommunitySelectionMessage(song, message) {
    if (!els.communitySelection) return;
    els.communitySelection.replaceChildren();
    if (song?.title) {
      const selected = document.createElement('strong');
      selected.className = 'community-selected-song';
      selected.textContent = `Selected song: ${song.title}`;
      els.communitySelection.appendChild(selected);
    }
    if (message) {
      const detail = document.createElement('span');
      detail.className = 'community-selection-detail';
      detail.textContent = message;
      els.communitySelection.appendChild(detail);
    }
  }

  function openCommunityDialog() {
    if (!els.communityDialog) return;
    const song = selectedSong();
    const ownSong = Boolean(song && !song.builtIn);
    const configured = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/u.test(COMMUNITY_UPLOAD_URL);
    const underReview = ownSong && songIsUnderCommunityReview(song);
    const canSubmit = ownSong && configured && !communityUploadRequest && !underReview;
    els.submitCommunityBtn.disabled = !canSubmit;
    els.submitCommunityBtn.textContent = underReview ? 'Song under review' : 'Submit selected song';
    if (underReview) {
      setCommunitySelectionMessage(song, 'This version has already been submitted and is waiting for owner review. Edit the song to submit a revised version.');
    } else if (ownSong) {
      setCommunitySelectionMessage(song, 'Ready to submit this song for Community review.');
    } else {
      els.communitySelection.textContent = 'Select one of your own Song library songs before submitting.';
    }
    if (!configured) els.communitySelection.textContent = 'Community submissions are temporarily unavailable.';
    resetCommunityUploadProgress();
    els.communityDialog.showModal();
  }

  function submitCommunitySong() {
    const song = selectedSong();
    if (!song || song.builtIn) {
      showToast('Select one of your own Song library songs first.', 'warning');
      return;
    }
    if (!COMMUNITY_UPLOAD_URL || communityUploadRequest) return;
    if (songIsUnderCommunityReview(song)) {
      els.submitCommunityBtn.textContent = 'Song under review';
      els.submitCommunityBtn.disabled = true;
      setCommunitySelectionMessage(song, 'This version has already been submitted and is waiting for owner review. Edit the song to submit a revised version.');
      showToast('This song version is already under review.', 'warning');
      return;
    }

    const payload = songFileDocument(song, { folder: 'community' });
    const nonce = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `community-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement('iframe');
    frame.name = `community-upload-${nonce.replace(/[^a-z0-9]/gi, '')}`;
    frame.title = 'Community submission response';
    frame.hidden = true;
    const form = document.createElement('form');
    form.method = 'post';
    form.action = COMMUNITY_UPLOAD_URL;
    form.target = frame.name;
    form.acceptCharset = 'UTF-8';
    form.hidden = true;
    const addField = (name, value) => {
      const field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      field.value = value;
      form.appendChild(field);
    };
    addField('payload', JSON.stringify(payload));
    addField('nonce', nonce);
    addField('website', '');

    const onMessage = event => {
      if (!validCommunityMessageOrigin(event.origin)) return;
      const response = event.data;
      if (!response || response.type !== 'ethereal-community-upload' || response.nonce !== nonce) return;
      finishCommunityUpload(nonce, Boolean(response.ok), String(response.message || ''));
    };
    communityUploadRequest = { nonce, frame, form, onMessage, progress: 6, progressTimer: 0, pollTimer: 0, timeoutTimer: 0 };
    window.addEventListener('message', onMessage);
    document.body.append(frame, form);
    els.submitCommunityBtn.disabled = true;
    els.submitCommunityBtn.textContent = 'Submitting...';
    setCommunityUploadProgress(6, 'Uploading song...');
    communityUploadRequest.progressTimer = window.setInterval(() => {
      if (!communityUploadRequest || communityUploadRequest.nonce !== nonce) return;
      communityUploadRequest.progress = Math.min(92, communityUploadRequest.progress + Math.max(1, (92 - communityUploadRequest.progress) * .08));
      setCommunityUploadProgress(communityUploadRequest.progress, 'Uploading song...');
    }, 220);
    communityUploadRequest.timeoutTimer = window.setTimeout(() => {
      finishCommunityUpload(nonce, false, 'The upload timed out. Please try again.');
    }, 45000);
    form.submit();
    pollCommunityUploadStatus(nonce);
    communityUploadRequest.pollTimer = window.setInterval(() => pollCommunityUploadStatus(nonce), 800);
  }

  async function importSong(file) {
    try {
      if (!file.name.toLowerCase().endsWith('.drumsong')) throw new Error('Unsupported file extension');
      const data = JSON.parse(await file.text());
      if (![SONG_FORMAT, LEGACY_SONG_FORMAT].includes(data.format)) throw new Error('Unsupported song format');
      const source = data.song;
      if (!source?.title || !source.sequence || !source.bpm) throw new Error('Invalid song file');
      const stats = sequenceStats(source.sequence);
      if (stats.invalidTokens.length || !stats.noteCount) throw new Error('Invalid song timing');
      const song = {
        id: `song-${Date.now().toString(36)}`,
        title: String(source.title),
        bpm: Number(source.bpm),
        sequence: String(source.sequence),
        scaleType: ['major', 'major-pentatonic', 'minor-pentatonic', 'any'].includes(source.scaleType) ? source.scaleType : 'any',
        folder: 'library',
        builtIn: false
      };
      state.songs.push(song);
      saveCustomSongs();
      selectSong(song.id);
      showToast('Song imported.', 'success');
    } catch (error) {
      console.error(error);
      showToast('That file is not a valid .drumsong file.', 'warning');
    } finally {
      els.importFile.value = '';
    }
  }

  function deleteSong(song, closeEditor = false) {
    if (!song) return;
    const catalogue = song.builtIn;
    const collectionName = isCommunitySong(song) ? 'Community gallery' : 'Demo songs';
    const question = catalogue
      ? `Remove "${song.title}" from ${collectionName}?\n\nThis removes it from this browser only.`
      : `Delete "${song.title}"?\n\nThis cannot be undone.`;
    if (!window.confirm(question)) return;
    const deletedIndex = state.songs.findIndex(item => item.id === song.id);
    if (song.builtIn) {
      state.hiddenDemoIds.add(String(song.id));
      saveHiddenDemos();
    }
    state.songs = state.songs.filter(s => s.id !== song.id);
    saveCustomSongs();
    if (closeEditor) {
      state.editorSongId = null;
      els.editorDialog.close();
    }
    const nextIndex = Math.min(Math.max(0, deletedIndex), state.songs.length - 1);
    selectSong(state.songs[nextIndex]?.id || state.songs[0]?.id);
    showToast(catalogue ? 'Catalogue song removed.' : 'Song deleted.', 'success');
  }

  function deleteSelectedSong() {
    deleteSong(selectedSong());
  }

  function restoreDemoSongs() {
    const missing = curatedSongs.filter(song => state.hiddenDemoIds.has(song.id));
    if (!missing.length) return;
    state.hiddenDemoIds.clear();
    saveHiddenDemos();
    const customSongs = state.songs.filter(song => !song.builtIn);
    state.songs = [...curatedSongs.map(song => normaliseSong(song, 'major')), ...customSongs];
    if (!state.songs.some(song => song.id === state.selectedId)) state.selectedId = state.songs[0]?.id || null;
    renderSongList();
    if (state.selectedId) selectSong(state.selectedId);
    showToast('Catalogue songs restored.', 'success');
  }

  function deleteEditorSong() {
    const song = state.songs.find(item => item.id === state.editorSongId);
    if (!song) {
      els.deleteEditorBtn.hidden = true;
      showToast('This song has not been saved yet.', 'warning');
      return;
    }
    deleteSong(song, true);
  }

  function openSettings() {
    els.instrumentKeySelect.value = ['C', 'D'].includes(state.instrument.key) ? state.instrument.key : 'C';
    els.scaleTypeSelect.value = state.instrument.scaleType || 'custom';
    els.noteCountSelect.value = String(state.instrument.count);
    els.rootOctaveSelect.value = String(state.instrument.rootOctave ?? 4);
    els.highDrumToggle.checked = Boolean(state.instrument.highDrumEnabled);
    els.highDrumAlwaysToggle.checked = Boolean(state.instrument.highDrumAlwaysVisible);
    syncHighDrumOption();
    renderTuningGrid(state.instrument.count, state.instrument.notes);
    renderCompanionTuningGrid(state.instrument.companionNotes);
    renderNoteGuide();
    els.settingsDialog.showModal();
  }

  function syncHighDrumOption() {
    const available = Number(els.noteCountSelect.value) === 15;
    els.highDrumOption.hidden = false;
    els.highDrumOption.classList.toggle('unavailable', !available);
    els.highDrumToggle.disabled = !available;
    els.highDrumAlwaysToggle.disabled = !available || !els.highDrumToggle.checked;
    els.companionTuningSection.hidden = !available || !els.highDrumToggle.checked;
    if (els.highDrumAvailability) {
      els.highDrumAvailability.textContent = available
        ? (els.highDrumToggle.checked ? 'Enabled for this 15-note drum' : 'Available for this 15-note drum')
        : 'Choose 15 notes above to use the companion drum';
    }
    if (!els.highDrumToggle.checked) els.highDrumAlwaysToggle.checked = false;
  }

  function noteOptions(selectedMidi) {
    let html = '';
    for (let midi = 36; midi <= 96; midi++) {
      html += `<option value="${midi}"${midi === Number(selectedMidi) ? ' selected' : ''}>${midiToName(midi)}</option>`;
    }
    return html;
  }

  function getPresetFromSettings() {
    const key = els.instrumentKeySelect.value;
    const scaleType = els.scaleTypeSelect.value;
    const count = Number(els.noteCountSelect.value);
    const rootOctave = Number(els.rootOctaveSelect.value);
    return scaleType === 'custom' ? null : makePresetInstrument(count, key, rootOctave, REFERENCE_PITCH, scaleType);
  }

  function readTuningGridValues() {
    const labelInputs = [...els.tuningGrid.querySelectorAll('.tuning-label')];
    const pitchSelects = [...els.tuningGrid.querySelectorAll('.tuning-pitch')];
    const noteInputs = [...els.tuningGrid.querySelectorAll('.tuning-note')];
    const colorInputs = [...els.tuningGrid.querySelectorAll('.tuning-color')];
    return noteInputs.map((input, i) => ({
      label: composeTuningLabel(labelInputs[i], pitchSelects[i], i),
      midi: Number(input.value),
      color: normaliseColor(colorInputs[i]?.value, i)
    }));
  }

  // The editor stores the bare number in the text box and the dot in a checkbox, then
  // glues them back together here. Songs and note matching still use the full label.
  function composeTuningLabel(labelInput, pitchSelect, index = 0) {
    const base = splitOctaveMark(labelInput?.value ?? '').base.trim() || String(index + 1);
    const mark = pitchSelect?.value || '';
    if (mark === 'up2') return `${base}${DOT_ABOVE}${DOT_ABOVE}`;
    return applyOctaveMark(base, mark);
  }

  // Line-art microphone. The 🎙 emoji rendered as a flat blob on most Windows fonts.
  const MIC_ICON = '<svg class="mic-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3"></rect><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"></path><path d="M12 17v4"></path><path d="M8.6 21h6.8"></path></svg>';

  const PITCH_OPTIONS = [['up', 'high'], ['', 'middle'], ['down', 'low']];

  function pitchSelectMarkup(index, mark) {
    const options = PITCH_OPTIONS
      .map(([value, text]) => `<option value="${value}"${value === mark ? ' selected' : ''}>${text}</option>`)
      .join('');
    return `<select class="tuning-pitch" data-index="${index}" aria-label="Octave for tongue ${index + 1}">${options}</select>`;
  }

  function companionPitchSelectMarkup(index, octave) {
    const selected = octave.mark === 'up' && octave.count > 1 ? 'up2' : octave.mark;
    const options = [['up2', 'very high'], ['up', 'high'], ['', 'middle'], ['down', 'low']]
      .map(([value, text]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${text}</option>`)
      .join('');
    return `<select class="tuning-pitch companion-tuning-pitch" data-index="${index}" aria-label="Octave for companion tongue ${index + 1}">${options}</select>`;
  }

  // Rainbow order (sorted by hue) so the popup reads like a colour wheel rather than
  // the arbitrary order the defaults happen to be stored in.
  function hueOf(hex) {
    const { r, g, b } = hexToRgb(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return h * 60;
  }

  const RAINBOW_PALETTE = [...NOTE_COLORS].sort((a, b) => hueOf(a) - hueOf(b));

  function renderTuningGrid(count, existing = []) {
    els.tuningGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const fallbackScale = SCALE_INTERVALS[els.scaleTypeSelect?.value] ? els.scaleTypeSelect.value : 'major';
      const fallback = makePresetInstrument(count, els.instrumentKeySelect?.value || 'C', Number(els.rootOctaveSelect?.value || 4), REFERENCE_PITCH, fallbackScale).notes[i];
      const note = { ...fallback, ...(existing[i] || {}) };
      const color = normaliseColor(note.color, i);
      const parsed = splitOctaveMark(note.label);
      const row = document.createElement('div');
      row.className = 'tuning-row';
      row.dataset.index = String(i);
      setNoteColorVars(row, color);
      row.innerHTML = `
        <span class="tongue-number"><i aria-hidden="true"></i>Tongue ${i + 1}</span>
        <label>Label<input class="tuning-label" data-index="${i}" maxlength="4" inputmode="numeric" value="${escapeAttr(parsed.base)}" required></label>
        <label>Pitch${pitchSelectMarkup(i, parsed.mark)}</label>
        <label>Note<select class="tuning-note" data-index="${i}">${noteOptions(note.midi)}</select></label>
        <span class="tuning-color-label">Color
          <button type="button" class="colour-chip" data-index="${i}" style="--sw:${color}" aria-label="Color for tongue ${i + 1}, currently ${color}" aria-haspopup="dialog"></button>
          <input class="tuning-color" type="hidden" data-index="${i}" value="${color}">
        </span>
      `;
      els.tuningGrid.appendChild(row);
    }
  }

  function renderCompanionTuningGrid(existing = []) {
    if (!els.companionTuningGrid) return;
    const notes = normaliseCompanionNotes(
      existing,
      els.instrumentKeySelect?.value || state.instrument?.key || 'D',
      Number(els.rootOctaveSelect?.value ?? state.instrument?.rootOctave ?? 4)
    );
    els.companionTuningGrid.innerHTML = '';
    notes.forEach((note, i) => {
      const color = normaliseColor(note.color, 15 + i);
      const parsed = splitOctaveMark(note.label);
      const row = document.createElement('div');
      row.className = 'tuning-row companion-tuning-row';
      row.dataset.index = String(i);
      row.dataset.colorIndex = String(15 + i);
      setNoteColorVars(row, color);
      row.innerHTML = `
        <span class="tongue-number"><i aria-hidden="true"></i>Companion ${i + 1}</span>
        <label>Label<input class="tuning-label" data-index="${i}" maxlength="4" inputmode="numeric" value="${escapeAttr(parsed.base)}" required></label>
        <label>Pitch${companionPitchSelectMarkup(i, parsed)}</label>
        <label>Note<select class="tuning-note" data-index="${i}">${noteOptions(note.midi)}</select></label>
        <span class="tuning-color-label">Color
          <button type="button" class="colour-chip" data-index="${i}" style="--sw:${color}" aria-label="Color for companion tongue ${i + 1}, currently ${color}" aria-haspopup="dialog"></button>
          <input class="tuning-color" type="hidden" data-index="${i}" value="${color}">
        </span>
      `;
      els.companionTuningGrid.appendChild(row);
    });
  }

  function readCompanionTuningValues() {
    if (!els.companionTuningGrid) {
      return normaliseCompanionNotes(
        [],
        els.instrumentKeySelect?.value || 'D',
        Number(els.rootOctaveSelect?.value ?? 4)
      );
    }
    const labelInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-label')];
    const pitchSelects = [...els.companionTuningGrid.querySelectorAll('.tuning-pitch')];
    const noteInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-note')];
    const colorInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-color')];
    return noteInputs.map((input, i) => ({
      label: composeTuningLabel(labelInputs[i], pitchSelects[i], i),
      midi: Number(input.value),
      color: normaliseColor(colorInputs[i]?.value, 15 + i)
    }));
  }

  function guideNumberMarkup(label) {
    const octave = splitOctaveMark(label);
    const markClass = octaveMarkClass(octave);
    return `<span class="note-guide-number${markClass ? ` ${markClass}` : ''}">${escapeHtml(octave.base)}</span>`;
  }

  function renderNoteGuide() {
    if (!els.noteGuideBody) return;
    const rootOctave = Number(els.rootOctaveSelect?.value ?? 4);
    const cRootMidi = 12 * (rootOctave + 1) + ROOT_PITCH_CLASS.C;
    const dRootMidi = 12 * (rootOctave + 1) + ROOT_PITCH_CLASS.D;
    if (els.noteGuideOctave) els.noteGuideOctave.textContent = String(rootOctave);
    els.noteGuideBody.innerHTML = NOTE_GUIDE_SPEC.map(item => `
      <tr${item.companionOnly ? ' class="companion-only-note"' : ''}>
        <th scope="row">
          ${guideNumberMarkup(item.label)}
          ${item.companionOnly ? '<small>companion</small>' : ''}
        </th>
        <td>${escapeHtml(midiToName(dRootMidi + item.offset))}</td>
        <td>${escapeHtml(midiToName(cRootMidi + item.offset))}</td>
      </tr>
    `).join('');
  }

  function openSongGuide(sourceArea = 'editor') {
    if (!els.songGuideDialog || !els.songGuideContent || !els.pitchInfo) return;
    if (sourceArea !== 'instrument' && els.rootOctaveSelect) {
      els.rootOctaveSelect.value = String(state.instrument?.rootOctave ?? 4);
    }
    renderNoteGuide();
    const source = els.pitchInfo.cloneNode(true);
    source.hidden = false;
    source.removeAttribute('id');
    source.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    els.songGuideContent.innerHTML = source.innerHTML;
    els.songGuideDialog.showModal();
  }

  function renderCompanionPresetFromSettings() {
    if (Number(els.noteCountSelect.value) !== 15) return;
    const current = readCompanionTuningValues();
    const preset = buildCompanionTunedNotes(
      els.instrumentKeySelect.value,
      Number(els.rootOctaveSelect.value)
    ).map((note, i) => ({
      ...note,
      color: current[i]?.color || note.color
    }));
    renderCompanionTuningGrid(preset);
  }

  function setRowColor(row, value) {
    if (!row) return;
    const index = Number(row.dataset.index) || 0;
    const colorIndex = Number(row.dataset.colorIndex ?? index);
    const color = normaliseColor(value, colorIndex);
    const hidden = row.querySelector('.tuning-color');
    if (hidden) hidden.value = color;
    const chip = row.querySelector('.colour-chip');
    if (chip) {
      chip.style.setProperty('--sw', color);
      const companion = row.classList.contains('companion-tuning-row') ? 'companion ' : '';
      chip.setAttribute('aria-label', `Color for ${companion}tongue ${index + 1}, currently ${color}`);
    }
    setNoteColorVars(row, color);
  }

  // Changing a tongue's note moves it between octaves, so the Pitch field follows along.
  // It stays editable, so an unusual tuning can still be labelled by hand.
  function syncRowOctave(row) {
    if (!row) return;
    const noteSelect = row.querySelector('.tuning-note');
    const pitchSelect = row.querySelector('.tuning-pitch');
    if (!noteSelect || !pitchSelect) return;
    pitchSelect.value = octaveMarkForMidi(Number(noteSelect.value));
  }

  function syncAllRowOctaves() {
    els.tuningGrid.querySelectorAll('.tuning-row').forEach(syncRowOctave);
  }

  // One shared colour popup for the whole grid: presets in rainbow order, then a single
  // custom square that hands off to the OS picker.
  function buildColourPopover() {
    const chips = RAINBOW_PALETTE
      .map(preset => `<button type="button" class="swatch" data-color="${preset}" style="--sw:${preset}" title="${preset}" aria-label="Use ${preset}"></button>`)
      .join('');
    els.colourPopover.innerHTML = `
      <div class="swatch-row">${chips}</div>
      <label class="swatch-custom-row">
        <span class="swatch swatch-custom" aria-hidden="true"></span>
        <span>Custom color…</span>
        <input id="colourPopoverCustom" type="color" value="#a78bfa" aria-label="Pick a custom color">
      </label>`;
  }

  function isPopoverOpen(element) {
    if (!element) return false;
    try {
      return element.matches(':popover-open') || element.classList.contains('show');
    } catch {
      return element.classList.contains('show');
    }
  }

  function openColourPopover(chip) {
    const row = chip.closest('.tuning-row');
    if (!row) return;
    const current = row.querySelector('.tuning-color')?.value || defaultNoteColor(0);
    state.colourTargetRow = row;
    els.colourPopover.querySelectorAll('.swatch[data-color]').forEach(swatch => {
      swatch.classList.toggle('selected', swatch.dataset.color === current);
    });
    const custom = els.colourPopover.querySelector('#colourPopoverCustom');
    if (custom) custom.value = current;
    const customChip = els.colourPopover.querySelector('.swatch-custom');
    if (customChip) customChip.classList.toggle('selected', !RAINBOW_PALETTE.includes(current));
    if (!isPopoverOpen(els.colourPopover)) {
      if (typeof els.colourPopover.showPopover === 'function') els.colourPopover.showPopover();
      else els.colourPopover.classList.add('show');
    }
    const box = chip.getBoundingClientRect();
    const size = els.colourPopover.getBoundingClientRect();
    const left = Math.max(10, Math.min(window.innerWidth - size.width - 10, box.left + box.width / 2 - size.width / 2));
    const below = box.bottom + 8;
    const top = below + size.height > window.innerHeight - 10 ? Math.max(10, box.top - size.height - 8) : below;
    els.colourPopover.style.left = `${Math.round(left)}px`;
    els.colourPopover.style.top = `${Math.round(top)}px`;
  }

  function closeColourPopover() {
    state.colourTargetRow = null;
    if (!isPopoverOpen(els.colourPopover)) return;
    if (typeof els.colourPopover.hidePopover === 'function') els.colourPopover.hidePopover();
    else els.colourPopover.classList.remove('show');
  }

  function refreshPresetTuning(refreshCompanion = false) {
    const current = readTuningGridValues();
    const preset = getPresetFromSettings();
    const count = Number(els.noteCountSelect.value);
    if (preset) {
      const notes = preset.notes.map((note, i) => ({ ...note, color: current[i]?.color || defaultNoteColor(i) }));
      renderTuningGrid(count, notes);
    } else {
      renderTuningGrid(count, current);
    }
    if (refreshCompanion && els.scaleTypeSelect.value !== 'custom') renderCompanionPresetFromSettings();
    renderNoteGuide();
  }

  function saveSettings(event) {
    event.preventDefault();
    clearInvalidFields(els.settingsForm);
    const count = Number(els.noteCountSelect.value);
    const labelInputs = [...els.tuningGrid.querySelectorAll('.tuning-label')];
    const pitchSelects = [...els.tuningGrid.querySelectorAll('.tuning-pitch')];
    const bases = labelInputs.map(input => splitOctaveMark(input.value).base.trim());
    const labels = labelInputs.map((input, i) => (bases[i] ? composeTuningLabel(input, pitchSelects[i], i) : ''));
    const midis = [...els.tuningGrid.querySelectorAll('.tuning-note')].map(input => Number(input.value));
    const colors = [...els.tuningGrid.querySelectorAll('.tuning-color')].map((input, i) => normaliseColor(input.value, i));
    const companionNotes = readCompanionTuningValues();
    const companionLabels = companionNotes.map(note => note.label.toLowerCase());
    const frequencies = new Map();
    labels.forEach(label => {
      const normalised = label.toLowerCase();
      if (normalised) frequencies.set(normalised, (frequencies.get(normalised) || 0) + 1);
    });
    const invalidLabels = labelInputs.filter((input, i) => !labels[i] || frequencies.get(labels[i].toLowerCase()) > 1);
    if (invalidLabels.length) {
      invalidLabels.forEach(input => input.classList.add('invalid-field'));
      focusInvalidField(invalidLabels[0]);
      showToast('Every tongue needs a label, and each label must be unique.', 'warning');
      return;
    }
    if (els.highDrumToggle.checked && new Set(companionLabels).size !== companionLabels.length) {
      const companionInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-label')];
      companionInputs.forEach((input, i) => {
        if (companionLabels.indexOf(companionLabels[i]) !== companionLabels.lastIndexOf(companionLabels[i])) {
          input.classList.add('invalid-field');
        }
      });
      focusInvalidField(companionInputs.find(input => input.classList.contains('invalid-field')));
      showToast('Every companion tongue needs a unique label.', 'warning');
      return;
    }
    const selectedKey = els.instrumentKeySelect.value;
    const selectedScale = els.scaleTypeSelect.value;
    const rootOctave = Number(els.rootOctaveSelect.value);
    const expected = selectedScale === 'custom'
      ? null
      : makePresetInstrument(count, selectedKey, rootOctave, REFERENCE_PITCH, selectedScale);
    const matchesPreset = expected && expected.notes.every((note, i) => note.midi === midis[i]);
    const scaleType = matchesPreset ? selectedScale : 'custom';
    const displayName = scaleType === 'custom' ? 'custom tuning' : `${selectedKey} ${SCALE_NAMES[scaleType]}`;
    state.instrument = {
      count,
      key: selectedKey,
      scaleType,
      rootOctave,
      referencePitch: REFERENCE_PITCH,
      highDrumEnabled: count === 15 && els.highDrumToggle.checked,
      highDrumAlwaysVisible: count === 15 && els.highDrumToggle.checked && els.highDrumAlwaysToggle.checked,
      companionNotes: count === 15 ? companionNotes : [],
      name: `${count}-note ${displayName} drum`,
      notes: labels.map((label, i) => ({ label, midi: midis[i], color: colors[i] }))
    };
    saveInstrument();
    els.settingsDialog.close();
    renderInstrument();
    selectSong(state.selectedId);
    showToast(`Instrument updated: ${displayName}.`, 'success');
  }

  function keyboardHandler(event) {
    if (document.querySelector('dialog[open]')) return;
    if (event.target.matches('input, textarea, select, button') || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlayback();
      return;
    }
    const mappedIndex = KEY_NOTE_MAP[event.key.toLowerCase()];
    if (mappedIndex !== undefined && mappedIndex < playableNotes().length) handleUserNote(mappedIndex);
  }

  function clearInvalidFields(form) {
    form?.querySelectorAll('.invalid-field').forEach(field => field.classList.remove('invalid-field'));
  }

  function focusInvalidField(field) {
    field?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    window.setTimeout(() => field?.focus({ preventScroll: true }), 180);
  }

  function hideToast() {
    clearTimeout(showToast.timer);
    try {
      if (typeof els.toast.hidePopover === 'function' && isPopoverOpen(els.toast)) els.toast.hidePopover();
      else els.toast.classList.remove('show');
    } catch {
      els.toast.classList.remove('show');
    }
  }

  function showToast(message, type = 'info') {
    els.toast.textContent = message;
    els.toast.classList.remove('warning', 'success');
    if (type === 'warning' || type === 'success') els.toast.classList.add(type);
    clearTimeout(showToast.timer);
    try {
      if (typeof els.toast.showPopover === 'function') {
        if (isPopoverOpen(els.toast)) els.toast.hidePopover();
        els.toast.showPopover();
      } else {
        els.toast.classList.add('show');
      }
    } catch {
      els.toast.classList.add('show');
    }
    showToast.timer = window.setTimeout(hideToast, type === 'warning' ? 3600 : 2400);
  }

  function checkDemoCatalogUpdate(force = false) {
    if (demoCatalogPollBusy || (!force && document.hidden)) return;
    demoCatalogPollBusy = true;
    const script = document.createElement('script');
    const catalogUrl = new URL('app-files/demo-catalog.js', document.baseURI);
    catalogUrl.searchParams.set('catalog-check', String(Date.now()));
    script.src = catalogUrl.href;
    script.async = true;
    script.onload = () => {
      const nextVersion = String(window.ETHEREAL_DEMO_CATALOG_VERSION || '');
      if (nextVersion && nextVersion !== activeDemoCatalogVersion) {
        activeDemoCatalogVersion = nextVersion;
        applyCatalogGlobals({ announce: true });
        if (els.catalogUpdateBanner) els.catalogUpdateBanner.hidden = true;
      }
      demoCatalogPollBusy = false;
      script.remove();
    };
    script.onerror = () => {
      demoCatalogPollBusy = false;
      script.remove();
    };
    document.head.appendChild(script);
  }

  function startDemoCatalogPolling() {
    window.setInterval(checkDemoCatalogUpdate, 2500);
  }

  function modeWalkthroughsSeen() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_MODE_WALKTHROUGHS) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function setModeWalkthroughSuppressed(mode, suppressed) {
    const seen = modeWalkthroughsSeen();
    const next = suppressed
      ? [...new Set([...seen, mode])]
      : seen.filter(item => item !== mode);
    try { localStorage.setItem(STORAGE_MODE_WALKTHROUGHS, JSON.stringify(next)); } catch {}
  }

  function walkthroughIsSuppressed(kind) {
    if (kind === 'main') {
      try { return localStorage.getItem(STORAGE_WALKTHROUGH_COMPLETE) === 'true'; } catch { return false; }
    }
    return modeWalkthroughsSeen().includes(kind);
  }

  function setWalkthroughSuppressed(kind, suppressed) {
    if (kind === 'main') {
      try {
        if (suppressed) localStorage.setItem(STORAGE_WALKTHROUGH_COMPLETE, 'true');
        else localStorage.removeItem(STORAGE_WALKTHROUGH_COMPLETE);
      } catch {}
      return;
    }
    setModeWalkthroughSuppressed(kind, suppressed);
  }

  function maybeStartModeWalkthrough(mode) {
    if (!MODE_WALKTHROUGH_STEPS[mode] || modeWalkthroughsSeen().includes(mode)) return;
    window.setTimeout(() => startWalkthrough(mode), 80);
  }

  function syncWalkthroughSidebar() {
    if (!els.sidebar || walkthroughKind !== 'main' || !walkthroughPreviewState) return;
    const showSongs = walkthroughStepIndex === 1 || walkthroughStepIndex === 2;
    if (showSongs) els.sidebar.classList.add('open');
    else if (!walkthroughPreviewState.sidebarWasOpen) els.sidebar.classList.remove('open');
  }

  function positionWalkthrough() {
    if (!els.tourOverlay || els.tourOverlay.hidden) return;
    const step = activeWalkthroughSteps[walkthroughStepIndex];
    if (!step) return;
    const target = document.querySelector(step.target);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const padding = 7;
    els.tourFocusRing.style.left = `${Math.max(4, rect.left - padding)}px`;
    els.tourFocusRing.style.top = `${Math.max(4, rect.top - padding)}px`;
    els.tourFocusRing.style.width = `${Math.max(28, rect.width + padding * 2)}px`;
    els.tourFocusRing.style.height = `${Math.max(28, rect.height + padding * 2)}px`;

    window.requestAnimationFrame(() => {
      const cardWidth = els.tourCard.offsetWidth || 350;
      const cardHeight = els.tourCard.offsetHeight || 190;
      const edge = 14;
      const left = Math.min(
        Math.max(edge, rect.left),
        Math.max(edge, window.innerWidth - cardWidth - edge)
      );
      let top = rect.bottom + 16;
      if (top + cardHeight > window.innerHeight - edge) top = rect.top - cardHeight - 16;
      top = Math.max(edge, Math.min(top, window.innerHeight - cardHeight - edge));
      els.tourCard.style.left = `${left}px`;
      els.tourCard.style.top = `${top}px`;
    });
  }

  function renderWalkthroughStep() {
    const step = activeWalkthroughSteps[walkthroughStepIndex];
    if (!step || !els.tourOverlay) return;
    syncWalkthroughSidebar();
    els.tourProgress.textContent = `${walkthroughStepIndex + 1} of ${activeWalkthroughSteps.length}`;
    els.tourTitle.textContent = step.title;
    els.tourText.textContent = step.text;
    els.tourBackBtn.hidden = walkthroughStepIndex === 0;
    els.tourNextBtn.textContent = walkthroughStepIndex === activeWalkthroughSteps.length - 1 ? 'Finish' : 'Next';
    positionWalkthrough();
    window.setTimeout(positionWalkthrough, 280);
  }

  function restoreWalkthroughPreview() {
    const previous = walkthroughPreviewState;
    walkthroughPreviewState = null;
    if (!previous) return;
    pausePlayback();
    setMode(previous.mode);
    selectSong(previous.selectedId);
    state.currentTime = Math.min(previous.currentTime, state.duration);
    updatePracticeUI();
    renderFrame();
    if (previous.sidebarWasOpen) els.sidebar?.classList.add('open');
    else els.sidebar?.classList.remove('open');
    if (previous.wasPlaying && previous.mode !== 'tuner') {
      if (previous.mode === 'wait') {
        state.playing = true;
        state.waitingIndex = state.parsedNotes.findIndex(note => note.time >= state.currentTime - .01);
        updateTransportUI();
      } else {
        startPlaybackClock();
      }
    }
  }

  function finishWalkthrough({ suppress = false } = {}) {
    if (els.tourOverlay) els.tourOverlay.hidden = true;
    if (suppress || els.tourDontShowAgain?.checked) setWalkthroughSuppressed(walkthroughKind, true);
    if (walkthroughKind === 'main') {
      restoreWalkthroughPreview();
    }
  }

  function startWalkthrough(kind = 'main') {
    if (!els.tourOverlay || !els.tourOverlay.hidden) return;
    walkthroughKind = MODE_WALKTHROUGH_STEPS[kind] ? kind : 'main';
    activeWalkthroughSteps = walkthroughKind === 'main' ? WALKTHROUGH_STEPS : MODE_WALKTHROUGH_STEPS[walkthroughKind];
    walkthroughPreviewState = null;
    if (walkthroughKind === 'main') {
      walkthroughPreviewState = {
        selectedId: state.selectedId,
        mode: state.mode,
        currentTime: state.currentTime,
        wasPlaying: state.playing,
        sidebarWasOpen: els.sidebar?.classList.contains('open') || false
      };
      const previewSong = state.songs.find(song => String(song.title).toLocaleLowerCase().startsWith('the wind rises'));
      setMode('demo');
      if (previewSong) selectSong(previewSong.id);
      startPlaybackClock();
    } else pausePlayback();
    walkthroughStepIndex = 0;
    if (els.tourDontShowAgain) els.tourDontShowAgain.checked = false;
    els.tourOverlay.hidden = false;
    renderWalkthroughStep();
    window.setTimeout(() => els.tourNextBtn?.focus(), 40);
  }

  function maybeStartWalkthrough() {
    if (!walkthroughIsSuppressed('main')) window.setTimeout(() => {
      if (state.mode === 'demo' && els.tourOverlay?.hidden) startWalkthrough('main');
    }, 650);
  }

  function nextWalkthroughStep() {
    if (walkthroughStepIndex >= activeWalkthroughSteps.length - 1) {
      finishWalkthrough();
      return;
    }
    if (walkthroughKind === 'main' && walkthroughStepIndex === 0) pausePlayback();
    walkthroughStepIndex += 1;
    renderWalkthroughStep();
  }

  function previousWalkthroughStep() {
    if (walkthroughStepIndex === 0) return;
    walkthroughStepIndex -= 1;
    if (walkthroughKind === 'main' && walkthroughStepIndex === 0) {
      if (state.currentTime >= state.duration - .02) restartSong();
      startPlaybackClock();
    }
    renderWalkthroughStep();
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function midiToName(midi) {
    const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const n = Number(midi);
    return `${names[((n % 12) + 12) % 12]}${Math.floor(n / 12) - 1}`;
  }

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'drum-song';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  }

  function escapeAttr(value) { return escapeHtml(value); }

  function bindEvents() {
    els.menuBtn.addEventListener('click', () => els.sidebar.classList.add('open'));
    els.sidebarClose.addEventListener('click', () => els.sidebar.classList.remove('open'));
    els.sidebarScrim?.addEventListener('click', () => els.sidebar.classList.remove('open'));
    els.songSearch.addEventListener('input', renderSongList);
    els.newSongBtn.addEventListener('click', () => openEditor());
    els.editBtn.addEventListener('click', () => {
      const song = selectedSong();
      if (song?.builtIn) openEditor({ ...song, id: null, sourceSongId: song.id, title: `${song.title} copy`, builtIn: false });
      else openEditor(song);
    });
    els.importBtn.addEventListener('click', () => els.importFile.click());
    els.importFile.addEventListener('change', () => els.importFile.files[0] && importSong(els.importFile.files[0]));
    els.libraryBtn?.addEventListener('click', () => { checkDemoCatalogUpdate(true); openSongLibrary('all'); });
    els.libraryTabAll?.addEventListener('click', () => setLibraryTab('all'));
    els.libraryTabEasy?.addEventListener('click', () => setLibraryTab('easy'));
    els.libraryTabMedium?.addEventListener('click', () => setLibraryTab('medium'));
    els.libraryTabHard?.addEventListener('click', () => setLibraryTab('hard'));
    els.libraryTabExpert?.addEventListener('click', () => setLibraryTab('expert'));
    els.librarySearch?.addEventListener('input', renderSongLibrary);
    els.libraryCommunityInfoBtn?.addEventListener('click', () => { els.songLibraryDialog?.close(); openCommunityDialog(); });
    els.exportBtn.addEventListener('click', exportSong);
    els.deleteBtn.addEventListener('click', deleteSelectedSong);
    els.restoreDemosBtn?.addEventListener('click', restoreDemoSongs);
    els.deleteEditorBtn.addEventListener('click', deleteEditorSong);
    els.editorGuideBtn?.addEventListener('click', () => openSongGuide('editor'));
    els.helpTourBtn?.addEventListener('click', () => startWalkthrough(state.mode === 'demo' ? 'main' : state.mode));
    els.tourNextBtn?.addEventListener('click', nextWalkthroughStep);
    els.tourBackBtn?.addEventListener('click', previousWalkthroughStep);
    els.tourSkipBtn?.addEventListener('click', () => finishWalkthrough({ suppress: true }));
    els.tourDontShowAgain?.addEventListener('change', () => {
      setWalkthroughSuppressed(walkthroughKind, els.tourDontShowAgain.checked);
    });
    els.submitCommunityBtn?.addEventListener('click', submitCommunitySong);
    els.catalogUpdateRefreshBtn?.addEventListener('click', () => window.location.reload());
    els.catalogUpdateLaterBtn?.addEventListener('click', () => {
      if (els.catalogUpdateBanner) els.catalogUpdateBanner.hidden = true;
    });
    buildColourPopover();
    els.pitchInfoBtn?.addEventListener('click', () => openSongGuide('instrument'));
    els.settingsBtn.addEventListener('click', openMyDrum);
    els.editInstrumentBtn?.addEventListener('click', () => { els.myDrumDialog?.close(); openSettings(); });
    els.exportInstrumentBtn?.addEventListener('click', exportInstrumentSettings);
    els.exportInstrumentFromSettingsBtn?.addEventListener('click', exportInstrumentSettings);
    els.importInstrumentBtn?.addEventListener('click', () => els.importInstrumentFile?.click());
    els.importInstrumentFile?.addEventListener('change', () => els.importInstrumentFile.files[0] && importInstrumentSettings(els.importInstrumentFile.files[0]));
    els.playBtn.addEventListener('click', togglePlayback);
    els.loopBtn.addEventListener('click', toggleLoop);
    els.setABtn?.addEventListener('click', () => setLoopPoint('A'));
    els.setBBtn?.addEventListener('click', () => setLoopPoint('B'));
    els.abLoopBtn?.addEventListener('click', toggleSectionLoop);
    els.clearABBtn?.addEventListener('click', () => clearABLoop());
    els.focusModeBtn?.addEventListener('click', toggleFocusMode);
    els.resultReplayBtn?.addEventListener('click', replayFromResults);
    els.practiceMistakesBtn?.addEventListener('click', practiceMistakesFromResults);
    els.resultRecommendedBtn?.addEventListener('click', playRecommendedFromResults);
    els.resultNextBtn?.addEventListener('click', selectNextSongFromResults);
    els.metronomeBtn.addEventListener('click', () => { state.metronome = !state.metronome; updateTransportUI(); });
    els.micBtn?.addEventListener('click', toggleMicrophone);
    els.speedSelect.addEventListener('change', () => {
      const wasPlaying = state.playing;
      if (wasPlaying) pausePlayback();
      state.speed = Number(els.speedSelect.value);
      renderFrame();
      if (wasPlaying) startPlaybackClock();
    });
    els.progress.addEventListener('input', () => {
      if (state.mode === 'wait') return;
      seekToTime((Number(els.progress.value) / 1000) * state.duration);
    });
    document.querySelectorAll('.segment').forEach(btn => btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
      maybeStartModeWalkthrough(btn.dataset.mode);
    }));
    document.querySelectorAll('.view-segment').forEach(btn => btn.addEventListener('click', () => setVisualMode(btn.dataset.view)));
    els.mobileViewToggleBtn?.addEventListener('click', () => {
      setVisualMode(state.visualMode === 'radial' ? 'lanes' : 'radial');
    });
    els.editorForm.addEventListener('submit', saveEditorSong);
    ['focus', 'click', 'select', 'keyup', 'input'].forEach(eventName => {
      els.sequenceInput.addEventListener(eventName, rememberSequenceSelection);
    });
    els.sequenceInput.addEventListener('click', placeSequenceCaretFromBackdropPoint);
    els.sequenceInput.addEventListener('input', () => {
      normalizeSequenceInputValue();
      const shortcutIndex = timingShortcutIndexBeforeCaret();
      clearTimingSelection();
      syncEditorTimelineFromCleanInput();
      stripTimingShortcutsFromInput();
      autoFormatSequenceInput();
      if (isTimingSelectable(shortcutIndex)) setTimingSelection([shortcutIndex], shortcutIndex);
      renderSequenceBackdrop();
      renderTimingEditor();
    });
    els.sequenceInput.addEventListener('beforeinput', handleSequenceTyping);
    els.sequenceInput.addEventListener('scroll', () => {
      if (!els.sequenceBackdrop) return;
      els.sequenceBackdrop.scrollTop = els.sequenceInput.scrollTop;
      els.sequenceBackdrop.scrollLeft = els.sequenceInput.scrollLeft;
    }, { passive: true });
    els.appendChordBtn?.addEventListener('click', prepareChordAtCursor);
    els.appendRestBtn?.addEventListener('click', () => insertTokenAtCursor('-'));
    els.appendBarBtn.addEventListener('click', () => insertTokenAtCursor('|'));
    els.copySequenceBtn?.addEventListener('click', copySequenceText);
    els.exportSheetBtn?.addEventListener('click', exportSheetPdf);
    els.discardDraftBtn?.addEventListener('click', () => {
      clearDraft();
      openEditor(state.songs.find(item => item.id === state.editorSongId) || null);
      showToast('Draft discarded.', 'success');
    });
    [els.songTitleInput, els.songBpmInput, els.songScaleSelect, els.sequenceInput].forEach(field => {
      field?.addEventListener('input', queueDraftSave);
      field?.addEventListener('change', queueDraftSave);
    });
    els.expressiveTimingToggle?.addEventListener('change', () => {
      setExpressiveTimingEnabled(els.expressiveTimingToggle.checked);
    });
    els.timingTokenStrip?.addEventListener('input', event => {
      const field = event.target.closest('.timing-lyric[data-timeline-index]');
      if (!field) return;
      const item = state.editorTimeline[Number(field.dataset.timelineIndex)];
      if (item) item.lyric = field.value;
      queueDraftSave();
    });
    els.timingTokenStrip?.addEventListener('keydown', event => {
      if (event.target.closest('.timing-lyric') && event.key === 'Enter') event.preventDefault();
    });
    els.timingTokenStrip?.addEventListener('mousedown', event => {
      // Stops shift-click from dragging a text selection across the sheet.
      if (event.shiftKey) event.preventDefault();
    });
    els.timingRangeBtn?.addEventListener('click', () => {
      if (state.editorTimingSelectionIndex < 0) return;
      state.editorRangeSelectArmed = !state.editorRangeSelectArmed;
      renderTimingEditor();
    });
    els.timingTokenStrip?.addEventListener('click', event => {
      if (event.target.closest('.timing-lyric')) return;
      const token = event.target.closest('.timing-token[data-timeline-index]');
      if (!token) return;
      const index = Number(token.dataset.timelineIndex);
      const anchor = state.editorTimingSelectionIndex;
      if ((event.shiftKey || state.editorRangeSelectArmed) && anchor >= 0) {
        const from = Math.min(anchor, index);
        const to = Math.max(anchor, index);
        const range = [];
        for (let i = from; i <= to; i += 1) range.push(i);
        setTimingSelection(range, anchor);
        state.editorRangeSelectArmed = false;
      } else if (event.ctrlKey || event.metaKey) {
        state.editorRangeSelectArmed = false;
        const next = new Set(timingSelectionIndices());
        if (next.has(index)) next.delete(index); else next.add(index);
        setTimingSelection([...next], index);
      } else {
        state.editorRangeSelectArmed = false;
        setTimingSelection([index], index);
      }
      renderTimingEditor();
    });
    els.timingChoiceGroup?.addEventListener('click', event => {
      const choice = event.target.closest('[data-duration]');
      if (!choice) return;
      const indices = timingSelectionIndices();
      if (!indices.length) return;
      const duration = Number(choice.dataset.duration);
      indices.forEach(index => {
        const item = state.editorTimeline[index];
        if (item && item.core !== '|') item.durationBeats = duration;
      });
      syncInputTimingMarkers(indices, duration);
      renderTimingEditor();
      renderSequenceBackdrop();
      queueDraftSave();
    });
    els.showPitchNamesToggle.addEventListener('change', () => {
      state.showPitchNames = els.showPitchNamesToggle.checked;
      localStorage.setItem(STORAGE_EDITOR_PITCH_NAMES, String(state.showPitchNames));
      renderMiniPads();
    });
    els.clearSequenceBtn.addEventListener('click', () => {
      els.sequenceInput.value = '';
      renderSequenceBackdrop();
      state.editorTimeline = [];
      clearTimingSelection();
      state.editorSelectionStart = 0;
      state.editorSelectionEnd = 0;
      els.sequenceInput.focus();
      renderTimingEditor();
    });
    els.instrumentKeySelect.addEventListener('change', () => refreshPresetTuning(true));
    els.scaleTypeSelect.addEventListener('change', () => refreshPresetTuning(false));
    els.noteCountSelect.addEventListener('change', () => {
      // Each drum size has a factory tuning; jump to it rather than leaving a stale key/scale.
      const count = Number(els.noteCountSelect.value);
      const factory = COUNT_DEFAULTS[count];
      if (factory && (!state.instrument || state.instrument.count !== count)) {
        els.instrumentKeySelect.value = factory.key;
        els.scaleTypeSelect.value = factory.scale;
        els.rootOctaveSelect.value = String(factory.octave);
      }
      refreshPresetTuning();
      syncAllRowOctaves();
      syncHighDrumOption();
      renderCompanionPresetFromSettings();
    });
    els.highDrumToggle.addEventListener('change', syncHighDrumOption);
    els.rootOctaveSelect.addEventListener('change', () => { refreshPresetTuning(true); syncAllRowOctaves(); });
    els.tuningGrid.addEventListener('click', event => {
      const chip = event.target.closest('.colour-chip');
      if (!chip) return;
      if (state.colourTargetRow === chip.closest('.tuning-row')) closeColourPopover();
      else openColourPopover(chip);
    });
    els.tuningGrid.addEventListener('change', event => {
      if (event.target.matches('.tuning-note')) {
        els.scaleTypeSelect.value = 'custom';
        syncRowOctave(event.target.closest('.tuning-row'));
      }
    });
    els.tuningGrid.addEventListener('scroll', closeColourPopover, { passive: true });
    els.companionTuningGrid.addEventListener('click', event => {
      const chip = event.target.closest('.colour-chip');
      if (!chip) return;
      if (state.colourTargetRow === chip.closest('.tuning-row')) closeColourPopover();
      else openColourPopover(chip);
    });
    els.companionTuningGrid.addEventListener('change', event => {
      if (event.target.matches('.tuning-note')) syncRowOctave(event.target.closest('.tuning-row'));
    });
    els.companionTuningGrid.addEventListener('scroll', closeColourPopover, { passive: true });
    els.colourPopover.addEventListener('click', event => {
      const swatch = event.target.closest('.swatch[data-color]');
      if (!swatch) return;
      setRowColor(state.colourTargetRow, swatch.dataset.color);
      closeColourPopover();
    });
    els.colourPopover.addEventListener('input', event => {
      if (event.target.id === 'colourPopoverCustom') setRowColor(state.colourTargetRow, event.target.value);
    });
    els.colourPopover.addEventListener('change', event => {
      if (event.target.id === 'colourPopoverCustom') closeColourPopover();
    });
    document.addEventListener('pointerdown', event => {
      if (!state.colourTargetRow) return;
      if (event.target.closest('.colour-popover') || event.target.closest('.colour-chip')) return;
      closeColourPopover();
    }, true);
    els.settingsDialog.addEventListener('close', closeColourPopover);
    els.settingsForm.addEventListener('submit', saveSettings);
    [els.editorForm, els.settingsForm].forEach(form => {
      form.addEventListener('input', event => event.target.classList?.remove('invalid-field'));
      form.addEventListener('change', event => event.target.classList?.remove('invalid-field'));
    });
    document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.closeDialog);
      if (dialog?.open) dialog.close();
    }));
    window.addEventListener('keydown', keyboardHandler);
    window.addEventListener('resize', () => {
      if (state.focusMode && window.innerWidth > 1100) setFocusMode(false);
      resizeCanvas();
      positionWalkthrough();
    });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.focusMode && !document.querySelector('dialog[open]')) {
        event.preventDefault();
        setFocusMode(false);
      }
    });
    window.addEventListener('keydown', event => {
      if (!els.tourOverlay || els.tourOverlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        finishWalkthrough();
      } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
        nextWalkthroughStep();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopImmediatePropagation();
        previousWalkthroughStep();
      }
    }, true);
    window.addEventListener('pagehide', stopMicrophone);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAmbientLoop();
        setAudioMuted(true);
        if (state.animationId) {
          cancelAnimationFrame(state.animationId);
          state.animationId = 0;
        }
        return;
      }

      // Background tabs stop receiving normal animation frames. Resynchronise the visual
      // clock, mark every elapsed note as already scheduled, then unmute. This prevents
      // the frightening burst where all notes missed in another tab played at once.
      if (state.playing && state.mode !== 'wait') {
        const now = performance.now();
        state.currentTime = Math.min(state.duration, ((now - state.playbackStartedAt) / 1000) * state.speed);
        state.lastScheduledIndex = noteIndexAtOrAfter(state.currentTime + 0.001) - 1;
        state.lastMetronomeBeat = Math.floor(state.currentTime / state.secondsPerBeat);
        state.lastVisualAt = 0;
        updatePracticeUI();
        renderFrame();
        if (state.currentTime >= state.duration - 0.002) {
          setAudioMuted(false);
          finishPlayback();
        } else {
          setAudioMuted(false);
          state.animationId = requestAnimationFrame(tick);
        }
      } else {
        setAudioMuted(false);
      }
      startAmbientLoop();
    });
    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(resizeCanvas);
      state.resizeObserver.observe(els.noteStage);
    }
  }

  function init() {
    loadData();
    bindEvents();
    renderInstrument();
    updateMicUI();
    renderSongList();
    selectSong(state.selectedId);
    startDemoCatalogPolling();
    maybeStartWalkthrough();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      const hadController = Boolean(navigator.serviceWorker.controller);
      let reloadingForUpdate = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || reloadingForUpdate) return;
        reloadingForUpdate = true;
        window.location.reload();
      });
      navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' })
        .then(registration => {
          registration.update().catch(() => {});
          window.addEventListener('focus', () => registration.update().catch(() => {}));
        })
        .catch(() => {});
    }
  }

  init();
})();
