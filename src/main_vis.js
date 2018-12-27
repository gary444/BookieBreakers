import * as d3 from './modules/d3.min.js';

import DQBarGraph from './modules/DivergingQuantisedBarGraph.js';



//page setup

const svg_width = window.innerWidth;
const svg_height = (window.innerHeight-4) * 1.3;
const bar_graph_width = svg_width * 0.85;
const bar_graph_height = (window.innerHeight-4) * 0.92;
const bar_graph_x = (svg_width - bar_graph_width) / 2;
const bar_graph_y = (svg_height - bar_graph_height) / 2 + (bar_graph_height * 0.05);

// let svgContainer = d3.select("body").append("svg")
let svgContainer = d3.select("body").insert("svg", "#blurbspace")
  .attr("width", svg_width)
  .attr("height", svg_height)
let barGraphContainer = svgContainer.append("g")
  .attr("transform", "translate( " + bar_graph_x + "," + bar_graph_y + ")");

let barGraph = new DQBarGraph(barGraphContainer, bar_graph_width, bar_graph_height);

let Teams = new Array();

export{barGraph};

//add link support for switching seasons
var filepath = "/data/1718/E0.csv";
var season_string = "2017/18";

var change_btn = d3.select("#dropbtn");
var btn_16_17 = d3.select("#btn1617")
  .on("click", function(){
    filepath = "/data/1617/E0.csv";
    season_string = "2016/17";
    reset();
    loadDataAndRender();
  });
var btn_17_18 = d3.select("#btn1718")
  .on("click", function(){
    filepath = "/data/1718/E0.csv";
    season_string = "2017/18";
    reset();
    loadDataAndRender();
  });
var btn_18_19 = d3.select("#btn1819")
  .on("click", function(){
    filepath = "/data/1819/E0.csv";
    season_string = "2018/19";
    reset();
    loadDataAndRender();
  });



loadDataAndRender();

function loadDataAndRender() {

  change_btn.text(season_string);

  // load data from csv file
  d3.csv(filepath).then( function(data)  {

    // console.log(data);

    data.forEach(function(m) {
      //calculate probabilities
      //TODO use an average of odds?
      //TODO - do probabilities add up to 1?
      m.homeProb = 1.0 / m.B365H;
      m.drawProb = 1.0 / m.B365D;
      m.awayProb = 1.0 / m.B365A;

      let total_prob = m.homeProb + m.drawProb + m.awayProb;

      //correct so total p = 1
      m.homeProb *= (1.0 / total_prob);
      m.drawProb *= (1.0 / total_prob);
      m.awayProb *= (1.0 / total_prob);

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
        m.pred = "correct";
        Teams[teamIndexes[0]].oddsCorrect.push(m);
        Teams[teamIndexes[0]].oddsCorrect_sum += m.correct_prob;

        Teams[teamIndexes[1]].oddsCorrect.push(m);
        Teams[teamIndexes[1]].oddsCorrect_sum += m.correct_prob;
      }
      else if (m.predResult === "none"){
        //do nothing for now
      }
      else {

        //set incorrect probability
        if (m.FTR === 'H') {
          m.incorrect_prob = 1 -  m.homeProb;
        }
        else if (m.FTR === 'D') {
          m.incorrect_prob = 1 - m.drawProb;
        }
        else if (m.FTR === 'A') {
          m.incorrect_prob = 1 - m.awayProb;
        }

        m.pred = "incorrect";
        Teams[teamIndexes[0]].oddsWrong.push(m);
        Teams[teamIndexes[0]].oddsWrong_sum += m.correct_prob;

        Teams[teamIndexes[1]].oddsWrong.push(m);
        Teams[teamIndexes[1]].oddsWrong_sum += m.correct_prob;
      }
    })
    render();
  });
}





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

  //create label
  let label = teamName.substring(0,3).toUpperCase();
  return label;
}

function render(){

  checkLabels(Teams);
  sortTeams(Teams, "alphabetic")
  barGraph.render(Teams);

  // console.log(Teams);

}

function checkLabels(){
  var LabelsToExtend = new Array();
  for (var i = 0; i < Teams.length; i++) {
    for (var j = 0; j < Teams.length; j++) {
      if(Teams[i].label === Teams[j].label
        && i != j){
          LabelsToExtend.push(i);
        }
    }
  }
  LabelsToExtend.forEach(function (team_id) {
    let label = Teams[team_id].label;
    //find space
    let space_idx = Teams[team_id].name.indexOf(" ");
    if (space_idx != -1) {
      label = label + Teams[team_id].name.substring(space_idx+1,space_idx+2).toUpperCase();
    }
    else {
      label = label + Teams[team_id].name.substring(2,3).toUpperCase();
    }
    Teams[team_id].label = label;
  })
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

function reset(){
  Teams = []
}
