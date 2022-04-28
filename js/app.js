const api_key = "4cb9fd34837a41f6dc9acb9d85c56e06";
var display;
var mode;

$(document).ready(function() {
  $("#searchText").on("input", function() {
    var autocompleteList = [];
    let searchText = $("#searchText").val();
    axios
      .get(
        "https://api.themoviedb.org/3/search/" +
          mode +
          "?api_key=" +
          api_key +
          "&query=" +
          searchText
      )
      .then(response => {
        console.log(response);
        let movies = response.data.results;
        $.each(movies, (index, movie) => {
          if (mode == "movie") {
            autocompleteList.push(movie.title);
          } else if (mode == "tv") {
            autocompleteList.push(movie.name);
          }
          return index < 4;
        });
      })
      .catch(err => {
        console.log(err);
      });

    $(this).autocomplete({
      source: autocompleteList,
      open: function() {
        $(".ui-autocomplete:visible").css("width", "200px");
      }
    });
  });

  $("#searchForm").on("submit", callback => {
    let searchText = $("#searchText").val();
    callback.preventDefault();
    if ($("#searchText").val()) {
      sessionStorage.setItem("searchText", searchText);
      window.location = "search.html";
    }
  });

  let activeTab = $(".navbar-nav .active");
  $(".navbar-nav .list-inline-item").hover(
    function() {
      activeTab.removeClass("active");
      $(this).addClass("active");
    },
    function() {
      $(this).removeClass("active");
      activeTab.addClass("active");
    }
  );

  $("#controllerGrid").on("click", function() {
    $("#controllerList").removeClass("active");
    $(this).addClass("active");
    display = "grid";
    sessionStorage.setItem("display", display);

    if (document.title == "OUTFLIX | Index") {
      index();
    } else if (document.title == "OUTFLIX | Genres") {
      genres();
    } else {
      AJAX(sessionStorage.getItem("request"));
    }
  });

  $("#controllerList").on("click", function() {
    $("#controllerGrid").removeClass("active");
    $(this).addClass("active");
    display = "list";
    sessionStorage.setItem("display", display);

    if (document.title == "OUTFLIX | Index") {
      index();
    } else if (document.title == "OUTFLIX | Genres") {
      genres();
    } else {
      AJAX(sessionStorage.getItem("request"));
    }
  });
});

function loading() {
  $("#loading").show();
  $("main").hide();
}

function loaded() {
  $("#loading").hide();
  $("main").show();
}

function checkToggle() {
  if ($(".toggle-btn").hasClass("active")) {
    mode = "tv";
  } else {
    mode = "movie";
  }
  //console.log(mode);
  sessionStorage.setItem("mode", mode);
}

function checkMode() {
  if (mode == "tv") {
    $(".toggle-btn").addClass("active");
  } else {
    $(".toggle-btn").removeClass("active");
  }
}

function nowplaying(page = 1, limit = 20, overwrite = "#movies") {
  if (mode == "movie") {
    play_vs_air = "/now_playing?api_key=";
  } else if (mode == "tv") {
    play_vs_air = "/on_the_air?api_key=";
  }
  AJAX(
    "https://api.themoviedb.org/3/" +
      mode +
      play_vs_air +
      api_key +
      "&page=" +
      page,
    limit,
    overwrite
  );
}

function trending(page = 1, limit = 20, overwrite = "#movies") {
  AJAX(
    "https://api.themoviedb.org/3/" +
      mode +
      "/popular?api_key=" +
      api_key +
      "&page=" +
      page,
    limit,
    overwrite
  );
}

function toprated(page = 1, limit = 20, overwrite = "#movies") {
  AJAX(
    "https://api.themoviedb.org/3/" +
      mode +
      "/top_rated?api_key=" +
      api_key +
      "&page=" +
      page,
    limit,
    overwrite
  );
}

function upcoming(page = 1, limit = 20, overwrite = "#movies") {
  tomorrow = tomorrow();
  AJAX(
    "https://api.themoviedb.org/3/discover/" +
      mode +
      "?api_key=" +
      api_key +
      "&page=" +
      page +
      "&sort_by=primary_release_date.asc&primary_release_date.gte=" +
      tomorrow,
    limit,
    overwrite
  );
}

