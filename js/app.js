var model = function()
{

    var my = this;

    my.errorDisplay = ko.observable('');
    my.Array = [];

    for (var i = 0; i < locations.length; i++) 
    {
        var place = new google.maps.Marker({
            position: {
                lat: locations[i].location.lat,
                lng: locations[i].location.lng
            },
            map: map,
            title: locations[i].title,
            show: ko.observable(locations[i].show),
            selected: ko.observable(locations[i].selected),
            venueid: locations[i].venueId, // venue id used for foursquare
            animation: google.maps.Animation.BOUNCE
        });

        my.Array.push(place);
    }
    

    // function for animation to make markers bounce but stop after 600ms
    my.BOUNCE = function(marker) {
        marker.setTimeout(google.maps.Timeout.BOUNCE);
        setTimeout(function() {
            marker.setTimeout(null);
        }, 300);
        
    };

     // function to add API information to each marker
    my.InfoApi = function(marker) {
        $.ajax({
            url:'https://api.foursquare.com/v2/venues/explore'+
            marker.venueid + '?client_id=RELCLOUZBACLOLPH1GMWNQWFNTE3WUKK0RXE351N3VTSQGJ5&client_secret=3JGPGXFZFVRWGOXB2G5025HLE1UO0KZ2FHAPX1H4N2KRUNVX&v=20180323',
            dataType: "json",
            success: function(data) {
                // stores result to display the likes and ratings on the markers
                var output = data.response.venue;

                // to add likes and ratings to marker
                marker.likes = output.hasOwnProperty('likes') ? output.likes.summary : '' || 'Data not found';
                marker.rating = output.hasOwnProperty('rating') ? output.rating : '' || 'Data not found';
            },

            // warn if there is error in recievng json
            error: function(e) {
                my.errorDisplay("Foursquare data is unavailable. Please try again later.");
            }
        });
    };

    //function to add information about API to the markers
    var addMarkerInfo = function(marker) {

        //add API items to each marker
        my.InfoApi(marker);

        //add the click event listener to marker
        marker.addListener('click', function() {
            //set this marker to the selected state

            my.setSelected(marker);
        });
    };

    //  iterate through Array and add marker api info  
    for (var i = 0; i < my.Array.length; i++) {
        addMarkerInfo(my.Array[i]);
    }

    // create a searchText for the input search field
    my.searchText = ko.observable('');


    //every keydown is called from input box
    my.filterList = function() {
        //variable for search text
        var currentText = my.searchText();
        infowindow.close();

        //list for user search
        if (currentText.length === 0) {
            my.setAllShow(true);
        } else {
            for (var i = 0; i < my.Array.length; i++) {
                // to check whether the searchText is there in the Array
                if (my.Array[i].title.toLowerCase().indexOf(currentText.toLowerCase()) > -1) {
                    my.Array[i].show(true);
                    my.Array[i].setVisible(true);
                } else {
                    my.Array[i].show(false);
                    my.Array[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    // to show all the markers
    my.setAllShow = function(marker) {
        for (var i = 0; i < my.Array.length; i++) {
            my.Array[i].show(marker);
            my.Array[i].setVisible(marker);
        }
    };
    // function to make all the markers unselected 
    my.setAllUnselected = function() {
        for (var i = 0; i < my.Array.length; i++) {
            my.Array[i].selected(false);
        }
    };

    my.currentLocation = my.Array[0];

    // function to make all the markers selected and show the likes and ratings

    my.setSelected = function(location) {
        my.setAllUnselected();
        location.selected(true);

        my.currentLocation = location;

        Likes = function() {
            if (my.currentLocation.likes === '' || my.currentLocation.likes === undefined) {
                return "Likes are unavailable for this location";
            } else {
                return "Location has " + my.currentLocation.likes;
            }
        };
        // function to show rating and if not then no rating to display
        Rating = function() {
            if (my.currentLocation.rating === '' || my.currentLocation.rating === undefined) {
                return "Ratings are  unavailable for this location";
            } else {
                return "Location is rated " + my.currentLocation.rating;
            }
        };

        var InfoWindow = "<h5>" + my.currentLocation.title +
        "</h5>" + "<div>" + Likes() + "</div>" + "<div>" + Rating() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        my.Bounce(location);
    };
};