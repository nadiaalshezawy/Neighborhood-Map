///create the Map
var markers = [];
var map;

function initMap() {
	// Constructor creates a new map
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 25.196658,
			lng: 55.272043
		},
		zoom: 10,
		styles: styles,
	});

	// Style the markers a bit. This will be our listing marker icon.
	var defaultIcon = makeMarkerIcon('3e5a87');
	// Create a "highlighted location" marker color for when the user
	// mouses over the marker.
	var highlightedIcon = makeMarkerIcon('FFFF24');
	var largeInfowindow = new google.maps.InfoWindow();
	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			position: position,
			title: title,
			map: map,
			icon: defaultIcon,
			id: i
		});
		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open the large infowindow at each marker.
		marker.addListener('click', function () {
			FourSquareInfo(this, largeInfowindow);
			this.setAnimation(google.maps.Animation.BOUNCE);
			this.setAnimation(4);
		});
		// Two event listeners - one for mouseover, one for mouseout,
		// to change the colors back and forth.
		marker.addListener('mouseover', function () {
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function () {
			this.setIcon(defaultIcon);
		});
	}
}

// This function will loop through the markers array and display filterMarker
function FilteredListings(type) {

	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 0; i < locations.length; i++) {
		//check for the selected Category
		if (locations[i].category == type || type == undefined || type == 'All') {
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		} else {
			markers[i].setMap(null);
		}
	}
	map.fitBounds(bounds);

}

// This function populates the infowindow form FourSquare API when the marker is clicked.
function FourSquareInfo(marker, infowindow) {
	var client_id = "4N3RQBCJFJVZQDOYODEVNJ4XWLDP2PJPNYKVERHIAZYMKHQV";
	var client_secret = "UC5SLFD50JPDEW1PJM44ZPMM3MSHXJGKJEEWA4ZVVWIAEKGJ";
	//formatting the url
	var query = marker.title;
	query = query.replace(/ /g, "+");
	ll = (marker.position).toString();
	ll = ll.replace("(", "");
	ll = ll.replace(")", "");
	//first url for getting venue id
	var url = "https://api.foursquare.com/v2/venues/search?client_id=" + client_id + "&client_secret=" + client_secret + "&v=20130815&ll=" + ll + "&query=" + query;
	//call the fetch function
	fetch(url) // Call the fetch function passing the url of the API as a parameter
		.then(response => response.json())
		.then(data => {
			console.log(data);
			//get the id of venue
			id = data.response.venues[0].id;
			//second url to get rating and hours of venue
			var url2 = "https://api.foursquare.com/v2/venues/" + id + "?client_id=" + client_id + "&client_secret=" + client_secret + "&v=20130815";
			console.log(url2);

			//infowindow.setContent('<div>' +id + '</div>');
			//infowindow.open(map, marker);
			fetch(url2) // Call the fetch function passing the url of the API as a parameter
				.then(response2 => response2.json())
				.then(data2 => {

					console.log(data2);
					//getting name, rating and hour of venue
					name = data2.response.venue.name;
					rating = data2.response.venue.rating;
					hours = data2.response.venue.hours.status;
					// id=data.response.venues[0].id;
					// var url2="https://api.foursquare.com/v2/venues/"+id+"?client_id="+client_id+"&client_secret="+client_secret+"&v=20130815";
					content = '<div>' + name + '</div>' + '<div>rating:' + rating + '</div>' + '<div>' + hours + '</div>';

					console.log(data2.response.venue.name);

					infowindow.setContent(content);
					infowindow.open(map, marker);

				})
				.catch((error) => {
					//alert the user if error getting api information
					console.log('There was an error ', error);
					alert('There was an error ');

				});
		})
		.catch((error) => {
			//alert the user if error getting api information

			info = "There was an error ";
			infowindow.setContent('<div>' + info + '</div>');
			infowindow.open(map, marker);

		});

}
//function that change marker color
function makeMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));
	return markerImage;
}
//

///bouncing animation for clicking list
function animateMarker(title1) {
	for (var i = 0; i < markers.length; i++)
		if (markers[i].title == title1) {
			markers[i].setAnimation(google.maps.Animation.BOUNCE);
			markers[i].setAnimation(4);
		}

}
///////////////////////////
//location function
var Location = function (data) {

	this.title = ko.observable(data.title);

}

///view model
var ViewModel = function () {

	var self = this;
	//knockout array for location List
	this.LocationsList = ko.observableArray([]);
	locations.forEach(function (LocationItem) {
		self.LocationsList.push(new Location(LocationItem));
	});

	//knockout array for categories
	this.Categories = ko.observableArray([
		'Shopping', 'Park', 'Attraction', 'All'
	]);
	this.selectedCategory = ko.observable();

	//run when category selected
	filterMarker = function () {
		//alert(this.selectedCategory());
		Category = this.selectedCategory();
		FilteredListings(Category);
		//update location list array to filtered
		this.LocationsList([]);
		locations.forEach(function (LocationItem) {
			if (LocationItem.category == Category || Category == undefined || Category == 'All')
				self.LocationsList.push(new Location(LocationItem));
		});
	};
	//if selected location from list animate bouncing
	this.setLocation = function (clickedLocation) {
		self.currentLocation(clickedLocation);
		animateMarker(self.currentLocation().title());
	};
	//initialzing the current loctaion
	this.currentLocation = ko.observable(this.LocationsList()[0]);
}

ko.applyBindings(new ViewModel());
