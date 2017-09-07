
var sampleShoppingList = {
  "_id": "list:cj6mj1zfj000001n1ugjfkj33",
  "type": "list",
  "version": 1,
  "title": "Groceries",
  "checked": false,
  "place": {
    "title": "Healthy Living",
    "license": null,
    "lat": null,
    "lon": null,
    "address": null
  },
  "createdAt": "2017-08-21T18:40:00.000Z",
  "updatedAt": "2017-08-21T18:40:00.000Z"
};

// Vue app
Vue.use(VueMaterial);

// theme
Vue.material.registerTheme('default', {
  primary: 'blue',
  accent: 'red',
  warn: 'red',
  background: 'grey'
})


var app = new Vue({
  el: '#app',
  data: {
    mode: 'showlist',
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    newShoppingListName: '',
    newShoppingListPlaceName: '',
    db: null
  },
  created: () => {

    // initialize PouchDB
    db = new PouchDB('shopping');

    // create database index ordered by updatedAt date
    db.createIndex({ index: { fields: ['updatedAt'] }}).then(() => {
      // load all 'list' items ordered by updated date
      var q = {
        selector: {
          type: 'list',
          updatedAt: { '$gt': '' }
        },
        sort: [ { 'updatedAt': 'desc' }]
      };
      return db.find(q)
    }).then((data) => {
      // write the data to the Vue model, and from there the web page
      app.shoppingLists = data.docs;
    });

  },
  computed: {
    newShoppingListDisabled: function() {
      return (this.newShoppingListName.length == 0 || this.newShoppingListPlaceName == 0);
    }
  },
  methods: {
    onClickAddShoppingList: function(e) {
      // open shopping list form
      this.newShoppingListName = '';
      this.newShoppingListPlaceName = '';
      this.mode='addlist';
    },
    onClickSaveShoppingList: function() {
      // clone the sample shopping list, add our data into it
      var obj = JSON.parse(JSON.stringify(sampleShoppingList));
      obj._id = 'list:' + cuid();
      obj.title = this.newShoppingListName;
      obj.place.title = this.newShoppingListPlaceName;

      // add timestamps
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();

      // add to on-screen list
      this.shoppingLists.unshift(obj);
      this.mode='showlist';
      
      // write to database
      db.put(obj).then(function(data) {
        // keep the revision tokens
        obj._rev = data.rev;
      });
    },
    onClickCancelShoppingList: function() {
      this.mode='showlist';
    }
  }
})