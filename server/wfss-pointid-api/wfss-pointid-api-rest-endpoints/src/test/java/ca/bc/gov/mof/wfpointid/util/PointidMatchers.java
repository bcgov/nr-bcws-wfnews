package ca.bc.gov.mof.wfpointid.util;

import java.util.Optional;
import java.util.function.Function;
import java.util.regex.Pattern;

import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;

public class PointidMatchers {
	public static final Pattern VALUE_WITH_UNIT_PATTERN = Pattern.compile("^([-]?(?:(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?)(.*)$");

	private PointidMatchers() {}

	/**
	 * Matches a String if when it is passed to the given parser function, the result matches the given matcher
	 * @param <T> type to parse as
	 * @param parser parser for the value
	 * @param valueMatch matcher for the parsed value
	 */
	public static <T> Matcher<String> parseTo(Function<String, T> parser, Matcher<T> valueMatch) {
		return new BaseMatcher<String>() {
	
			@Override
			public boolean matches(Object item) {
				T parsedValue = parser.apply((String) item);
				return valueMatch.matches(parsedValue);
			}
	
			@Override
			public void describeTo(Description description) {
				description
					.appendText("string that parses to value that ")
					.appendDescriptionOf(valueMatch);
			}
			
		};
	}

	/**
	 * Matches a String if it starts with a number that can be parsed by the given parser function resulting in a vlaue matching the given value matcher followed by a unit matching the given unit matcher.
	 * @param <T> numeric type to parse as
	 * @param parser Function to parse the value
	 * @param valueMatch Matcher for the value
	 * @param unitMatch Matcher for the unit
	 */
	public static <T> Matcher<String> valueWithUnit(Function<String, T> parser, Matcher<T> valueMatch, Matcher<String> unitMatch) {
		return new BaseMatcher<String>() {
	
			@Override
			public boolean matches(Object item) {
				java.util.regex.Matcher matcher = VALUE_WITH_UNIT_PATTERN.matcher((CharSequence) item);
				if(!matcher.matches()) {
					return false;
				}
				String valueString = matcher.group(1);
				String unitString = matcher.group(2);
				T parsedValue = parser.apply((String) valueString);
				return valueMatch.matches(parsedValue) && unitMatch.matches(unitString);
			}
	
			@Override
			public void describeTo(Description description) {
				description
					.appendText("string that parses to value that ")
					.appendDescriptionOf(valueMatch)
					.appendText(" with unit ")
					.appendDescriptionOf(unitMatch);
			}
			
		};
	}

	/**
	 * Matches an Optional if it contains a value that matches the given matcher
	 * @param <T> type contained by the Optional
	 * @param valueMatcher matcher for the value of the Optional
	 */
	public static <T> Matcher<Optional<T>> isPresent(Matcher<T> valueMatcher) {
		return new BaseMatcher<Optional<T>>() {
	
			@Override
			public boolean matches(Object item) {
				if(item instanceof Optional) {
					@SuppressWarnings("unchecked")
					Optional<T> opt = (Optional<T>) item;
					return opt.map(valueMatcher::matches).orElse(false);
				}
				return false;
			}
	
			@Override
			public void describeTo(Description description) {
				description
					.appendText("Optional that is present and has value ")
					.appendDescriptionOf(valueMatcher);
			}
	
			@Override
			public void describeMismatch(Object item, Description description) {
				if(item instanceof Optional) {
				@SuppressWarnings("unchecked")
					Optional<T> opt = (Optional<T>) item;
					if(opt.isPresent()) {
						description.appendText("value was present but was");
						description.appendDescriptionOf(valueMatcher);
					} else {
						description.appendText("value was not present");
					}
				} else {
					description.appendText("not an Optional");
				}
				
			}
			
		};
	}

	/**
	 * Matches an Optional if it does not contain a value
	 * @param <T> type contained by the Optional
	 */
	public static <T> Matcher<Optional<T>> isEmpty() {
		return new BaseMatcher<Optional<T>>() {
	
			@Override
			public boolean matches(Object item) {
				if(item instanceof Optional) {
					return !((Optional<?>) item).isPresent();
				}
				return false;
			}
	
			@Override
			public void describeTo(Description description) {
				description
					.appendText("Optional that is empty");
			}
	
			@Override
			public void describeMismatch(Object item, Description description) {
				if(item instanceof Optional) {
				@SuppressWarnings("unchecked")
					Optional<T> opt = (Optional<T>) item;
					description.appendText("Optional had value ").appendValue(opt.get());
				} else {
					description.appendText("not an Optional");
				}
				
			}
			
		};
	}
	
	
}
