import * as d3 from './modules/d3.min.js';

import DQBarGraph from './modules/DivergingQuantisedBarGraph.js';



//page setup

const svg_width = window.innerWidth;
const svg_height = (window.innerHeight-4) * 1.3;
const bar_graph_width = svg_width * 0.85;
const bar_graph_height = (window.innerHeight-4) * 0.92;
const bar_graph_x = (svg_width - bar_graph_width) / 2;
const bar_graph_y = (svg_height - bar_graph_height) / 2 + (bar_graph_height * 0.001);

let svgContainer = d3.select("body").append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
let barGraphContainer = svgContainer.append("g")
  .attr("transform", "translate( " + bar_graph_x + "," + bar_graph_y + ")");

let barGraph = new DQBarGraph(barGraphContainer, bar_graph_width, bar_graph_height);

let Teams = new Array();
let matchesLoaded = 0;

export{barGraph};

//load data from csv file
d3.csv("/data/E0.csv", (data) => {
  matchesLoaded++;
  let m = data;

  //calculate probabilities
  //TODO use an average of odds?
  m.homeProb = 1.0 / m.B365H;
  m.drawProb = 1.0 / m.B365D;
  m.awayProb = 1.0 / m.B365A;

  //calculate predicted result and correct probability
  if (m.homeProb > m.drawProb && m.homeProb > m.awayProb) {// home win predicted
    m.predResult = "H";
    m.correct_prob = m.homeProb;
  }
  else if (m.drawProb > m.homeProb && m.drawProb > m.awayProb) {// draw predicted
    m.predResult = "D";
    m.correct_prob = m.drawProb;
  }
  else if (m.awayProb > m.homeProb && m.awayProb > m.drawProb) {// away win predicted
    m.predResult = "A";
    m.correct_prob = m.awayProb;
  }
  else {
    //boundary case - TODO decide how to deal with this when quantifying 'surprise'
    m.predResult = "none";
    m.correct_prob = 0;
  }

  let teamIndexes = checkTeamsExist(m);

  //assign to team according to whether result follows odds
  if (m.predResult === m.FTR) {
    Teams[teamIndexes[0]].oddsCorrect.push(m);
    Teams[teamIndexes[0]].oddsCorrect_sum += m.correct_prob;

    Teams[teamIndexes[1]].oddsCorrect.push(m);
    Teams[teamIndexes[1]].oddsCorrect_sum += m.correct_prob;
  }
  else if (m.predResult === "none"){
    //do nothing for now
  }
  else {
    Teams[teamIndexes[0]].oddsWrong.push(m);
    Teams[teamIndexes[0]].oddsWrong_sum += m.correct_prob;

    Teams[teamIndexes[1]].oddsWrong.push(m);
    Teams[teamIndexes[1]].oddsWrong_sum += m.correct_prob;
  }

  //TODO trigger at end of csv file
  if (matchesLoaded ===  380) {
    render();
  }
});

function checkTeamsExist(match) {
  return [findTeam(match.HomeTeam), findTeam(match.AwayTeam)];
}

function findTeam(team){
  //find team and return index
  for (var i = 0; i < Teams.length; i++) {
    if (team == Teams[i].name){
      return i;
    }
  }
  //add a new entry if not found
  let t = new Object;
  t.name = team;
  t.label = createLabel(t.name);
  t.oddsCorrect = new Array;
  t.oddsWrong = new Array;
  t.oddsCorrect_sum = 0;
  t.oddsWrong_sum = 0;
  Teams.push(t);
  return Teams.length - 1;
}

function createLabel(teamName){

  var label;
  let charNum = 2;
  let matchFound = true;

  while (matchFound === true){

    //create label
    label = teamName.substring(0,2).toUpperCase() + teamName.substring(charNum,charNum+1).toUpperCase();

    //check that end char is not a space
    if(teamName.substring(charNum,charNum+1) === " "){
      charNum++;
      continue;
    }
    //check for match
    matchFound = false;
    for (var i = 0; i < Teams.length; i++) {
      if (Teams[i].label === label){
        matchFound = true;
      }
    }

    charNum++;
  }
  return label;

}

function render(){
  sortTeams(Teams, "alphabetic")
  barGraph.render(Teams);

  console.log(Teams);
}

function sortTeams(teams, method){
  if (method === "alphabetic") {
    teams.sort(function(a,b) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    })
  }
}
