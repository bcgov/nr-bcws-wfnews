/**
 * Modified from http://stackoverflow.com/a/22429679
 *
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {any} val the input value
 * @returns {string}
 */
export function UtilType ( val ) {
  var t = typeof val
  if ( t != 'object' ) return t
  if ( Array.isArray( val ) ) return 'array'
  if ( val === null ) return 'null'
  return 'object'
}
export function UtilHash ( val ) {
  var h = walk( 0x811c9dc5, val );
  return ( "0000000" + ( h >>> 0 ).toString( 16 ) ).substr( -8 );
}

var typeCode = {
  undefined:  '\x00',
  null:       '\x01',
  boolean:    '\x02',
  number:     '\x03',
  string:     '\x04',
  function:   '\x05',
  array:      '\x06',
  object:     '\x0a'
}
function walk( h, val ) {
  var t = UtilType( val );
  switch ( t ) {
    case 'string':
      return addBits( h, val )
    case 'array':
      h = addBits( h, typeCode[ t ] )
      for ( var j1 in val )
        h = walk( h, val[ j1 ] )
      return h
    case 'object':
      h = addBits( h, typeCode[ t ] );
      var keys = Object.keys( val ).sort();
      for ( var j2 in keys ) {
        var key = keys[ j2 ];
        h = addBits( h, key );
        h = walk( h, val[ key ] );
      }
      return h
    case 'undefined':
    case 'null':
      return addBits( h, typeCode[ t ] )
    default:
      return addBits( h, typeCode[ t ] + String( val ) )
  }
}
function addBits( h, str ) {
  for ( var i = 0, l = str.length; i < l; i += 1 ) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h
}
