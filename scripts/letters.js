var locale_sort = function(a, b) {
  var langs = {
    'lt': {"A":0,"Ą":1,"B":2,"C":3,"Č":4,"D":5,"E":6,"Ę":7,"Ė":8,"F":9,"G":10,"H":11,"I":12,"Į":13,"Y":14,"J":15,"K":16,"L":17,"M":18,"N":19,"O":20,"P":21,"R":22,"S":23,"Š":24,"T":25,"U":26,"Ų":27,"Ū":28,"V":29,"Z":30,"Ž":31}
      },
      abc = langs[this];
  if (abc) {
    if (abc[a] < abc[b]) return -1;
    if (abc[a] > abc[b]) return 1;
    return 0;
  }
  return a.localeCompare(b);
};

var LettersViewModel = function(data, lang, tag) {
  var self = this;
  
  self.data = data;

  self.languages = Object.keys(self.data).sort(function(a, b) { return a.localeCompare(b); });

  if (self.languages.indexOf(lang) == -1) lang = 'en';
  self.language = ko.observable(lang);
  self.tag = ko.observable(self.data[self.language()][tag] ? tag : 'all');

  self.tags = ko.computed(function() {
    var lang = self.language(),
        tags = [];
    if (!lang) return;
    Object.keys(self.data[lang]).forEach(function(tag_id) {
      var tag_text = tag_id;
      if (LettersTags[tag_id] && LettersTags[tag_id][lang]) {
        tag_text = LettersTags[tag_id][lang];
      }
      tags.push({'id': tag_id, 'text': tag_text});
    });
    return tags.sort(function(a, b) {
      if (a.id == 'all') return -1;
      return a.text.localeCompare(b.text);
    });
  });

  self.letters = ko.computed(function() {
    var lang = self.language(),
        tag = self.tag();
    if (!lang || !tag) return;
    return Object.keys(self.data[lang][tag]).sort(locale_sort.bind(lang));
  });
 
  self.window_visible = ko.observable(false);
  self.last_letter = ko.observable();
  self.last_letters = ko.observable();
  self.last_index = ko.observable();
  self.img_el = document.querySelector('.letter_img');
  self.audio = document.createElement('audio');
  self.audio.autoplay = true;
  self.audio_destroy = function() {
    if (!self.audio_destroy.event_callback) return;
    var audio = self.audio,
        callback = self.audio_destroy.event_callback;
    self.audio_destroy.event_callback = null;
    audio.removeEventListener('error', callback);
    audio.removeEventListener('ended', callback);
    audio.src = '';
  };

  self.window_visible.subscribe(function(visible) {
    if (!visible) self.audio_destroy();
  });

  self.play = function(letter) {
    var lang = self.language(),
        tag = self.tag(),
        thing;

    if (letter) {
      self.last_index(0);
      thing = self.data[lang][tag][letter][0];
    }
    else {
      var index = self.last_index(),
          letter_items = self.data[lang][tag][self.last_letter()].length;
      if (index < letter_items - 1) {
        letter = self.last_letter();
        index++;
        self.last_index(index);
        thing = self.data[lang][tag][letter][index];
      }
      else {
        var last_letter_index = self.letters().indexOf(self.last_letter()),
            letter_count = self.letters().length;
        if (last_letter_index == letter_count - 1) {
          letter = self.letters()[0];
        }
        else {
          letter = self.letters()[last_letter_index + 1];
        }
        self.last_index(0);
        thing = self.data[lang][tag][letter][0];
      }
    }
 
    var img_el = self.img_el,
        sound_srcs = [],
        complete = 0,
        total = 4,
        oncomplete = function() {
          self.last_letter(letter);
          self.last_letters(thing.name.toLocaleUpperCase().slice(1));
          self.window_visible(true);
          var audio = self.audio,
              next_sound = function() {
                if (!sound_srcs.length) {
                  self.audio_destroy(next_sound);
                  return;
                }
                audio.src = sound_srcs.shift();
              };

          audio.addEventListener('error', next_sound);
          audio.addEventListener('ended', next_sound);
          self.audio_destroy.event_callback = next_sound;
          next_sound();
        };

    img_el.src = '';
    img_el.onload = oncomplete;
    
    img_el.src = 'images/' + thing.collection + '/' + thing.img;
    sound_srcs.push(['sounds', 'translations', lang, 'letters', letter + '.ogg'].join('/'));
    sound_srcs.push(['sounds', 'silence-1s.ogg'].join('/'));
    sound_srcs.push(['sounds', 'translations', lang, 'words', thing.name.toLocaleLowerCase() + '.ogg'].join('/'));
    if (thing.sounds) {
      sound_srcs.push(['sounds', 'silence-1s.ogg'].join('/'));
      sound_srcs.push(['sounds', 'silence-1s.ogg'].join('/'));
      thing.sounds.forEach(function(sound_name) {
        sound_srcs.push(['sounds', thing.collection, sound_name + '.ogg'].join('/'));
      });
    }
  };
  self.play_next = function() {
    self.audio_destroy();
    self.play();
  };

  // keep note of the current state
  ko.computed(function() {
    var lang = self.language(),
        tag = self.tag();
    window.location.hash = lang + '/' + tag;
  });
};

var LettersData = {};
