/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static openDatabase() {
    
    return idb.open('restdb', 3,function(upgradeDb) {
      console.log('making a new object store');
      if (!upgradeDb.objectStoreNames.contains('restauList')) {
        upgradeDb.createObjectStore('restauList', {
          keyPath: 'id'
        });
      }});
  }
  
  /**
   * Fetch all restaurants.
   */
  static dbstore(){
    let urlToFetch;
    const dbPromise = this.openDatabase();
    // console.log(dbPromise);
    // if (!id){
    urlToFetch= this.DATABASE_URL;
    // }else{
    //   urlToFetch= this.DATABASE_URL + "/" + id;
    // }
    // console.log(urlToFetch);
    fetch(urlToFetch).then(response => {
      console.log(response);
      response.json().then(restaurants=>{
        // console.log(restaurants)
        dbPromise.then(db=>{
          var transaction = db.transaction(['restauList'], 'readwrite');
          var store = transaction.objectStore('restauList');
          // store.put('test','foo');
          restaurants.forEach(function (restaurant) {
            // console.log(restaurant.id);
            store.put(
              restaurant
              // restaurant.id
            );
          })
        })
      })
    })
    .catch(error => {
      callback(`Request failed. Returned status of ${error}`, null);
    })
  }
  static dbretrieve(){
    const dbPromise = this.openDatabase();
    return dbPromise.then(db=>{
      var transaction = db.transaction(['restauList'], 'readwrite');
      var store = transaction.objectStore('restauList');
      let data= store.getAll().then(elements => {
        console.log(elements);
        return elements;
      });;
        console.log(data);
        return data;
    });
  }
  static fetchData(){
    this.dbstore();
  }
  static fetchRestaurants(callback) {
    
    // var test2=this.dbstore();
    // console.log(test2);
    // callback(null, test2);
    let cachedData = this.dbretrieve();
    console.log(cachedData);
    // callback(null, cachedData);
    cachedData.then(data => {
    //  check if the data is available
    if (data) {
        callback(null, data);
    } 
    });

  }
  
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.

    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    this.fetchData();
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
