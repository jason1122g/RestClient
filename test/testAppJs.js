var assert = require('assert');
var sinon  = require('sinon');
var rest   = require('../rest.js')

describe( 'app', function(){
  describe( 'isBodyMethod', function(){
    var tests = [
      { input: 'GET',     output: false },
      { input: 'DELETE',  output: false },
      { input: 'HEAD',    output: false },
      { input: 'OPTIONS', output: false },
      { input: 'POST',    output: true },
      { input: 'PUT',     output: true },
      { input: 'PATCH',   output: true }
    ];
    tests.forEach( function(test){
      it('tell "' + test.input + '" as ' + test.output, function(){
        assert.equal(test.output, rest.isBodyMethod(test.input));
      })
    })
  })
})