function tomorrow() {
  let today = new Date();
  let dd = String(today.getDate() + 1).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();

  tomorrow = yyyy + "-" + mm + "-" + dd;
  return tomorrow;
}

function search(searchText, page = 1, limit = 20, overwrite = "#movies") {
  $.when(
    AJAX(
      "https://api.themoviedb.org/3/search/" +
        mode +
        "?api_key=" +
        api_key +
        "&query=" +
        searchText +
        "&page=" +
        page,
      limit,
      overwrite
    )
  ).then($("h2").text("Search Results for " + searchText));
}

function AJAX(request, limit = 20, overwrite = "#movies", content = false) {
  sessionStorage.setItem("request", request);
  axios
    .get(request)
    .then(response => {
      console.log(response);
      let movies = response.data.results;
      let output = "";
      if (mode == "movie") {
        if (display == "grid") {
          if (movies.length != 1) {
            $.each(movies, (index, movie) => {
              output += `
              <div class="col-lg-3 col-sm-6">
                <a onclick="selectMovie(${movie.id})" class="card text-center">
                  <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                    movie.poster_path
                  }">
                  <h5>${movie.title}</h5>
                </a>
                <a onclick="selectMovie(${
                  movie.id
                }, true)"><i class="fas fa-external-link-alt"></i></a>
              </div>
            `;
              return index < limit - 1;
            });
          } else {
            selectMovie(movies[0].id);
          }
          $(overwrite).html(output);
        } else if (display == "list") {
          if (movies.length != 1) {
            $.each(movies, (index, movie) => {
              output += `
              <div class="row position-relative">
                <a onclick="selectMovie(${
                  movie.id
                })" id="listElement" class="row card text-center">
                  <div class="col-lg-4 col-sm-9">
                    <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                      movie.poster_path
                    }">
                  </div>
                  <div class="col-lg-7 col-sm-11">
                    <h2>${movie.title}</h2>
                    <p><strong>Release Date: </strong>${movie.release_date}</p>
                    <p>${movie.overview}</p>
                    <div class="movieRating">
                      <div class="stars-outer">
                        <div class="stars-inner ${movie.id}"></div>
                      </div>
                      <p>${movie.vote_average}/10 (${
                movie.vote_count
              } votes)</p>
                    </div>
                  </div>
                  <a onclick="selectMovie(${
                    movie.id
                  }, true)"><i id="listPopup" class="fas fa-external-link-alt"></i></a>
                </a>   
              </div>
            `;
              return index < limit - 1;
            });
          } else {
            selectMovie(movies[0].id);
          }
          $(overwrite).html(output);

          $.each(movies, (index, movie) => {
            let starPercentage = `${(movie.vote_average / 10) * 100}%`;
            $(`.${movie.id}`).css("width", starPercentage);
          });
        }
      } else if ((mode = "tv")) {
        if (display == "grid") {
          if (movies.length != 1) {
            $.each(movies, (index, movie) => {
              output += `
              <div class="col-lg-3 col-sm-6">
                <a onclick="selectMovie(${movie.id})" class="card text-center">
                  <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                    movie.poster_path
                  }">
                  <h5>${movie.name}</h5>
                </a>
                <a onclick="selectMovie(${
                  movie.id
                }, true)"><i class="fas fa-external-link-alt"></i></a>
              </div>
            `;
              return index < limit - 1;
            });
          } else {
            selectMovie(movies[0].id);
          }
          $(overwrite).html(output);
        } else if (display == "list") {
          if (movies.length != 1) {
            $.each(movies, (index, movie) => {
              output += `
              <div class="row position-relative">
                <a onclick="selectMovie(${
                  movie.id
                })" id="listElement" class="row card text-center">
                  <div class="col-lg-4 col-sm-9">
                    <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                      movie.poster_path
                    }">
                  </div>
                  <div class="col-lg-7 col-sm-11">
                    <h2>${movie.name}</h2>
                    <p><strong>First Air Date: </strong>${
                      movie.first_air_date
                    }</p>
                    <p>${movie.overview}</p>
                    <div class="movieRating">
                      <div class="stars-outer">
                        <div class="stars-inner ${movie.id}"></div>
                      </div>
                      <p>${movie.vote_average}/10 (${
                movie.vote_count
              } votes)</p>
                    </div>
                  </div>
                  <a onclick="selectMovie(${
                    movie.id
                  }, true)"><i id="listPopup" class="fas fa-external-link-alt"></i></a>
                </a>   
              </div>
            `;
              return index < limit - 1;
            });
          } else {
            selectMovie(movies[0].id);
          }
          $(overwrite).html(output);

          $.each(movies, (index, movie) => {
            let starPercentage = `${(movie.vote_average / 10) * 100}%`;
            $(`.${movie.id}`).css("width", starPercentage);
          });
        }
      }
      loaded();
    })
    .catch(err => {
      console.log(err);
    });
}

