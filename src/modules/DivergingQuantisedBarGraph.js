import * as interactions from './interactions.js';
import * as d3 from './d3.min.js';

export default class DQBarGraph {
  constructor(root, width, height) {
    this.root = root;
    this.width = width;
    this.height = height;

    let x_offset = 0;
    this.x_offset = this.width * x_offset;
    this.chartwidth = this.width * (1 - x_offset);

    let y_offset = 0.05;
    this.y_offset = this.height * y_offset;
    this.chartheight = this.height * (1-y_offset);

    this.axisGap = this.chartwidth / 20;
    this.y1pos = this.x_offset + (this.chartwidth / 2.0) - (this.axisGap / 2.0);
    this.y2pos = this.x_offset + (this.chartwidth / 2.0) + (this.axisGap / 2.0);

    // this.root.append("rect")
    //   .attr("width", this.width)
    //   .attr("height", this.height)
    //   .style("fill", "blue");
  }



  render(teamArray){

    this.keyWidth = this.chartheight / teamArray.length;


    //find most matches on one side of x axis
    let maxMatches = 0;
    for (var i = 0; i < teamArray.length; i++) {
      if (teamArray[i].oddsCorrect.length > maxMatches) {maxMatches = teamArray[i].oddsCorrect.length;}
      if (teamArray[i].oddsWrong.length > maxMatches) {maxMatches = teamArray[i].oddsWrong.length;}
    }
    // this.blockHeight = (this.y1pos - this.y_offset) / maxMatches;
    this.blockWidth = (this.y1pos - this.y_offset) / maxMatches;

    //matches
    let matchMarks = this.root.append("g");
    matchMarks.selectAll("rect")
      .data(teamArray)
      .enter().each( (d,i) => {


        //correct
        let matchMarks_pos = matchMarks.append("g");
        matchMarks_pos.selectAll("rect")
          .data(d.oddsCorrect)
          .enter().append("rect")
            .attr("x", (r,n) => {
              if (d.name === r.HomeTeam) {
                r.home_x = this.y1pos - (this.blockWidth * ((n+1)*1.1));
                return r.home_x;
              }
              else if (d.name === r.AwayTeam) {
                r.away_x = this.y1pos - (this.blockWidth * ((n+1)*1.1));
                return r.away_x;
              }
              })
            .attr("y", (r) => {
              if (d.name === r.HomeTeam) {
                r.home_y = (i * this.keyWidth) + this.y_offset;
                return r.home_y;
              }
              else if (d.name === r.AwayTeam) {
                r.away_y = (i * this.keyWidth) + this.y_offset;
                return r.away_y;
              }
            })
            .attr("width", this.blockWidth)
            .attr("height", this.keyWidth * 0.95)
            .on("mouseover", interactions.showMatchDetail)
            .on("mouseout", interactions.hideMatchDetail)
            .classed("block_correct", true);

        //incorrect
        let matchMarks_neg = matchMarks.append("g");
        matchMarks_neg.selectAll("rect")
          .data(d.oddsWrong)
          .enter().append("rect")
            .attr("x", (r,n) => {
              if (d.name === r.HomeTeam) {
                r.home_x = this.y2pos + (this.blockWidth * (n*1.1));
                return r.home_x;
              }
              else if (d.name === r.AwayTeam) {
                r.away_x = this.y2pos + (this.blockWidth * (n*1.1));
                return r.away_x;
              }
              })
            .attr("y", (r) => {
              if (d.name === r.HomeTeam) {
                r.home_y = (i * this.keyWidth) + this.y_offset;
                return r.home_y;
              }
              else if (d.name === r.AwayTeam) {
                r.away_y = (i * this.keyWidth) + this.y_offset;
                return r.away_y;
              }
            })
            .attr("width", this.blockWidth)
            .attr("height", this.keyWidth * 0.95)
            .on("mouseover", interactions.showMatchDetail)
            .on("mouseout", interactions.hideMatchDetail)
            .classed("block_wrong", true);

      })


      this.renderAxes(teamArray);
      this.renderBadges(teamArray);

  }



