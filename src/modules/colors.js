function getBlockColour(value, isCorrect) {

  if (isCorrect === true) {

    if (value > 0.8) {
      return "#3C91E6";
    }
    else if (value > 0.5) {
      return "#76ace2";
    }
    else if (value > 0.25) {
      return "#a5c4e2";
    }
    else {
      return "#becddb";
    }
  }
  else {
    if (value > 0.8) {
      return "#af1c2a"
        // return "#0f0"
    }
    else if (value > 0.5) {
      return "#bc4f59";
    }
    else if (value > 0.25) {
      return "#cc8087";
    }
    else {
      return "#e2babd";
    }
  }
}

export {getBlockColour}
