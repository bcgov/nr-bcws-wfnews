/**
 * object.utils
 */
/**
 * Extends an object with the *enumerable* and *own* properties of one or more source objects,
 * similar to Object.assign.
 *
 * @param dest The object which will have properties copied to it.
 * @param sources The source objects from which properties will be copied.
 */
export function extendObject(dest, ...sources) {
    if (dest == null) {
        throw TypeError('Cannot convert undefined or null to object');
    }
    for (const source of sources) {
        if (source != null) {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    dest[key] = source[key];
                }
            }
        }
    }
    return dest;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LnV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcGlja2VyL3NyYy9saWIvdXRpbHMvb2JqZWN0LnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0g7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFTLEVBQUUsR0FBRyxPQUFjO0lBQ3JELElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNkLE1BQU0sU0FBUyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7S0FDakU7SUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtRQUMxQixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDaEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7Z0JBQ3RCLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDM0I7YUFDSjtTQUNKO0tBQ0o7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBvYmplY3QudXRpbHNcbiAqL1xuXG5cbi8qKlxuICogRXh0ZW5kcyBhbiBvYmplY3Qgd2l0aCB0aGUgKmVudW1lcmFibGUqIGFuZCAqb3duKiBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzLFxuICogc2ltaWxhciB0byBPYmplY3QuYXNzaWduLlxuICpcbiAqIEBwYXJhbSBkZXN0IFRoZSBvYmplY3Qgd2hpY2ggd2lsbCBoYXZlIHByb3BlcnRpZXMgY29waWVkIHRvIGl0LlxuICogQHBhcmFtIHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzIGZyb20gd2hpY2ggcHJvcGVydGllcyB3aWxsIGJlIGNvcGllZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZE9iamVjdChkZXN0OiBhbnksIC4uLnNvdXJjZXM6IGFueVtdKTogYW55IHtcbiAgICBpZiAoZGVzdCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc291cmNlcykge1xuICAgICAgICBpZiAoc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBkZXN0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVzdDtcbn1cbiJdfQ==