  showMatchDetail(match){

   let detailCard = this.root.append("g")
     .attr("class", "match_detail");


   const detailCard_w = this.width * 0.4;
   const detailCard_h = this.height * 0.13;

   var match_x, match_y, detailCard_x, detailCard_y

   //find match coords
   if (match.detailcard === "home") {
     match_x = match.home_x;
     match_y = match.home_y;
   }
   else {
     match_x = match.away_x;
     match_y = match.away_y;
   }

   //check where to draw box
   detailCard_y = match_y;
   if (match_x > this.width * 0.5) { // to the left of match
     detailCard_x = match_x - (detailCard_w * 1.2)
   }
   else { // to the right of match
     detailCard_x = match_x + (detailCard_w * 0.2)
   }


   detailCard.append("rect")
     .attr("width", detailCard_w)
     .attr("height", detailCard_h)
     .attr("x", detailCard_x)
     .attr("y", detailCard_y)
     // .attr("rx", detailCard_y * 0.1)
     // .attr("ry", detailCard_y * 0.1)
     .style("fill", "#4f4f4f")

   const line1_y = detailCard_y + (detailCard_h * 0.35)
   const line2_y = detailCard_y + (detailCard_h * 0.85)
   const cntr_x = detailCard_x + (detailCard_w * 0.5);
   const score_offset = detailCard_w * 0.04;

   //render v
   detailCard.append("text")
    .attr("x", cntr_x)
    .attr("y",line1_y)
    .text("v")
    .classed("detail_card", true)
    .attr("text-anchor", "middle")

  //home
  detailCard.append("text")
   .attr("x", cntr_x - score_offset)
   .attr("y",line1_y)
   .text(match.HomeTeam + "  " + match.FTHG)
   .classed("detail_card", true)
   .attr("text-anchor", "end")

   //away
 detailCard.append("text")
  .attr("x", cntr_x + score_offset)
  .attr("y",line1_y)
  .text(match.FTAG + "  " + match.AwayTeam)
  .classed("detail_card", true)
  .attr("text-anchor", "start")

  //odds
  let f = d3.format("3.1f");
  detailCard.append("text")
   .attr("x", cntr_x)
   .attr("y",line2_y)
   .text("H: " +  f(match.homeProb*100) + "%  |  D: " + f(match.drawProb*100) + "%  |  A: " + f(match.awayProb*100) + "%")
   .classed("detail_card", true)
   .attr("text-anchor", "middle")
   .style("fill", "#999999")

   //line
   detailCard.append("line")
   .attr("x1", detailCard_x)
   .attr("y1", detailCard_y + (detailCard_h*0.5))
   .attr("x2", detailCard_x + detailCard_w)
   .attr("y2", detailCard_y + (detailCard_h*0.5))
   .style("stroke", "#ffffff")





 }

 hideMatchDetail(d){
   this.root.selectAll(".match_detail").remove();
 }

  //renders framework of graph
  renderAxes(teamArray) {

    let axis_width = 1;
    //y axis1
    this.root.append("line")
      .attr("x1", this.y1pos - axis_width)
      .attr("y1", this.y_offset)
      .attr("x2", this.y1pos - axis_width)
      .attr("y2", this.y_offset + this.chartheight)
      .style("stroke-width", axis_width)
      .classed("axis", true);

    this.root.append("line")
      .attr("x1", this.y2pos - axis_width)
      .attr("y1", this.y_offset)
      .attr("x2", this.y2pos - axis_width)
      .attr("y2", this.y_offset + this.chartheight)
      .style("stroke-width", axis_width)
      .classed("axis", true);
  }

  renderBadges(teamArray){

      let badges = this.root.append("g");

      badges.selectAll("image")
        .data(teamArray)
        .enter().append("svg:image")
        .attr("xlink:href", (d) => {
          return "./images/" + d.label + ".png"
        })
        .attr("x", this.y1pos  + (this.axisGap * 0.1))
        // .attr("x", (d,i) => {
        //   return this.x_offset + (this.keyWidth * i) + (this.keyWidth * 0.1);
        // })
        // .attr("y", this.y1pos  + (this.axisGap * 0.1))
        .attr("y", (d,i) => {
          return this.y_offset + (this.keyWidth * i) + (this.keyWidth * 0.1);
        })
        .attr("width", this.axisGap * 0.8)
        .attr("height", this.keyWidth * 0.8)
  }
}
