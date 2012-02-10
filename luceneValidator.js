"use strict";
define([], function(){

    // Makes wildcard queries case-insensitive if true.
    // Refer to http://www.mail-archive.com/lucene-user@jakarta.apache.org/msg00646.html

    var wildcardCaseInsensitive = true;

    return {
        setWildcardCaseInsensitive: function(bool){
            wildcardCaseInsensitive = bool;
        },

        removeEscapes: function(query){
            return query.replace(/\\./g, "");
        },

        checkAllowedCharacters: function(query){
            if(/[^a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'= ]/.test(query)){
                return "The allowed characters are a-z A-Z 0-9.  _ + - : () \" & * ? | ! {} [ ] ^ ~ \\ @ = # % $ ' /.";
            }
        },

        checkAsterisk: function(query){
            if(/^[\*]*$|[\s]\*|^\*[^\s]/.test(query)){
                return "The wildcard (*) character must be preceded by at least one alphabet or number.";
            }
        },

        checkAmpersands: function(query){
            // NB: doesn't handle term1 && term2 && term3 in Firebird 0.7
            var matches = query.match(/[&]{2}/);
            if(matches && matches.length > 0){
                matches = query.match(/^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+( && )?[a-zA-Z0-9_+\-:.()\"*?|!{}\[\]\^~\\@#\/$%'=]+[ ]*)+$/); // note missing & in pattern
                if(!matches){
                    return "Queries containing the special characters && must be in the form: term1 && term2.";
                }
            }
        },

        checkCaret: function(query){
            if(/[^\\]\^([^\s]*[^0-9.]+)|[^\\]\^$/.test(query)){
                return "The caret (^) character must be preceded by alphanumeric characters and followed by numbers.";
            }
        },

        checkTilde: function(query){
            if(/[^\\]~[^\s]*[^0-9\s]+/.test(query)){
                return "The tilde (~) character must be preceded by alphanumeric characters and followed by numbers.";
            }
        },

        checkExclamationMark: function(query){
            // NB: doesn't handle term1 ! term2 ! term3 or term1 !term2
            if(!/^[^!]*$|^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+( ! )?[a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+[ ]*)+$/.test(query)){
                return "Queries containing the special character ! must be in the form: term1 ! term2.";
            }
        },

        checkQuestionMark: function(query){
            if(/^(\?)|([^a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]\?+)/.test(query)){
                return "The question mark (?) character must be preceded by at least one alphabet or number.";
            }
        },

        checkParentheses: function(query){
            var matchLeft = query.match(/[(]/g),
                matchRight = query.match(/[)]/g),
                countLeft = matchLeft ? matchLeft.length : 0,
                countRight = matchRight ? matchRight.length : 0;

            if(!matchLeft && !matchRight){
                return;
            }

            if(matchLeft && !matchRight || matchRight && !matchLeft){
                return "Parentheses must be closed.";
            }

            if(((countLeft + countRight) % 2) > 0 || countLeft != countRight){
                return "Parentheses must be closed.";
            }

            if(/\(\)/.test(query)){
                return"Parentheses must contain at least one character.";
            }
        },

        checkPlusMinus: function(query){
            if(!/^[^\n+\-]*$|^([+\-]?[a-zA-Z0-9_:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+[ ]?)+$/.test(query)){
                return "'+' and '-' modifiers must be followed by at least one alphabet or number.";
            }
        },

        checkANDORNOT: function(query){
            if(!/AND|OR|NOT/.test(query)){
                return;
            }

            if(!/^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@\/#$%'=]+\s*((AND )|(OR )|(AND NOT )|(NOT ))?[a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@\/#$%'=]+[ ]*)+$/.test(query)){
                return "Queries containing AND/OR/NOT must be in the form: term1 AND|OR|NOT|AND NOT term2";
            }

            if(/^((AND )|(OR )|(AND NOT )|(NOT ))|((AND)|(OR)|(AND NOT )|(NOT))[ ]*$/.test(query)){
                return "Queries containing AND/OR/NOT must be in the form: term1 AND|OR|NOT|AND NOT term2";
            }
        },

        checkQuotes: function(query){
            var matches = query.match(/\"/g),
                matchCount;

            if(!matches){
                return;
            }

            matchCount = matches.length;

            if(matchCount % 2 !== 0){
                return "Please close all quote (\") marks.";
            }

            if(/""/.test(query)){
                return "Quotes must contain at least one character.";
            }
        },

        checkColon: function(query){
            if(/[^\\\s]:[\s]|[^\\\s]:$|[\s][^\\]?:|^[^\\\s]?:/.test(query)){
                return "Field declarations (:) must be preceded by at least one alphabet or number and followed by at least one alphabet or number.";
            }
        },

        doCheckLuceneQueryValue: function(query){
            if(!query){
                return;
            }

            query = this.removeEscapes(query);

            var errorMsg,
                tests = [this.checkAllowedCharacters,this.checkAsterisk,this.checkAmpersands,
                            this.checkCaret,this.checkTilde,this.checkExclamationMark,
                            this.checkQuestionMark,this.checkParentheses,this.checkPlusMinus,
                            this.checkANDORNOT,this.checkQuotes,this.checkColon];

            for (var i = tests.length - 1; i >= 0; i--) {
                errorMsg = tests[i](query);
                if(errorMsg){
                    return errorMsg;
                }
            }

            if(wildcardCaseInsensitive){
                if(query.indexOf("*") != -1){
                    var j = query.indexOf(':');
                    if(j == -1){
                        query.value = query.toLowerCase();
                    } else {
                        // found a wildcard field search
                        query.value = query.substring(0, j) + query.substring(j).toLowerCase();
                    }
                }
            }
        }
    };

});