function selectGenre(id, name) {
  sessionStorage.setItem("genreID", id);
  sessionStorage.setItem("genreName", name);
  window.location = "genre.html";
}
function getGenre(page = 1, limit = 20, overwrite = "#movies") {
  let genreID = sessionStorage.getItem("genreID");
  if (mode == "movie") {
    var pageTitle = sessionStorage.getItem("genreName") + " Movies";
  } else if (mode == "tv") {
    var pageTitle = sessionStorage.getItem("genreName") + " TV Shows";
  }

  $.when(
    AJAX(
      "https://api.themoviedb.org/3/discover/" +
        mode +
        "?api_key=" +
        api_key +
        "&with_genres=" +
        genreID +
        "&page=" +
        page,
      limit,
      overwrite
    )
  ).then($("h2").text(pageTitle));
}

function selectMovie(id, windowOpen = false) {
  sessionStorage.setItem("movieID", id);
  if (windowOpen == true) {
    sessionStorage.setItem("amIpopup?", "y");
    popup("detail.html");
  } else {
    sessionStorage.setItem("amIpopup?", "n");
    window.location = "detail.html";
  }
}

function popup(path) {
  window.open(
    path,
    "popup",
    "location=yes,height=570,width=800,scrollbars=yes,status=yes"
  );
}

function genres() {
  axios
    .get(
      "https://api.themoviedb.org/3/genre/" + mode + "/list?api_key=" + api_key
    )
    .then(response => {
      console.log(response);
      let genres = response.data.genres;
      let output = "";
      $.each(genres, (index, genre) => {
        output += `
          <div>
            <a class="sendto${genre.id}"><h2 class="deckTitle">${
          genre.name
        }</h2></a>
            <div id="${genre.id}" class="row deck"></div>
          </div>
        `;
      });
      $(".catalogue").html(output);

      $.each(genres, (index, genre) => {
        $(".sendto" + genre.id.toString()).on("click", function() {
          selectGenre(genre.id, genre.name);
        });
      });

      $.each(genres, (index, genre) => {
        AJAX(
          "https://api.themoviedb.org/3/discover/" +
            mode +
            "?api_key=" +
            api_key +
            "&with_genres=" +
            genre.id,
          4,
          "#" + genre.id
        );
      });
    })
    .catch(err => {
      console.log(err);
    });
}

function getMovie() {
  let movieID = sessionStorage.getItem("movieID");
  let f1 = getMovieInfo(movieID);
  let f2 = getMovieImages(movieID);
  let f3 = getMovieCredits(movieID);
  let f4 = getMovieReviews(movieID);
  let f5 = getSimilarMovies(movieID, 8);
  $.when(f1, f2, f3, f4, f5).done(function() {
    loaded();
  });
}

