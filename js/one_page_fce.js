$(function() { //shorthand document.ready function
  $("#search-form").on('submit', function(e) {
      e.preventDefault();
      var data = $("#search-form :input").val();
      search(data);
  });
});

//     QUESTIONS_MAP = {
//     'hrs per week': 'Q-01',
//     'interest in student learning': 'Q-02',
//     'explain course requirements': 'Q-03',
//     'clear learning goals': 'Q-04',
//     'feedback to students': 'Q-05',
//     'importance of subject': 'Q-06',
//     'explains subject matter': 'Q-07',
//     'show respect for students': 'Q-08',
//     'overall teaching': 'Q-09',
//     'overall course': 'Q-10',
// }
function Course (data) {
  this.year = data.year || "";
  this.section = data.section || "";
  this.type = data.type || "";
  this.courseid = data.courseid || "";
  this.resp_rate = data.resp_rate || "";
  this.semester = data.semester || "";
  this.name = data.name || "";
  this.enrollment = data.enrollment || "";
  this.co_taught = data.co_taught || "";
  this.department = data.department || "";
  this.responses = data.responses || "";
  this.instructor = data.instructor || "";
  this.questions = (function(data) {
      q = {};
      $.each(data.questions || {}, function( key, val ) {
        if (val.body.startsWith("Q-")) {
          q[val.body] = val.value;
        }
      });
      return q;
    })(data);

  this.getTable = function() {
    var content = [this.courseid,
                   this.year,
                   this.semester,
                   this.instructor,
                   normalizeScore(this.questions["Q-10"]),
                   normalizeScore(this.questions["Q-09"]),
                   normalizeScore(this.questions["Q-07"]),
                   normalizeScore(this.questions["Q-02"]),
                   this.questions["Q-01"],
                   this.enrollment,
                   this.resp_rate];
    table = "<tr><td>" + content.join("</td><td>") + "</td></tr>";
    return table;
  };
};

function normalizeScore(score) {
  return Math.round(score / 5 * 100);
}

function search(text) {
  var courseid;
  var rest;
  var match = text.match(/(\d{2})[-]?(\d{3})/);
  if (match !== null) {
    courseid = match[1] + "-" + match[2];
  } else {
    rest = text;
  }
  var BASE_URL = "https://courseapi-scotty.rhcloud.com/fce/_search?size=300&sort=year:desc&default_operator=AND";
  var search_url;
  // Construct query url to the server.
  if (courseid) {
    search_url = BASE_URL.concat("&q=courseid:", courseid);
  } else if (rest) {
    search_url = BASE_URL.concat("&q=instructor:", rest);
  }
  // If there's a constructed url, then search.
  if (search_url) {
    $.getJSON( search_url, function( data ) {
      var items = [];
      var result_prompt = "<br/>";
      try {
        var hits = data.hits.hits;
        if (data.hits.total == 0) {
          result_prompt = "Nothing was found.";
        }
        for (i in hits) {
          hit = hits[i];
          course = new Course(hit._source);
          items.push( course.getTable() );
        }
      } catch(err) {
        result_prompt = "Some thing went wrong. " + err;
      }
      // Update page with the result.
      $("#result-body").remove();
      $("#prompt-text").remove();
      $( "<tbody/>", {
        "id": "result-body",
        html: items.join( "" )
      }).appendTo( "#search-result" );
      $( "<p/>", {
        "id": "prompt-text",
        html: result_prompt
      }).appendTo( "#prompt-div" );

    // Initialize Sortable.
    $("#search-result").removeAttr("data-sortable-initialized");
    Sortable.init();
    });
  }
}
