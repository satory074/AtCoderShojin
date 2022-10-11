function getJSON(url){
  var response = UrlFetchApp.fetch(url).getContentText();
  return JSON.parse(response);
}

function getContestProblem(){
  var contest_problem = getJSON('https://kenkoooo.com/atcoder/resources/contest-problem.json');
  
  var problem_contest = new Object();
  for (let i = 0; i < contest_problem.length; i++){
    var contest = contest_problem[i]["contest_id"];
    var problem = contest_problem[i]["problem_id"];

    problem_contest[problem] = contest;
  }

  return problem_contest
}

function returnJSON(data={}, error_code="", error_message=""){
  return ContentService.createTextOutput(JSON.stringify({
    "data": data
  , "error": {
      "code": error_code
    , "message": error_message
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var lower = 50;
  var upper = 100; 
  var ac_tasks = new Object();
  var contest_problem = getContestProblem();

  // Get all tasks
  var tasks = getJSON('https://kenkoooo.com/atcoder/resources/problem-models.json');

  // if (e.parameters["user"]){
  if (true){
    // Get user's participant contests
    var contests = getJSON(`https://atcoder.jp/users/${e.parameters["user"]}/history/json`);

    // Error
    if (!contests.length){
      return returnJSON(
        tasks={}
      , error_code=1
      , error_message=`Unknown user: ${e.parameters["user"]}`
      );
    }

    // Extract user's latest rating
    var rating = Number(contests[contests.length - 1].NewRating)

    // Get user's submitted tasks
    var submitted_tasks = getJSON(`https://kenkoooo.com/atcoder/atcoder-api/results?user=${e.parameters["user"]}`);

    // Extract user's AC tasks
    for (key in submitted_tasks){
      if (submitted_tasks[key]["result"] == "AC") {
        ac_tasks[submitted_tasks[key]["problem_id"]] = submitted_tasks[key];
      }
    }
    console.log(ac_tasks);

    
    // Set variance
    if (e.parameters["upper"] && e.parameters["lower"]){
      lower = rating + Number(e.parameters["lower"]);
      upper = rating + Number(e.parameters["upper"]);

      if (lower > upper){
        return returnJSON(
          tasks={}
        , error_code=2
        , error_message=`lower > upper: [lower] ${e.parameters["lower"]}, [upper] ${e.parameters["upper"]}`
        );
      }
    }
  }

  // Extract returnable tasks
  var returnable_tasks = new Object();
  for(key in tasks){
    var task_url = `https://atcoder.jp/contests/${contest_problem[key]}/tasks/${key}`;
    

    // Ignore user's AC tasks
    if (ac_tasks[key]){
      continue;
    }

    // Ignore unknown difficulty task
    if (!tasks[key]["difficulty"]){
      continue
    }

    // Calculation difficulity
    var diff = Number(tasks[key]["difficulty"]);
    if (diff <= 400) {
        diff = 400 * Math.exp(-(400 - diff) / 400);
    }

    // Ignore out range
    if (diff < lower || diff > upper){
      continue;
    }

    returnable_tasks[key] = {
      "difficulty": diff
    , "contest": contest_problem[key]
    , "task": key
    , "url": task_url
    };
  }

  data = {
    "user": e.parameters["user"]
  , "rating": rating
  , "lower": lower
  , "upper": upper
  , "tasks": returnable_tasks
  }

  // Return JSON
  return returnJSON(
    data=data
  , error_code=0
  , error_message=""
  );
}