function getMovieInfo(id) {
  axios
    .get(
      "https://api.themoviedb.org/3/" + mode + "/" + id + "?api_key=" + api_key
    )
    .then(response => {
      console.log(response);
      let movie = response.data;
      let buttonName;
      let buttonFunction;
      if (sessionStorage.getItem("amIpopup?") == "y") {
        buttonName = "Close";
        buttonFunction = "self.close()";
      } else {
        buttonName = "Go Back";
        buttonFunction = "self.history.back()";
      }

      if (mode == "movie") {
        let output = `
          <div class="row">
            <div class="col-md-12 col-lg-5 position-relative">
              <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                movie.poster_path
              }" class="thumbnail">
              <div class="movieRating">
                <div class="stars-outer">
                  <div class="stars-inner"></div>
                </div>
                <p>${movie.vote_average}/10 (${movie.vote_count} votes)</p>
              </div>
              <button onclick=${buttonFunction} type="button" class="btn btn-light">${buttonName}</button>
            </div>
            <div class="col">
              <h2>${movie.title}</h2>
              <div class="movieOverview">
                <h3>${movie.tagline}</h3>
                <p>${movie.overview}</p>
              </div>
              <div class="movieDetails">
                <h3>Movie Details</h3>
                <div class="row">
                  <ul class="col-sm-6 col-12">
                    <li><strong>Directed by:</strong> <span id="director"></span></li>
                    <li><strong>Original Title:</strong> ${
                      movie.original_title
                    }</li>
                    <li><strong>Release Date:</strong> ${
                      movie.release_date
                    }</li>
                    <li><strong>Runtime:</strong> ${movie.runtime} minutes</li>
                    <li><strong>Genres:</strong> <span id="genres"></span></li>
                  </ul>
                  <div id="mdbs" class="col-sm-6 col-12">
                    <p class="col-12">More Information available at:</p>
                    <div class="col-12 d-flex .flex-md-row justify-content-center">
                      <img src="/assets/imdb.png" class="mdb"
                      onclick = "window.open('https://www.imdb.com/title/${
                        movie.imdb_id
                      }', '_blank');"></img>

                      <img src="/assets/tmdb.png" class="mdb"
                      onclick = "window.open('https://www.themoviedb.org/movie/${
                        movie.id
                      }', '_blank');"></img>
                    </div>
                  </divclass="col-lg-6">
                </div>
              </div>
            </div>
          </div>
        `;
        $("#movie").html(output);
      } else if (mode == "tv") {
        let created_by = [];
        $.each(movie.created_by, (index, creator) => {
          created_by.push("<br>");
          created_by.push(creator.name);
        });
        let output = `
          <div class="row">
            <div class="col-md-12 col-lg-5 position-relative">
              <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                movie.poster_path
              }" class="thumbnail">
              <div class="movieRating">
                <div class="stars-outer">
                  <div class="stars-inner"></div>
                </div>
                <p>${movie.vote_average}/10 (${movie.vote_count} votes)</p>
              </div>
              <button onclick=${buttonFunction} type="button" class="btn btn-light">${buttonName}</button>
            </div>
            <div class="col">
              <h2>${movie.name}</h2>
              <div class="movieOverview">
                <h3></h3>
                <p>${movie.overview}</p>
              </div>
              <div class="movieDetails">
                <h3>Movie Details</h3>
                <div class="row">
                  <ul class="col-sm-6 col-12">
                    <li><strong>Created by:</strong> <span id="created_by"></span></li>
                    <li><strong>First Air Date:</strong> ${
                      movie.first_air_date
                    }</li>
                    <li><strong>Number of seasons:</strong> ${
                      movie.number_of_seasons
                    }</li>
                    <li><strong>Number of episodes:</strong> ${
                      movie.number_of_episodes
                    }</li>
                    <li><strong>Genres:</strong> <span id="genres"></span></li>
                  </ul>
                  <div class="col-sm-6 col-12">
                    <p class="col-12">More Information available at:</p>
                    <div class="col-12 d-flex .flex-md-row justify-content-center">
                      <img src="/assets/imdb.png" class="mdb"
                      onclick = "window.open('https://www.imdb.com/find?ref_=nv_sr_fn&q=${
                        movie.name
                      }&s=all', '_blank');"></img>

                      <img src="/assets/tmdb.png" class="mdb"
                      onclick = "window.open('https://www.themoviedb.org/tv/${
                        movie.id
                      }', '_blank');"></img>
                    </div>
                  </divclass="col-lg-6">
                </div>
              </div>
            </div>
          </div>
        `;
        $("#movie").html(output);
        $("#created_by").append(created_by);
      }

      let starPercentage = `${(movie.vote_average / 10) * 100}%`;
      $(".stars-inner").css("width", starPercentage);
      $.each(movie.genres, (index, genre) => {
        $("#genres").append("<a>" + genre.name + "</a> ");
        $("#genres a:last-of-type").on("click", function() {
          selectGenre(genre.id, genre.name);
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
}

function getMovieImages(id, limit = 8) {
  axios
    .get(
      "https://api.themoviedb.org/3/" +
        mode +
        "/" +
        id +
        "/images?api_key=" +
        api_key
    )
    .then(response => {
      console.log(response);
      let images = response.data.backdrops;

      if (images.length > 0) {
        let output = "";
        $.each(images, (index, image) => {
          output += `
            <div class="col-lg-3 col-sm-6 ">
                <img onclick='popup("https://image.tmdb.org/t/p/w500${
                  image.file_path
                }")'
                onError="this.onerror=null;this.src='/assets/noimage.jpg';" src="https://image.tmdb.org/t/p/w500${
                  image.file_path
                }">
            </div>
          `;
          return index < limit - 1;
        });
        $("#movieImages").html(output);
      } else {
        $("#movieImages").hide();
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function getMovieCredits(id, limit = 8) {
  axios
    .get(
      "https://api.themoviedb.org/3/" +
        mode +
        "/" +
        id +
        "/credits?api_key=" +
        api_key
    )
    .then(response => {
      console.log(response);
      let cast = response.data.cast;
      let crew = response.data.crew;

      if (cast.length > 0) {
        let output1 = "<h3>Cast</h3>";
        $.each(cast, (index, person) => {
          output1 += `
            <div class="col-lg-3 col-md-6">
              <div class="card text-center">
                <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" 
                  src="https://image.tmdb.org/t/p/w500${person.profile_path}">
                <h5>${person.name}</h5>
                <hr>
                <h5>${person.character}</h5>
              </div>
            </div>
            `;
          return index < limit - 1;
        });
        $("#cast").html(output1);
      } else {
        $("#cast").hide();
      }

      if (crew.length > 0) {
        let output2 = "<h3>Crew</h3>";
        $.each(crew, (index, person) => {
          output2 += `
            <div class="col-lg-3 col-md-6">
              <div class="card text-center">
                <img onError="this.onerror=null;this.src='/assets/noimage.jpg';" 
                  src="https://image.tmdb.org/t/p/w500${person.profile_path}">
                <h5>${person.name}</h5>
                <hr>
                <h5>${person.job}</h5>
              </div>
            </div>
            `;
          return index < limit - 1;
        });

        if (mode == "movie") {
          let director;
          for (var i = 0, len = crew.length; i < len; i++) {
            if (crew[i].job == "Director") {
              director = crew[i].name;
            }
          }
          $("#director").text(director);
        }

        $("#crew").html(output2);
      } else {
        $("#crew").hide();
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function getMovieReviews(id) {
  axios
    .get(
      "https://api.themoviedb.org/3/" +
        mode +
        "/" +
        id +
        "/reviews?api_key=" +
        api_key
    )
    .then(response => {
      console.log(response);
      let reviews = response.data.results;

      if (reviews.length > 0) {
        let output = "";
        $.each(reviews, (index, review) => {
          output += `
            <div class="movieOverview" style="margin: 10px auto; width: 95%;">
              <a href="${review.url}" target="_blank"><h3>@${
            review.author
          }</h3></a>
              <p>${review.content}</p>
            </div>
          `;
        });
        $("#reviews").html(output);
      } else {
        $("#reviews").hide();
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function getSimilarMovies(id, limit = 20) {
  if (mode == "movie") {
    similar = "Similar Movies";
  } else if (mode == "tv") {
    similar = "Similar TV Shows";
  }
  $.when(
    AJAX(
      "https://api.themoviedb.org/3/" +
        mode +
        "/" +
        id +
        "/similar?api_key=" +
        api_key,
      limit
    )
  ).then($("#similarMovies").text(similar));
}

function pagination(page) {
  if (page - 1 > 0) {
    $("#pageFirst").show();
    $("#pagePrevious").show();
    $("#pagePrevious").text(page - 1);
  } else {
    $("#pageFirst").hide();
    $("#pagePrevious").hide();
  }
  $("#pageCurrent").text(page);
  $("#pageNext").text(page + 1);
  $("#pageNext2").text(page + 2);
  $("#pageNext3").text(page + 3);
}

$(".navbar-toggler").on("click", function() {
  $(".navbar-collapse").toggleClass("collapse");
  checkToggle();
  index();
});