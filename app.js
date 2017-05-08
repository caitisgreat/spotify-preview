(function() {
  'use strict';

  // initialize the application
  var app = angular.module("SpotifyTestApp", []);

  app.service('SpotifyService', ['$http', function($http) {
    this.SearchForArtists = function(query, page = 0, limit = 10) {
      // multiplicative offset
      let offset = page * limit;
      let url = `https://api.spotify.com/v1/search?q=${query}&type=artist&offset=${offset}&limit=${limit}`

      return $http.get(url);
    };
    this.GetArtistTracks = function(artistId) {
      let url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`;
      return $http.get(url);
    }
  }]);

  app.service('AudioService',  function() {
    this.running = false;
    this.player = null;
    this.source = "";

    this.isRunning = function() {
      return this.player != null && this.running;
    }

    this.getAudioSource = function() {
      return this.source;
    }

    this.playAudio = function(source) {
      if (this.source === source) {
        if (this.isRunning()) {
          this.player.pause();
          this.running = false;
        } else {
          this.player.play();
          this.running = true;
        }
      } else {
        if (this.player != null) {
          this.player.pause();
        }

        this.source = source;
        this.player = new Audio(this.source);
        this.player.play();
        this.running = true;
      }
    }
  });

  app.directive('search', function() {
    return {
      templateUrl: 'search.html',
      require: 'E',
      replace: true
    };
  })

  app.directive('artists', function() {
    return {
      templateUrl: 'artists.html',
      require: 'E',
      replace: true
    };
  });

  app.controller('AppCtrl', function($scope, SpotifyService, AudioService) {
    // define initial model
    $scope.data = {
      paging: {
        page: 0,
        limit: 10,
        totalPages: 0
      },
      audio: {
        source: "",
        player: null,
        running: false
      }
    };

    $scope.getArtistTracks = function(index, artistId) {
      $scope.data.tracks = null;
      SpotifyService.GetArtistTracks(artistId)
        .then((res) => {
          $scope.data.artists.items[index].tracks = res.data.tracks;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    $scope.searchForArtists = function(query) {
      $scope.data.query = query;
      SpotifyService.SearchForArtists($scope.data.query, $scope.data.paging.page, $scope.data.paging.limit)
        .then((res) => {
          let artists = res.data.artists;
          $scope.data.artists = {
            total: parseInt(artists.total),
            items: artists.items
          };
          $scope.data.paging.totalPages = Math.ceil(parseInt(artists.total) / $scope.data.paging.limit);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    $scope.pageUp = function() {
      $scope.data.paging.page++;
      $scope.searchForArtists($scope.data.query);
    }

    $scope.pageDown = function() {
      $scope.data.paging.page--;
      $scope.searchForArtists($scope.data.query);
    }

    $scope.playAudio = function(source) {
      AudioService.playAudio(source);
    }

  });
})();
