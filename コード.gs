function getJSON(url){
  let response = UrlFetchApp.fetch(url).getContentText();
  return JSON.parse(response);
}

function getContestProblem(){
  let contest_problem = getJSON('https://kenkoooo.com/atcoder/resources/contest-problem.json');
  
  let problem_contest = new Object();
  for (let i = 0; i < contest_problem.length; i++){
    let contest = contest_problem[i]["contest_id"];
    let problem = contest_problem[i]["problem_id"];

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
  let lower = 50;
  let upper = 100; 
  let ac_tasks = new Object();
  let contest_problem = getContestProblem();

  // Get all tasks
  let tasks = getJSON('https://kenkoooo.com/atcoder/resources/problem-models.json');


  // Get user's participant contests
  let ratings = getJSON(`http://kyopro-ratings.jp1.su8.run/json?atcoder=${e.parameters["user"]}`);
  let rating = Number(ratings["atcoder"]["rating"])

  // Get user's submitted tasks
  let submitted_tasks = getJSON(`https://kenkoooo.com/atcoder/atcoder-api/results?user=${e.parameters["user"]}`);

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

  // Extract returnable tasks
  let returnable_tasks = new Object();
  for(key in tasks){
    let task_url = `https://atcoder.jp/contests/${contest_problem[key]}/tasks/${key}`;

    // Ignore user's AC tasks
    if (ac_tasks[key]){
      continue;
    }

    // Ignore unknown difficulty task
    if (!tasks[key]["difficulty"]){
      continue
    }

    // Calculation difficulity
    let diff = Number(tasks[key]["difficulty"]);
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