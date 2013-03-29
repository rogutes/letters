// transform LettersData to data.lt.animals.A = [{img: 'animals/horse_white.jpg', name: 'Arklys'}]
var data = {};
Object.keys(LettersData).forEach(function(collection) {
  Object.keys(LettersData[collection]).forEach(function(img_filename) {
    var img_desc = LettersData[collection][img_filename];
    img_desc.languages.forEach(function(lang_item) {
      if (!data[lang_item.id]) data[lang_item.id] = {'all': {}};
      var lang_ref = data[lang_item.id],
          name = lang_item.name,
          letter = lang_item.name[0],
          item_ref = {img: collection + '/' + img_filename, name: name};

      if (!lang_ref.all[letter]) lang_ref.all[letter] = [];
      lang_ref.all[letter].push(item_ref);

      img_desc.tags.forEach(function(tag) {
        if (!lang_ref[tag]) lang_ref[tag] = {};
        var tag_ref = lang_ref[tag];
        if (!tag_ref[letter]) tag_ref[letter] = [];
        tag_ref[letter].push(item_ref);
      });
    });
  });
});

var hash = window.location.hash,
    lang = 'lt',
    tag = 'abc';
if (hash) {
  hash = hash.slice(1).split('/');
  if (hash.length == 2)  {
    lang = hash[0];
    tag = hash[1];
  }
}

var vm = new LettersViewModel(data, lang, tag);
ko.applyBindings(vm, document.body);
