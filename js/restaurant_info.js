let restaurant;
let reviews;
// var map;
// Register service worker
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function() {
//     navigator.serviceWorker.register('/sw.js').then(function(registration) {
//       // Registration was successful
//       console.log('ServiceWorker registration successful with scope: ', registration.scope);
//     }, function(err) {
//       // registration failed :(
//       console.log('ServiceWorker registration failed: ', err);
//     });
//   });
// }
/**
 * Initialize Google map, called from HTML.
 */
window.initMap2 = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant, reviews) => {
      self.restaurant = restaurant;
      self.reviews = reviews;
      // console.log("var",restaurant,reviews);
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favorite = document.getElementById('restaurant-favorite');
  favorite.innerHTML = '❤';
  favorite.classList.add("favorite_btn");
  if (restaurant.is_favorite){
    favorite.classList.add("favorite");
    favorite.setAttribute("aria-label","favorite");
  }else{
    favorite.classList.remove("favorite");
    favorite.setAttribute("aria-label","not a favorite");
  }
  favorite.onclick= ()=> {
    let favStatus= !restaurant.is_favorite;
    DBHelper.changeFavStatus(restaurant.id,favStatus);
    if (favStatus){
      favorite.classList.add("favorite");
      favorite.setAttribute("aria-label","favorite");
    }else{
      favorite.classList.remove("favorite");
      favorite.setAttribute("aria-label","not a favorite");
    }
    restaurant.is_favorite = !restaurant.is_favorite;
  }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = `Image of ${restaurant.name} Restaurant`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews=self.reviews) => {
  // console.log("reviews in info",reviews)
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  // add reviews
  // const pRev = document.getElementById('reviews-add');
  // pRev.innerHTML= createFormReview();
  // container.appendChild(pRev);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  const li = document.createElement('li');
  li.innerHTML = createFormReview();
  ul.appendChild(li);
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  const date = document.createElement('p');
  let rdate = new Date(review.createdAt);
  date.innerHTML = rdate;
  li.appendChild(date);

  return li;
}

// create form to add review
createFormReview = ()=>{
  let form = `
    <h4> Add your own Review </h4>
    <form id="review-add">
    <div>
    <label for="Reviewer">Your Name : </label>
    <input id="Reviewer" name="name" type="text"/>
    </div>
    <p></p>
    <div> 
      <p>Your Ratings : 
      <select aria-label="Rating selection" id="ratings" name="Ratings">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select></p>
    </div>
    <label for="review-comments">Your Comments : </label>
    <br>
    <textarea id="review-comments" name="comments"></textarea>
    <br>
    <button class="submit-form" onclick="addReview()">Post Review!</button>
    </form>
  `
  // console.log(form);
  return form
}

addReview= ()=>{
  event.preventDefault();
  // data from form
  let rest_id = self.restaurant.id;
  let name = document.getElementById("Reviewer").value;
  let rating = document.querySelector("#ratings option:checked").value;
  let comments = document.getElementById("review-comments").value;
  // console.log(rest_id,name,rating,comments);

  // create review object
  let reviewObject = {
    "restaurant_id": rest_id,
    "name": name,
    "rating": rating,
    "comments": comments,
    "createdAt": new Date()
  }
  console.log(reviewObject);
  let status=DBHelper.addReview(reviewObject);
  console.log(status);
  document.getElementById("review-add").reset();

  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');
  if (status==="offline"){
    const offmessage = document.createElement('p');
    offmessage.innerHTML = `Offline reviews`;
    ul.appendChild(offmessage);
  }
  ul.appendChild(createReviewHTML(reviewObject));
  
  container.appendChild(ul);
  

}
/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
