"use strict";

require(['../luceneValidator'], function(luceneValidator){
    var val = luceneValidator;

    console.log(val);

    describe('Lucene Validator', function(){
        it('can remove escapes', function(){
            var query = "\\* foo \\haha";
            expect(val.removeEscapes(query)).to.be(" foo aha");

            query = "\\\\foo";
            expect(val.removeEscapes(query)).to.be("foo");

            query = "foo\\\"";
            expect(val.removeEscapes(query)).to.be("foo");
        });

        it('can check allowed characters', function(){
            var query = "a-zA-Z0-9_+-:.()\"*?&|!{}[]^~\\@#/$%'= ";
            expect(val.checkAllowedCharacters(query)).to.be(undefined);

            query = "foobar";
            expect(val.checkAllowedCharacters(query)).not.to.be(undefined);
        });

        it('can parse', function(){
            // taken from TestQueryParser.java
            var query = "a AND b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "(a AND b)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+a +b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "c OR (a AND b)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "c (+a +b)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a AND NOT b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+a -b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a AND -b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            //query = "a AND !b";
            //expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a && b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            //query = "a && ! b";
            //expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a OR b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a || b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            //query = "a OR !b";
            //expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            //query = "a OR ! b";
            //expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "a OR -b";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+term -term term";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "foo:term AND field:anotherTerm";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "term AND \"phrase phrase\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "\"hello there\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "germ term^2.0";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "(term)^2.0";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "term^2.0";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "(germ term)^2.0";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "term^2.0";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "term^2";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "\"germ term\"^2.0";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "\"term germ\"^2";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "(foo OR bar) AND (baz OR boo)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+(foo bar) +(baz boo)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "((a OR b) AND NOT c) OR d";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "(+(a b) -c) d";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+(apple \"steve jobs\") -(foo bar baz)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+(apple \"steve jobs\") -(foo bar baz)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+title:(dog OR cat) -author:\"bob dole\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
            query = "+(title:dog title:cat) -author:\"bob dole\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
        });

        it('can check asterisk', function(){
            var query = "foo bar is ok";
            expect(val.checkAsterisk(query)).to.be(undefined);

            query = "foo bar12* is ok*";
            expect(val.checkAsterisk(query)).to.be(undefined);

            query = "foo bar12*sdsd";
            expect(val.checkAsterisk(query)).to.be(undefined);

            query = "foo bar12*sd**sd";
            expect(val.checkAsterisk(query)).to.be(undefined);

            query = "*bar12";
            expect(val.checkAsterisk(query)).not.to.be(undefined);

            query = "*ba12r*";
            expect(val.checkAsterisk(query)).not.to.be(undefined);

            query = "bar* *bar";
            expect(val.checkAsterisk(query)).not.to.be(undefined);

            query = "*";
            expect(val.checkAsterisk(query)).not.to.be(undefined);

            query = "*bar";
            expect(val.checkAsterisk(query)).not.to.be(undefined);

            // test with a space in front
            query = " *bar";
            expect(val.checkAsterisk(query)).not.to.be(undefined);

            // test the escaped case
            query = "bar* \\*bar";
            expect(val.checkAsterisk(query)).to.be(undefined);

            // try including other special characters
            query = "foo:bar*ba?r";
            expect(val.checkAsterisk(query)).to.be(undefined);

            query = "foo:(ba*ba?r zoo \"zaa zoo\")";
            expect(val.checkAsterisk(query)).to.be(undefined);
        });

        it('can check ampersands', function(){
            var query = "foo bar is ok";
            expect(val.checkAmpersands(query)).to.be(undefined);

            query = "foo & bar";
            expect(val.checkAmpersands(query)).to.be(undefined);

            query = "foo & bar& metoo &";
            expect(val.checkAmpersands(query)).to.be(undefined);

            query = "foo && bar12isok";
            expect(val.checkAmpersands(query)).to.be(undefined);

            query = "foo && ! bar";
            expect(val.checkAmpersands(query)).to.be(undefined);

            query = "bar12 &&";
            expect(val.checkAmpersands(query)).not.to.be(undefined);

            query = "bar12 && bar12 &&";
            expect(val.checkAmpersands(query)).not.to.be(undefined);

            query = "bar12 && ";
            expect(val.checkAmpersands(query)).not.to.be(undefined);
        });

        it('can check caret', function(){
            var query = "foo bar is ok";
            expect(val.checkCaret(query)).to.be(undefined);

            query = "foo bar12isok^1.0";
            expect(val.checkCaret(query)).to.be(undefined);

            query = "\"jakarta apache\"^10";
            expect(val.checkCaret(query)).to.be(undefined);

            query = "bar12^";
            expect(val.checkCaret(query)).not.to.be(undefined);

            query = "bar12^10 bar12^";
            expect(val.checkCaret(query)).not.to.be(undefined);

            query = "bar12^ ";
            expect(val.checkCaret(query)).not.to.be(undefined);

            query = "bar12^ me too";
            expect(val.checkCaret(query)).not.to.be(undefined);

            query = "bar12^foo";
            expect(val.checkCaret(query)).not.to.be(undefined);

            query = "bar12^1.foo";
            expect(val.checkCaret(query)).not.to.be(undefined);

            // test the escaped case
            query = "\\^";
            expect(val.checkCaret(query)).to.be(undefined);

            query = "bar\\^";
            expect(val.checkCaret(query)).to.be(undefined);

            // try including other special characters
            query = "bar*ba?r^1.0";
            expect(val.checkCaret(query)).to.be(undefined);
        });

        it('can check tilde', function(){
            var query = "foo bar is ok";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "foo bar12isok~10";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "\"jakarta apache\"~10";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "bar12~";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "bar12~10 bar12~";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "bar12~ ";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "bar12~foo";
            expect(val.checkTilde(query)).not.to.be(undefined);

            query = "bar12~1f";
            expect(val.checkTilde(query)).not.to.be(undefined);

            // test the escaped case
            query = "\\~";
            expect(val.checkTilde(query)).to.be(undefined);

            query = "bar\\~";
            expect(val.checkTilde(query)).to.be(undefined);

            // try including other special characters
            query = "bar*ba?r~10";
            expect(val.checkTilde(query)).to.be(undefined);
        });

        it('can check exclamation mark', function(){
            var query = "foo bar is ok";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo ! bar";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "\"foo\" ! \"bar\"";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo!";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo && ! bar";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo && !bar";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "! bar";
            expect(val.checkExclamationMark(query)).not.to.be(undefined);

            query = "foo !";
            expect(val.checkExclamationMark(query)).not.to.be(undefined);

            query = "foo ! ";
            expect(val.checkExclamationMark(query)).not.to.be(undefined);

            // test escaped case
            query = "foo \\!";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo ! bar \\!";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo ! bar ! car";
            expect(val.checkExclamationMark(query)).to.be(undefined);

            query = "foo ! bar !";
            expect(val.checkExclamationMark(query)).not.to.be(undefined);

            query = "foo ! bar !   ";
            expect(val.checkExclamationMark(query)).not.to.be(undefined);

            // try more complex queries
            query = "(foo bar) ! (car:dog*)";
            expect(val.checkExclamationMark(query)).to.be(undefined);
        });

        it('can check question marks', function(){
            var query = "foo bar is ok";
            expect(val.checkQuestionMark(query)).to.be(undefined);

            query = "foo bar12? is ok?";
            expect(val.checkQuestionMark(query)).to.be(undefined);

            query = "foo bar12?sdsd";
            expect(val.checkQuestionMark(query)).to.be(undefined);

            query = "foo bar12?sd??sd";
            expect(val.checkQuestionMark(query)).to.be(undefined);

            query = "?bar12";
            expect(val.checkQuestionMark(query)).not.to.be(undefined);

            query = "?ba12r?";
            expect(val.checkQuestionMark(query)).not.to.be(undefined);

            query = "bar? ?bar";
            expect(val.checkQuestionMark(query)).not.to.be(undefined);

            // test with a space in front
            query = " ?bar";
            expect(val.checkQuestionMark(query)).not.to.be(undefined);

            // test the escaped case
            query = "bar? \\?bar";
            expect(val.checkQuestionMark(query)).to.be(undefined);

            // try including other special characters
            query = "foo:bar*ba?r";
            expect(val.checkQuestionMark(query)).to.be(undefined);

            query = "foo:(ba*ba?r zoo \"zaa zoo\")";
            expect(val.checkQuestionMark(query)).to.be(undefined);
        });

        it('can check parentheses', function(){
            var query = "foo bar is ok";
            expect(val.checkParentheses(query)).to.be(undefined);

            query = "(foobar12:isok)";
            expect(val.checkParentheses(query)).to.be(undefined);

            query = "(foobar12):(sdsd* me too)";
            expect(val.checkParentheses(query)).to.be(undefined);

            query = "(bar12";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            query = "ba12r)";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            query = "()";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            query = "))";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            query = "(foo bar) (bar";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            query = "(foo bar) bar) me too";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            // test with a space in front
            query = " (bar";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            // test the escaped case
            query = "foo\\)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);

            query = "foo\\) (foo bar)";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);

            // try including other special characters
            query = "-(foo bar*ba?r)";
            expect(val.checkParentheses(query)).to.be(undefined);

            query = "+foo:(ba*ba?r zoo -(zaa zoo))";
            expect(val.checkParentheses(query)).to.be(undefined);

            query = "((bar12";
            expect(val.checkParentheses(query)).not.to.be(undefined);

            query = "((bar12)";
            expect(val.checkParentheses(query)).not.to.be(undefined);
        });

        it('can check plus minus', function(){
            var query = "foo bar is ok";
            expect(val.checkPlusMinus(query)).to.be(undefined);

            query = "+bar -foo";
            expect(val.checkPlusMinus(query)).to.be(undefined);

            // is this allowed?
            query = "baa+foo +foo-bar";
            expect(val.checkPlusMinus(query)).to.be(undefined);

            query = "baa+";
            expect(val.checkPlusMinus(query)).not.to.be(undefined);

            query = "++baa";
            expect(val.checkPlusMinus(query)).not.to.be(undefined);

            query = "+";
            expect(val.checkPlusMinus(query)).not.to.be(undefined);

            query = "-";
            expect(val.checkPlusMinus(query)).not.to.be(undefined);

            // test the escaped case
            query = "foo\\+";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);

            // try including other special characters
            query = "-(foo bar*ba?r)";
            expect(val.checkParentheses(query)).to.be(undefined);

            query = "+foo:(ba*ba?r zoo -(zaa zoo))";
            expect(val.checkParentheses(query)).to.be(undefined);
        });

        it('can check AND & NOT', function(){
            var query = "foo bar is ok";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo AND bar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo OR bar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo NOT bar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo AND NOT bar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo NOT bar -foobar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo AND bar dog AND NOT fox";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo and";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "and bar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "fooAND bar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "foo ANDbar";
            expect(val.checkANDORNOT(query)).to.be(undefined);

            query = "AND bar";
            expect(val.checkANDORNOT(query)).not.to.be(undefined);

            query = "OR bar";
            expect(val.checkANDORNOT(query)).not.to.be(undefined);

            query = "NOT bar";
            expect(val.checkANDORNOT(query)).not.to.be(undefined);

            query = "foo AND";
            expect(val.checkANDORNOT(query)).not.to.be(undefined);

            query = "foo AND ";
            // note the space
            expect(val.checkANDORNOT(query)).not.to.be(undefined);

            query = "AND AND";
            expect(val.checkANDORNOT(query)).not.to.be(undefined);

            query = "AND";
            expect(val.checkANDORNOT(query)).not.to.be(undefined);
        });

        it('can check quotes', function(){
           var query = "foo bar is ok";
            expect(val.checkQuotes(query)).to.be(undefined);

            query = "\"foobar12:isok\"";
            expect(val.checkQuotes(query)).to.be(undefined);

            query = "\"(foobar12)\":(sdsd* me too)";
            expect(val.checkQuotes(query)).to.be(undefined);

            query = "\"bar12";
            expect(val.checkQuotes(query)).not.to.be(undefined);

            query = "\"\"";
            expect(val.checkQuotes(query)).not.to.be(undefined);

            query = "ba12r\"";
            expect(val.checkQuotes(query)).not.to.be(undefined);

            query = "\"foo bar\" \"bar";
            expect(val.checkQuotes(query)).not.to.be(undefined);

            query = "\"foo bar\" bar\" me too";
            expect(val.checkQuotes(query)).not.to.be(undefined);

            // test with a space in front
            query = " \"bar";
            expect(val.checkQuotes(query)).not.to.be(undefined);

            // test the escaped case
            query = "foo\\\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);

            query = "foo\\\" \"foo bar\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);

            // try including other special characters
            query = "\"foo bar*ba?r\"";
            expect(val.checkQuotes(query)).to.be(undefined);

            query = "foo:(ba*ba?r zoo \"zaa zoo\")";
            expect(val.checkQuotes(query)).to.be(undefined);

            query = "\\\"\\\"bar12\\\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);

            query = "\\\"\\\"bar12\\\"\\\"";
            expect(val.doCheckLuceneQueryValue(query)).to.be(undefined);
        });

        it('can validate colon', function(){
            var query = "foo bar is ok";
            expect(val.checkColon(query)).to.be(undefined);

            query = "foobar12:isok";
            expect(val.checkColon(query)).to.be(undefined);

            query = "(foobar12):(sdsd* me too)";
            expect(val.checkColon(query)).to.be(undefined);

            query = "bar12:";
            expect(val.checkColon(query)).not.to.be(undefined);

            query = ":ba12r";
            expect(val.checkColon(query)).not.to.be(undefined);

            query = "foo:bar :bar";
            expect(val.checkColon(query)).not.to.be(undefined);

            query = "foo:bar bar: me too";
            expect(val.checkColon(query)).not.to.be(undefined);

            // test with a space in front
            query = " :bar";
            expect(val.checkColon(query)).not.to.be(undefined);

            // test the escaped case
            query = "foo\\:";
            expect(val.checkColon(query)).to.be(undefined);

            query = "foo\\: foo:bar";
            expect(val.checkColon(query)).to.be(undefined);

            // try including other special characters
            query = "foo:bar*ba?r";
            expect(val.checkColon(query)).to.be(undefined);

            query = "foo:(ba*ba?r zoo \"zaa zoo\")";
            expect(val.checkColon(query)).to.be(undefined);
        });

    });

    mocha.run();

});