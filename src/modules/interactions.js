import {barGraph} from '.././main_vis.js'
import * as d3 from './d3.min.js';


function showMatchDetail(match) {

  var coordinates = [0, 0];
  coordinates = d3.mouse(this);
  var x = coordinates[0];
  var y = coordinates[1];

  //determine which match is being shown
  let home_dist = Math.sqrt(Math.pow(x - match.home_x,2), Math.pow(y - match.home_y,2))
  let away_dist = Math.sqrt(Math.pow(x - match.away_x,2), Math.pow(y - match.away_y,2))

  if (home_dist < away_dist) {
    match.detailcard = "home"
  }
  else {
    match.detailcard = "away"
  }

  barGraph.showMatchDetail(match);
}

function hideMatchDetail(match){
  barGraph.hideMatchDetail(match)
}

function arrowclick(arrow){
  barGraph.sortTeamsBy(arrow);
}

export {showMatchDetail, hideMatchDetail, arrowclick}
