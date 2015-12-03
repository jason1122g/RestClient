function initEventHandlers() {
  $( '.foot-form .query'  ).on( 'click', addQuery );
  $( '.foot-form .header' ).on( 'click', addHeader );
  $( '.foot-form .body'   ).on( 'click', triggerBody );
  $( '.foot-form .send'   ).on( 'click', sendRequest );
  $( '.url-form .method .selector' ).on( 'change', changeMethod );
}

function isBodyMethod( method ) {
  return method != 'GET' && method != 'DELETE' && method != 'HEAD' && method != 'OPTIONS';
}

function createInputKey( type ) {
  var input_key = document.createElement( "input" );
  input_key.type = "text";
  input_key.className = "key";
  input_key.placeholder = type + " key";
  return input_key;
}

function createInputValue() {
  var input_value = document.createElement( "input" );
  input_value.type = "text";
  input_value.className = "value";
  input_value.placeholder = "value";
  return input_value;
}

function createInputDeletor( element ) {
  var input_deletor = document.createElement( "span" );
  input_deletor.innerHTML = "X";
  input_deletor.className = "btn btn-danger btn-sm deletor";
  input_deletor.onclick = function() {
    element.remove();
  };
  return input_deletor;
}

function createTextarea( type ) {
  var input_value = document.createElement( "textarea" );
  input_value.className = "value";
  input_value.placeholder = type + " value";
  return input_value;
}

function changeMethod() {
  var method = this.value;
  if( isBodyMethod( method ) ) {
    $( '.foot-form .query' ).hide();
    $( '.foot-form .body' ).show();
  } else {
    $( '.foot-form .query' ).show();
    $( '.foot-form .body' ).hide();
  }
}

function addQuery() {
  var query_form = document.querySelector( ".query-form" );
  var query_item = document.createElement( "div" );
  query_item.className = "item";
  query_item.appendChild( createInputKey( "query" ) );
  query_item.appendChild( createInputValue() );
  query_item.appendChild( createInputDeletor( query_item ) );
  query_form.appendChild( query_item );
}

function addHeader() {
  var header_form = document.querySelector( ".header-form" );
  var header_item = document.createElement( "div" );
  header_item.className = "item";
  header_item.appendChild( createInputKey( "header" ) );
  header_item.appendChild( createInputValue() );
  header_item.appendChild( createInputDeletor( header_item ) );
  header_form.appendChild( header_item );
}

function triggerBody() {
  var body_item = document.querySelector( ".body-form .item .value" );
  if( body_item ) {
    body_item.remove();
  } else {
    var body_form = document.querySelector( ".body-form" );
    body_item = document.createElement( "div" );
    body_item.className = "item";
    body_item.appendChild( createTextarea( "body" ) );
    body_form.appendChild( body_item );
  }
}

function getURL() {
  return $( '.url-form .url input' ).val();
}

function getMethod() {
  return $( '.url-form .method .selector' ).val();
}

function getParams() {
  return $( '.query-form .item' ).map( function(){
    var pair  = $(this).children();
    var key   = pair.eq( 0 ).val();
    var value = pair.eq( 0 ).val();
    if( key.trim() != '' && value.trim() != '' ) {
      return pair.eq( 0 ).val() + "=" + pair.eq( 1 ).val();
    } else {
      return undefined;
    }
  } ).get().join( '&' );
}

function getBody() {
  var body = $( '.body-form .item .value' )
  if( body && body.val() != '' ) {
    return body.val();
  } else {
    return undefined;
  }
}

function getData() {
  var method = getMethod();
  if( isBodyMethod( method ) ) {
    return getBody();
  } else {
    return getParams();
  }
}

function getHeaders() {
  return JSON.parse( '{' + $( '.header-form .item' ).map( function(){
    var pair = $(this).children();
    var key   = pair.eq( 0 ).val();
    var value = pair.eq( 0 ).val();
    if( key.trim() != '' && value.trim() != '' ) {
      return '"'+ pair.eq( 0 ).val() + '":"' + pair.eq( 1 ).val() + '"'
    } else {
      return undefined;
    }
  } ).get().join( ',' ) + '}' );
}

function getContentType() {
  var body = getBody();
  if( body ) {
    try {
      JSON.parse( body );
      return 'application/json;charset=utf-8';
    } catch(e) {}
  }
  return undefined;
}

function renderResponseBody( xhr ) {
  var crossFrame  = xhr.getResponseHeader( 'X-Frame-Options' ) || "";
  var contentType = xhr.getResponseHeader( "content-type" ) || "";
  if( contentType.indexOf( 'html' ) > -1 && crossFrame != 'sameorigin' && crossFrame != 'deny' ) {
    $( '.result-body' ).html( '<iframe class="result-frame" src="' + getURL() + '"></iframe>' );
    $( '.result-frame' ).css( 'height', $( window ).height() - 150 + 'px' );
  } else if ( contentType.indexOf( 'json' ) > -1 ) {
    $( '.result-body' ).text( JSON.stringify( JSON.parse( xhr.responseText ), null, 2 ) );
  } else {
    $( '.result-body' ).text( xhr.responseText );
  }
}

function renderResponseHeader( xhr ) {
    $( '.result-header' ).text( xhr.getAllResponseHeaders() );
}

function renderResponseStatus( xhr ) {
  var color, status = parseInt( xhr.status );
  if( 100 <= status && status < 200 ) {
    color = 'white';
  } else if( 200 <= status && status < 300 ) {
    color = '#5cb85c';
  } else if( 300 <= status && status < 400 ) {
    color = '#5bc0de';
  } else {
    color = '#d9534f';
  }
  $( '.result-state' ).css( 'background-color', color );
  $( '.result-state' ).text( 'Status: ' + status );
}

function renderResponse( xhr ) {
  renderResponseBody( xhr );
  renderResponseHeader( xhr );
  renderResponseStatus( xhr );
  $( '.response-form' ).show();
}

function sendRequest() {
  $.ajaxSetup( {
    xhr: function() { return new window.XMLHttpRequest( { mozSystem: true } ); }
  } );
  $.ajax({
    type: getMethod(),
    url: getURL(),
    data: getData(),
    headers: getHeaders(),
    contentType: getContentType()
  }).done( function( data, status, xhr ){
    renderResponse( xhr );
  } ).fail( function( xhr, status, err ){
    renderResponse( xhr );
  } );
}

module.exports.isBodyMethod = isBodyMethod;
