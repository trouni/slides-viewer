# Ajax in Rails
---
## Let's start from scratch

--

### Generate new Restaurant app

```bash
rails new \
  --database postgresql \
  -m https://raw.githubusercontent.com/lewagon/rails-templates/master/minimal.rb \
  restaurants_ajaxified
```

```bash
cd restaurants_ajaxified
```

--

### Models

```bash
rails g model Restaurant name address
rails g model Review content:text restaurant:references
rails db:migrate
```

```ruby
# app/models/restaurant.rb
class Restaurant < ApplicationRecord
  has_many :reviews, dependent: :destroy
end
```
<!-- .element: class="model" -->

```ruby
# app/models/review.rb
class Review < ApplicationRecord
  belongs_to :restaurant
  validates :content, length: { minimum: 20 }
end
```
<!-- .element: class="model" -->

```bash
git add app/models db/*
git commit -m "Generate Restaurant & Review models"
```

--

### Seed

```ruby
# db/seeds.rb
puts 'Creating restaurants...'
Restaurant.create!({
  name: "Le Dindon en Laisse",
  address: "18 Rue Beautreillis, 75004 Paris, France"
})
Restaurant.create!({
  name: "Neuf et Voisins",
  address: "Van Arteveldestraat 1, 1000 Brussels, Belgium"
})
puts 'Finished!'
```

```bash
rails db:seed
```

```bash
git add db/seeds.rb
git commit -m "Seed 2 restaurants"
```

--

### Restaurant Controller & Routes

```bash
rails g controller restaurants
```

```ruby
# config/routes.rb
Rails.application.routes.draw do
  resources :restaurants, only: [ :index, :show ]
end
```
<!-- .element: class="router" -->

```ruby
# app/controllers/restaurants_controller.rb
class RestaurantsController < ApplicationController
  def index
    @restaurants = Restaurant.all
  end

  def show
    @restaurant = Restaurant.find(params[:id])
  end
end
```
<!-- .element: class="controller" -->

--

### Restaurant Index View

```erb
<!-- app/views/restaurants/index.html.erb -->
<h1>Restaurants</h1>

<ul>
  <% @restaurants.each do |restaurant| %>
    <li><%= link_to restaurant.name, restaurant_path(restaurant) %></li>
  <% end %>
</ul>
```
<!-- .element: class="view" -->

--

### Restaurant Show View


```erb
<!-- app/views/restaurants/show.html.erb -->
<h1><%= @restaurant.name %> <small><%= @restaurant.address %></small></h1>
<h2>
  <%= pluralize @restaurant.reviews.size, "review" %>
</h2>

<div id="reviews">
  <% if @restaurant.reviews.blank? %>
    Be the first to leave a review for <%= @restaurant.name %>
  <% else %>
    <% @restaurant.reviews.each do |review| %>
      <p><%= review.content %></p>
    <% end %>
  <% end %>
</div>
```

--

```bash
git status
git add .
git commit -m "Add Restaurant index & show views"
```

--

We want to add reviews to a restaurant, with the form inlined in the restaurant show view.

--

### Add a new route

```ruby
# config/routes.rb
Rails.application.routes.draw do
  resources :restaurants, only: [ :index, :show ] do
    resources :reviews, only: :create
  end
end
```
<!-- .element: class="router" -->

--

```bash
rails g controller reviews
```

```ruby
# app/controllers/reviews_controller.rb
class ReviewsController < ApplicationController
  def create
    @restaurant = Restaurant.find(params[:restaurant_id])
    @review = Review.new(review_params)
    @review.restaurant = @restaurant
    if @review.save
      redirect_to restaurant_path(@restaurant)
    else
      render 'restaurants/show'
    end
  end

  private

  def review_params
    params.require(:review).permit(:content)
  end
end
```
<!-- .element: class="controller" -->

--

### Review form

```ruby
class RestaurantsController < ApplicationController
  # [...]
  def show
    @restaurant = Restaurant.find(params[:id])
    @review = Review.new  # <-- You need this now.
  end
end
```

```erb
<!-- app/views/restaurants/show.html.erb -->

<!-- [...] -->

<%= simple_form_for([ @restaurant, @review ]) do |f| %>
  <%= f.input :content, as: :text %>
  <%= f.button :submit %>
<% end %>
```
<!-- .element class="view" -->

--

It works!

```bash
git status
git add .
git commit -m "Add review to restaurant"
```

---

## Let's ajaxify this app

--

### `remote: true`

```erb
<!-- app/views/restaurants/show.html.erb -->
<!-- [...] -->

<%= simple_form_for([ restaurant, review ], remote: true) do |f| %>
  <%= f.input :content %>
  <%= f.button :submit %>
<% end %>
```
<!-- .element class="view" -->

