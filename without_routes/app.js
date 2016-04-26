$(document).ready(function() {

    var songSearchTemplateSource = $("#song-search-template").html();
    var songSearchTemplate = Handlebars.compile(songSearchTemplateSource);

    $("#search-form").on("submit", function(event) {
        event.preventDefault();

        var $search = $("#search");

        $.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/search?type=track&q=" + encodeURIComponent($search.val()),
            success: function(results) {
                $search.val("");

                var songs = results.tracks.items;

                $("#song-container").html("");

                songs.forEach(function(song) {
                    var trackInfo = {
                        image: song.album.images[0].url,
                        songName: song.name,
                        artistName: song.artists[0].name,
                        albumName: song.album.name,
                        previewUrl: song.preview_url,
                        songId: song.id
                    };

                    $("#song-container").append(songSearchTemplate(trackInfo));
                });
            },
            error: function() {
                alert("Error getting song data");
            }
        });
    });

    var tokenMatches = window.location.hash.match(/access_token=(.*)&token_type=*/);

    if (tokenMatches) {
        var accessToken = tokenMatches[1];

        window.sessionStorage.setItem("spotify_token", accessToken);
    }

    var savedTracksTemplateSource = $("#saved-tracks-template").html();
    var savedTracksTemplate = Handlebars.compile(savedTracksTemplateSource);

    function getSavedTracks() {
        $.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/me/tracks",
            headers: {
                "Authorization": "Bearer " + window.sessionStorage.getItem("spotify_token")
            },
            success: function(results) {
                var tracks = results.items;

                var $songContainer = $("#song-container");

                $songContainer.html("");

                tracks.forEach(function(song) {
                    var trackInfo = {
                        image: song.track.album.images[0].url,
                        trackName: song.track.name,
                        artistName: song.track.artists[0].name,
                        albumName: song.track.album.name,
                        previewUrl: song.track.preview_url,
                        trackId: song.track.id
                    };

                    $songContainer.append(savedTracksTemplate(trackInfo));
                });
            },
            error: function() {
                alert("Error getting user-specific songs");
            }
        });
    }

    $("#view-saved").on("click", function(event) {
        event.preventDefault();

        getSavedTracks();
    });

    //Save track to saved tracks
    $(document).on("click", ".save-track-button", function() {
        $.ajax({
            url: "https://api.spotify.com/v1/me/tracks?ids=" + $(this).attr("data-id"),
            type: "PUT",
            headers: {
                "Authorization": "Bearer " + window.sessionStorage.getItem("spotify_token")
            },
            success: function() {
                alert("Track saved!");
            },
            error: function() {
                alert("Error saving track");
            }
        });
    });

    $(document).on("click", ".remove-save-button", function() {
        $.ajax({
            type: "DELETE",
            url: "https://api.spotify.com/v1/me/tracks?ids=" + $(this).attr("data-id"),
            headers: {
                "Authorization": "Bearer " + window.sessionStorage.getItem("spotify_token")
            },
            success: function() {
                getSavedTracks();
            },
            error: function() {
                alert("Error removing saved track");
            }
        });
    });

});
