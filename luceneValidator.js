define(['underscore'], function(_) {
  "use strict";

  function removeEscapes(query) {
    return query.replace(/\\./g, "");
  }

  function checkAllowedCharacters(query) {
    if (/[^a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'= ]/.test(query)) {
      return "The allowed characters are a-z A-Z 0-9.  _ + - : () \" & * ? | ! {} [ ] ^ ~ \\ @ = # % $ ' /.";
    }
    return false;
  }

  function checkAsterisk(query) {
    if (/^[\*]*$|[\s]\*|^\*[^\s]/.test(query)) {
      return "The wildcard (*) character must be preceded by at least one alphabet or number.";
    }
    return false;
  }

  function checkAmpersands(query) {
    // NB: doesn't handle term1 && term2 && term3 in Firebird 0.7
    var matches = query.match(/[&]{2}/);
    if (matches && matches.length > 0) {
      matches = query.match(/^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+( && )?[a-zA-Z0-9_+\-:.()\"*?|!{}\[\]\^~\\@#\/$%'=]+[ ]*)+$/); // note missing & in pattern
      if (!matches) {
        return "Queries containing the special characters && must be in the form: term1 && term2.";
      }
    }
    return false;
  }

  function checkCaret(query) {
    if (/[^\\]\^([^\s]*[^0-9.]+)|[^\\]\^$/.test(query)) {
      return "The caret (^) character must be preceded by alphanumeric characters and followed by numbers.";
    }
    return false;
  }

  function checkTilde(query) {
    if (/[^\\]~[^\s]*[^0-9\s]+/.test(query)) {
      return "The tilde (~) character must be preceded by alphanumeric characters and followed by numbers.";
    }
    return false;
  }

  function checkExclamationMark(query) {
    // NB: doesn't handle term1 ! term2 ! term3 or term1 !term2
    if (!/^[^!]*$|^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+( ! )?[a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+[ ]*)+$/.test(query)) {
      return "Queries containing the special character ! must be in the form: term1 ! term2.";
    }
    return false;
  }

  function checkQuestionMark(query) {
    if (/^(\?)|([^a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]\?+)/.test(query)) {
      return "The question mark (?) character must be preceded by at least one alphabet or number.";
    }
    return false;
  }

  function checkParentheses(query) {
    var matchLeft = query.match(/[(]/g),
        matchRight = query.match(/[)]/g),
        countLeft = matchLeft ? matchLeft.length : 0,
        countRight = matchRight ? matchRight.length : 0;

    if (!matchLeft && !matchRight) {
      return false;
    }

    if (matchLeft && !matchRight || matchRight && !matchLeft) {
      return "Parentheses must be closed.";
    }

    if (((countLeft + countRight) % 2) > 0 || countLeft != countRight) {
      return "Parentheses must be closed.";
    }

    if (/\(\)/.test(query)) {
      return "Parentheses must contain at least one character.";
    }

    return false;
  }

  function checkPlusMinus(query) {
    if (!/^[^\n+\-]*$|^([+\-]?[a-zA-Z0-9_:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+[ ]?)+$/.test(query)) {
      return "'+' and '-' modifiers must be followed by at least one alphabet or number.";
    }

    return false;
  }


  function checkANDORNOT(query) {
    if (!/AND|OR|NOT/.test(query)) {
      return false;
    }

    if (!/^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@\/#$%'=]+\s*((AND )|(OR )|(AND NOT )|(NOT ))?[a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@\/#$%'=]+[ ]*)+$/.test(query)) {
      return "Queries containing AND/OR/NOT must be in the form: term1 AND|OR|NOT|AND NOT term2";
    }

    if (/^((AND )|(OR )|(AND NOT )|(NOT ))|((AND)|(OR)|(AND NOT )|(NOT))[ ]*$/.test(query)) {
      return "Queries containing AND/OR/NOT must be in the form: term1 AND|OR|NOT|AND NOT term2";
    }

    return false;
  }

  function checkQuotes(query) {
    var matches = query.match(/\"/g),
        matchCount;

    if (!matches) {
      return false;
    }

    matchCount = matches.length;

    if (matchCount % 2 !== 0) {
      return "Please close all quote (\") marks.";
    }

    if (/""/.test(query)) {
      return "Quotes must contain at least one character.";
    }
    return false;
  }

  function checkColon(query) {
    if (/[^\\\s]:[\s]|[^\\\s]:$|[\s][^\\]?:|^[^\\\s]?:/.test(query)) {
      return "Field declarations (:) must be preceded by at least one alphabet or number and followed by at least one alphabet or number.";
    }
    return false;
  }

  function validate(query) {
    if (!query) {
      return false;
    }

    query = removeEscapes(query);

    var tests = [checkAllowedCharacters, checkAsterisk, checkAmpersands, checkCaret, checkTilde, checkExclamationMark, checkQuestionMark, checkParentheses, checkPlusMinus, checkANDORNOT, checkQuotes, checkColon];

    var errors = _.chain(tests)
                  .map(function(test) { return test(query); })
                  .where(function(r) { return r; })
                  .value();

    return (errors.length > 0) ? errors : false;
  }

  return {
    validate: validate
  };

});