![](/karr/karr.kitt/assets/rails/remote_true_ajax_headers-d6cad417e3916f2add2938a1f95ffb68db0a396b9c8a6d6798568369a3044a09.png)

--

That's it!

Thanks to [Turbolinks](https://github.com/turbolinks/turbolinks) 🚀

--

### Turbolinks

A [JavaScript library](https://github.com/turbolinks/turbolinks) to speed up navigation

Activated with `rails new`

--

### Speed up links

Navigation is in AJAX _by default_

Open the network tab and navigate from the [index](http://localhost:3000/restaurants) to one of the restaurants:

![](/karr/karr.kitt/assets/rails/get_request_turbolinks-5ececa489737a83fb1ec034dc676a7ce7dfec8aca843a109597381eab1014ec8.png)

--

### Under the hood

Replaces the `<body>` in JavaScript

Turbolinks behaves **roughly** as if we had:

```js
// Note: don't copy paste this code, it's a metaphor
document.body.innerHTML = response.body;
```

[Source code](https://github.com/turbolinks/turbolinks/blob/866a29c861b0e0e0625a06189a49e29abd7a344a/src/snapshot_renderer.ts#L125-L127)

--

### POST forms

For `POST` requests, just add `remote: true` like we did

Works out of the box 🎁

--

### Rendering form with errors

Except... with `render`

```ruby
# Gemfile
gem 'turbolinks_render'
```

```bash
bundle install
```

Restart your server and try again

--

### Keeping the context (1)

To avoid scrolling up to the top of the page, add an `id` to the review:


```erb
<!-- app/views/restaurants/show.html.erb -->
<!-- [...] -->

<div id="reviews">
  <% if @restaurant.reviews.blank? %>
    Be the first to leave a review for <%= @restaurant.name %>
  <% else %>
    <% @restaurant.reviews.each do |review| %>
      <p id="review-<%= review.id %>"><%= review.content %></p>
    <% end %>
  <% end %>
</div>
```

--

### Keeping the context (2)

Redirect with an [`anchor`](https://www.rapidtables.com/web/html/link/html-anchor-link.html) to scroll to the last review

```ruby
# app/controllers/reviews_controller.rb
# [...]

  def create
    @restaurant = Restaurant.find(params[:restaurant_id])
    @review = Review.new(review_params)
    @review.restaurant = @restaurant
    if @review.save
      redirect_to restaurant_path(@restaurant, anchor: "review-#{@review.id}")
    else
      render 'restaurants/show'
    end
  end
```

--

### Unobtrusive JavaScript

Make sure this is set to `true`:

```ruby
# config/application.rb

# [...]
  class Application < Rails::Application
    config.action_view.embed_authenticity_token_in_remote_forms = true
    # [...]
  end
```

Your form works with JavaScript enabled **or** disabled.

[Unobtrusive JavaScript](https://www.w3.org/wiki/The_principles_of_unobtrusive_JavaScript) FTW

--

### DELETE LINK

You can use this technique with `link_to` as well.

--

```erb
<!-- app/views/restaurants/index.html.erb -->
<ul>
  <% @restaurants.each do |restaurant| %>
    <li>
      <%= restaurant.name %>
      <%= link_to "Delete", restaurant, method: :delete, remote: true %>
    </li>
  <% end %>
</ul>
```
<!-- .element: class="view" -->

```ruby
# app/controllers/restaurants_controller.rb
class RestaurantsController < ApplicationController
  # TODO: Add `:destroy` in `config/routes.rb`
  def destroy
    @restaurant = Restaurant.find(params[:id])
    @restaurant.destroy
    redirect_to restaurants_path
  end
end
```

---

### However

Changing the whole `<body>` may not be optimal, for instance when:

- the HTML to update is thin and very localized
- we want to keep the current state of the rest of the page

--

### Dynamic counter

Let's code a **counter** that we can inject anywhere

```ruby
class ApplicationController
  before_action :set_counter

  private

  def set_counter
    @restaurant_count = Restaurant.count
  end
end
```

--

### View

```erb
<!-- app/views/pages/home.html.erb -->
<div class="flex-center mt-4">
  <div class="counter">
    <span><%= @restaurant_count %></span>
  </div>

  <button class="btn btn-outline-secondary">Refresh counter</button>
</div>
```

Let's start with a simple counter and a button to refresh the count

--

### CSS

Pick up this style and `@import` it in the `index.scss`

```scss
// app/assets/stylesheets/components/_counter.scss

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.counter {
  width: 56px;
  border-radius: 50%;
  color: white;
  text-align: center;
  padding: 1rem;
  background-color: #7e73ff;
  margin-right: 2rem;
}
```

--

Let's do it in pure **JavaScript**

---

## Stimulus + fetch

--

### Stimulus JS

A JavaScript [library](https://github.com/stimulusjs/stimulus) that pairs well with Turbolinks.

Read the [Handbook](https://stimulusjs.org/handbook/origin)

--

### Stimulus in Rails

Quick setup in rails:

```bash
rails webpacker:install:stimulus
```

Check your `app/javascript/packs/application.js`

<br>
<br>
**⚠️ Warning**
<br>
The automatically generated `hello_controller.js` is using Stimulus v1 syntax and is deprecated.

--

### Stimulus Controller

```bash
touch app/javascript/controllers/counter_controller.js
```

```js
import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    console.log('Hello!');
  }
}
```

--

### Data-Controller

Add a `data-controller`

```erb
<div class="flex-center mt-4" data-controller="counter">
  <div class="counter">
    <span><%= @restaurant_count %></span>
  </div>

  <button class="btn btn-outline-secondary">Refresh counter</button>
</div>
```

Set it in the first `div` that contains both:

- the element listening to an event (the button)
- the element you want to update (the counter)

--

### Data-target

Select elements with **targets**


```erb
<div class="flex-center mt-4" data-controller="counter">
  <div class="counter">
    <span data-counter-target="count"><%= @restaurant_count %></span>
  </div>

  <button class="btn btn-outline-secondary">Refresh counter</button>
</div>
```

`data-controller-name-target="targetName"`

--

### Targets

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'count' ];

  connect() {
    console.log(this.countTarget);
  }
}
```

`this.countTarget` returns the first one, `this.countTargets` returns them all

--

### Data-action

Listening to the `click` event on the button:

```erb
<div class="flex-center mt-4" data-controller="counter">
  <div class="counter">
    <span data-counter-target="count"><%= @restaurant_count %></span>
  </div>

  <button class="btn btn-outline-secondary"
          data-action="click->counter#refresh">Refresh counter</button>
</div>
```

Syntax: `event->controller-name#actionName`

--

### Action

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'count' ];

  refresh(event) {
    console.log(event);
  }
}
```

Let's `fetch` the number of restaurants!

--

### Fetch restaurants

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'count' ];

  refresh() {
    fetch('/restaurants', { headers: { accept: "application/json" } })
      .then(response => response.json())
      .then((data) => {
        console.log(data);
      });
  }
}
```

Don't forget the "Accept" header!

--

### Render json

Rails controllers can render different formats based on the request's "Accept" header:

```ruby
# app/controllers/restaurants_controller.rb
# [...]
  def index
    @restaurants = Restaurant.all
    respond_to do |format|
      format.html
      format.json { render json: { restaurants: @restaurants } }
    end
  end
```

It will answer to our fetch call with a JSON file

--

### Update callback

Let's refresh the counter in the DOM

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'count' ];

  refresh() {
    fetch('/restaurants', { headers: { accept: 'application/json' } })
      .then(response => response.json())
      .then((data) => {
        this.countTarget.innerText = data.restaurants.length;
      });
  }
}
```

--

### Test

Open a `rails c` and create a restaurant:

```ruby
Restaurant.create(name: "PNY", address: "96 rue Oberkampf 75011")
```

Click on refresh

--

### Automatic Refresh

Let's now **remove the button** and refresh every 5 seconds

--

### Set interval

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'count' ];

  connect() {
    setInterval(this.refresh, 5000);
  }

  refresh = () => {
    fetch('/restaurants', { headers: { accept: "application/json" }})
      .then(response => response.json())
      .then((data) => {
        this.countTarget.innerText = data.restaurants.length;
      });
  }
}
```

⚠️ Notice the `=>` in the `refresh` definition!

--

### Test

1. open the `Network` tab in your browser
1. open a `rails c` to create new restaurants

--

That's it 🎉

You can now reuse this **real-time** counter anywhere in your app!

--

### Stimulus takeaways

- `querySelector` is replaced by `data-target`
- `addEventListener` is replaced by `data-action`
- the `data-controller` wraps the other elements

--

### Syntax

- `data-controller="controller-name"`
- `data-controller-name-target="targetName"`
- `data-action="event->controller-name#actionName"`

---

### Going further with fetch in Rails

Cf [tutorial](https://kitt.lewagon.com/knowledge/tutorials/fetch_in_rails) written by [@Martin-Alexander](https://kitt.lewagon.com/alumni/Martin-Alexander) 🙏

- Using fetch with `POST`, `PATCH`, `DELETE`
- Using fetch with **authenticated** users

---

## Happy Ajaxification!
