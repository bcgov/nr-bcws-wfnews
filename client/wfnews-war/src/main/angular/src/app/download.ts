export function download( url, fileName ) {
    const link = document.createElement( 'a' )
    link.setAttribute( 'target', '_blank' )
    link.setAttribute( 'href', url )
    link.setAttribute( 'download', fileName )
    document.body.appendChild( link )
    link.click()
    link.remove()
}