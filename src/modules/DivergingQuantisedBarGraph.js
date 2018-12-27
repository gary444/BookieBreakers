import * as interactions from './interactions.js';
import * as colors from './colors.js';
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

    this.axisGap = this.chartwidth / 30;
    this.y1pos = this.x_offset + (this.chartwidth / 2.0) - (this.axisGap / 2.0);
    this.y2pos = this.x_offset + (this.chartwidth / 2.0) + (this.axisGap * 0.5);


    let arrow_width  = this.axisGap * 0.5;
    this.arrows = [{id:0, x:this.x_offset - arrow_width/2 + this.chartwidth * 0.46},
                  {id:1, x:this.x_offset - arrow_width/2 + this.chartwidth * 0.5, active:true},
                  {id:2, x:this.x_offset - arrow_width/2 + this.chartwidth * 0.54}]

    // this.root.append("rect")
    //   .attr("width", this.width)
    //   .attr("height", this.height)
    //   .style("fill", "blue");
  }



  render(teamArray){

    this.root.select("#changeable").remove();
    this.changeable = this.root.append("g")
      .attr("id", "changeable");

    this.teamArray = teamArray;

    this.keyWidth = this.chartheight / teamArray.length;
    this.blockGap = this.keyWidth * 0.2;

    //find most matches on one side of x axis
    let maxMatches = 0;
    for (var i = 0; i < teamArray.length; i++) {
      if (teamArray[i].oddsCorrect.length > maxMatches) {maxMatches = teamArray[i].oddsCorrect.length;}
      if (teamArray[i].oddsWrong.length > maxMatches) {maxMatches = teamArray[i].oddsWrong.length;}
    }
    // this.blockHeight = (this.y1pos - this.y_offset) / maxMatches;
    this.blockWidth = (this.y1pos - this.y_offset) / maxMatches * 1.5;
    // this.width_factor = 5;

    //matches
    this.matchMarks = this.changeable.append("g");
    this.matchMarks.selectAll("rect")
      .data(teamArray)
      .enter().each( (d,i) => {
        //correct
        this.total_width = this.blockGap * 0.6;
        let matchMarks_pos = this.matchMarks.append("g");
        matchMarks_pos.selectAll("rect")
          .data(d.oddsCorrect)
          .enter()
            .each( (r) => {
              r.width = this.blockWidth * r.correct_prob;
              this.total_width += (r.width * 1);
              r.x = this.y1pos - this.total_width + (r.width * 0);

              })
            .append("rect")
            .attr("x", (r,n) => {
              let x = r.x;
              if (d.name === r.HomeTeam) {r.home_x = x;}
              else if (d.name === r.AwayTeam) {r.away_x = x;}
              return r.x;
              })
            .attr("y", (r) => {
              let y = (i * this.keyWidth) + this.y_offset;
              if (d.name === r.HomeTeam) {r.home_y = y;}
              else if (d.name === r.AwayTeam) {r.away_y = y;}
              return y;
            })
            .attr("width", (r) => {
              return r.width;
            })
            .attr("height", this.keyWidth * 0.95)
            .attr("rx", this.keyWidth * 0.2)
            .attr("ry", this.keyWidth * 0.2)
            .on("mouseover", interactions.showMatchDetail)
            .on("mouseout", interactions.hideMatchDetail)
            .style("fill", (r) => {return colors.getBlockColour(r.correct_prob,true);})
            .classed("block_correct", true);

        //incorrect
        this.total_width = this.blockGap * 0.5;
        let matchMarks_neg = this.matchMarks.append("g");
        matchMarks_neg.selectAll("rect")
          .data(d.oddsWrong)
          .enter()
          .each( (r) => {
            r.width = this.blockWidth * r.incorrect_prob;
            r.x = this.y2pos + this.total_width + (r.width * 0);
            this.total_width += (r.width * 1);
          })
          .append("rect")
            .attr("x", (r,n) => {
              let x = r.x;
              if (d.name === r.HomeTeam) {r.home_x = x;}
              else if (d.name === r.AwayTeam) {r.away_x = x;}
              return r.x;
            })
            .attr("y", (r) => {
              let y = (i * this.keyWidth) + this.y_offset;
              if (d.name === r.HomeTeam) {r.home_y = y;}
              else if (d.name === r.AwayTeam) {r.away_y = y;}
              return y;
            })
            .attr("width", (r) => {
              return r.width;
            })
            .attr("height", this.keyWidth * 0.95)
            .attr("rx", this.keyWidth * 0.2)
            .attr("ry", this.keyWidth * 0.2)
            .on("mouseover", interactions.showMatchDetail)
            .on("mouseout", interactions.hideMatchDetail)
            .style("fill", (r) => {return colors.getBlockColour((r.incorrect_prob),false);})
            .classed("block_wrong", true);

      })


      this.renderAxes(teamArray);
      this.renderBadges(teamArray);
      this.renderArrows();

  }



  showMatchDetail(match){

    // console.log(match);

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
   detailCard_y = match_y - detailCard_h/2;
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


 //date
 detailCard.append("text")
  .attr("x", cntr_x + detailCard_w*0.48)
  .attr("y",line1_y)
  .text(match.Date)
  .classed("detail_card", true)
  .classed("detail_card_date", true)
  .attr("text-anchor", "end")

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
   .style("stroke", "#999")
   .style("stroke-width", 3)

   //detail line
   var correct = false;
   var line_colour = "#af1c2a";
   var length = detailCard_w * (match.incorrect_prob);
   if (match.pred === "correct") {
     line_colour = "#3C91E6";
     correct = true;
     length = detailCard_w * match.correct_prob;
   }
   var start_pnt = 0;
   if (match.FTR === "A") {start_pnt = detailCard_w-length;}
   else if (match.FTR === "D") {start_pnt = (detailCard_w-length) / 2;}
   detailCard.append("line")
   .attr("x1", detailCard_x + start_pnt)
   .attr("y1", detailCard_y + (detailCard_h*0.5))
   .attr("x2", detailCard_x + start_pnt + length)
   .attr("y2", detailCard_y + (detailCard_h*0.5))
   .style("stroke", line_colour)
   .style("stroke-width", 3)





 }

 hideMatchDetail(d){
   this.root.selectAll(".match_detail").remove();
 }

 sortTeamsBy(arrow){

   function sortByCorrectAsc (a, b){
     if (a.oddsCorrect_sum < b.oddsCorrect_sum) {return -1;}
     if (a.oddsCorrect_sum > b.oddsCorrect_sum) {return 1;}
     return 0;
   }
   function sortByCorrectDesc(a,b){
     return - sortByCorrectAsc(a,b);
   }
   function sortByWrongAsc (a,b){
     if (a.oddsWrong_sum < b.oddsWrong_sum) {return -1;}
     if (a.oddsWrong_sum > b.oddsWrong_sum) {return 1;}
     return 0;
   }
   function sortByWrongDesc(a,b){
     return - sortByWrongAsc(a,b);
   }
   function sortByNameAsc(a,b){
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return textA.localeCompare(textB);
   }
   function sortByNameDesc(a,b){
     return -sortByNameAsc(a,b);
   }

   let sortFunctions = [sortByCorrectAsc, sortByNameAsc, sortByWrongAsc,
                        sortByCorrectDesc, sortByNameDesc, sortByWrongDesc];

   let function_id = arrow.id;

   if (arrow.sort === "descending") {
     arrow.sort = "ascending";
     function_id+=3;
   }
   else {
     arrow.sort = "descending";
   }

   for (var i = 0; i < this.arrows.length; i++) {
     this.arrows[i].active = (this.arrows[i].id == arrow.id);
   }



   this.teamArray.sort(sortFunctions[function_id]);
   this.render(this.teamArray)

   // console.log(this.teamArray);

 }

  //renders framework of graph, and labels
  renderAxes(teamArray) {

    let axis_width = 1;
    //y axis1
    // this.changeable.append("line")
    //   .attr("x1", this.y1pos - axis_width)
    //   .attr("y1", this.y_offset)
    //   .attr("x2", this.y1pos - axis_width)
    //   .attr("y2", this.y_offset + this.chartheight)
    //   .style("stroke-width", axis_width)
    //   .classed("axis", true);
    //
    // this.changeable.append("line")
    //   .attr("x1", this.y2pos - axis_width)
    //   .attr("y1", this.y_offset)
    //   .attr("x2", this.y2pos - axis_width)
    //   .attr("y2", this.y_offset + this.chartheight)
    //   .style("stroke-width", axis_width)
    //   .classed("axis", true);

    let label_offset = this.width * 0.05;
    let label_height = this.y_offset * 0.7;
    this.changeable.append("text")
      .attr("x", this.y1pos - label_offset)
      .attr("y", label_height)
      .text("Matches - Odds Correct")
      .classed("axis_label", true)
      .classed("axis_label_left", true)

    this.changeable.append("text")
      .attr("x", this.y2pos + label_offset)
      .attr("y", label_height)
      .text("Matches - Odds Incorrect")
      .classed("axis_label", true)

  }

  renderBadges(teamArray){

      let badges = this.changeable.append("g");

      badges.selectAll("image")
        .data(teamArray)
        .enter().append("svg:image")
        .attr("xlink:href", (d) => {
          return "./images/" + d.label + ".png"
        })
        .attr("x", this.y1pos  + (this.axisGap * 0.1))
        .attr("y", (d,i) => {
          return this.y_offset + (this.keyWidth * i) + (this.keyWidth * 0.1);
        })
        .attr("width", this.axisGap * 0.8)
        .attr("height", this.keyWidth * 0.8)
  }

  renderArrows(){
    let arrow_width  = this.axisGap * 0.5;
    let arrow_y = this.y_offset * 0.3;
    // let arrows = this.arrows;

    this.arrow_group = this.changeable.append("g");

    this.arrow_group.selectAll("image")
      .data(this.arrows).enter()
      .append("image")
        .attr("xlink:href", (d) => {
          let path = "./images/arrow";
          if (d.sort === "descending") {path += "up"}
          return path + ".png";
        })
        .attr("x", (d) => {return d.x;})
        .attr("y", arrow_y)
        .attr("width", arrow_width)
        .attr("id", (d) => {
          return d.id;
        })
        .style("opacity", (d) => {
          if (d.active) {
            return 1.0;
          }
          return 0.5;
        })
        .attr("sort", "descending")
        .on("click", interactions.arrowclick);
  }
}
