package ca.bc.gov.mof.wfpointid.test.util;

import java.util.regex.Pattern;

import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.Matchers;

import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.query.QueryResult;

public class QueryCheck {

	@Deprecated
	public static boolean isValue(QueryResult res, String dataName, Object value) {
		Object resultValue = res.getValue(dataName);
		if (resultValue == null) return value == null;
		return resultValue.equals(value);
	}

	public static boolean isError(QueryResult res) {
		return res.isSuccess() == false;
	}

	public static Matcher<QueryResult> isSuccess(){
		return new BaseMatcher<QueryResult>() {

			@Override
			public boolean matches(Object item) {
				if(item instanceof QueryResult) {
					return ((QueryResult)item).isSuccess();
				} else {
					return false;
				}
			}

			@Override
			public void describeTo(Description description) {
				description.appendText("successful query result");
			}
			
		    @Override
		    public void describeMismatch(Object item, Description description) {
				if(item instanceof QueryResult) {
					description.appendText("request failed with ").appendValue(((QueryResult)item).getErrorMsg());
				} else {
					description.appendText("not a QueryResult");
				}
		    }
		};
	}
	
	public static Matcher<QueryResult> isError(String dataName, Matcher<String> errorMatcher){
		return new BaseMatcher<QueryResult>() {

			@Override
			public boolean matches(Object item) {
				if(item instanceof QueryResult) {
					QueryResult queryResult = (QueryResult)item;
					if(queryResult.isSuccess()) {
						return false;
					}
					DataResult dr = queryResult.findResultFor(dataName);
					String errmsg = dr.getErrMsg();
					return errorMatcher.matches(errmsg);
				} else {
					return false;
				}
			}

			@Override
			public void describeTo(Description description) {
				description.appendText("query result that fails with error that is ").appendDescriptionOf(errorMatcher);
			}
			
		    @Override
		    public void describeMismatch(Object item, Description description) {
				if(item instanceof QueryResult) {
					QueryResult queryResult = (QueryResult)item;
					if(queryResult.isSuccess()) {
						description.appendText("request did not fail as expected");
					} else {
						DataResult dr = queryResult.findResultFor(dataName);
						String errmsg = dr.getErrMsg();
						description.appendText("request failed incorrect message ").appendValue(errmsg);
					}
				} else {
					description.appendText("not a QueryResult");
				}
		    }
		};
	}
	
	@Deprecated()
	public static boolean isSuccess(QueryResult res) {
		boolean isSuccess = res.isSuccess();
		if (!isSuccess) {
			System.out.println(res.getErrorMsg());
		}
		return isSuccess;
	}
	
	public static boolean isErroCount(QueryResult res, int count) {
		return res.getErrorCount() == count;
	}
	
	@Deprecated
	public static boolean isErrorMsgLike(QueryResult res, String dataName, String s1) {
		DataResult dr = res.findResultFor(dataName);
		String errmsg = dr.getErrMsg();
		
		int i1 = errmsg.indexOf(s1);
		if (i1 < 0) return false;
		
		return true;
	}
	@Deprecated
	public static boolean isErrorMsgLike(QueryResult res, String dataName, String s1, String s2) {
		DataResult dr = res.findResultFor(dataName);
		String errmsg = dr.getErrMsg();
		
		int i1 = errmsg.indexOf(s1);
		if (i1 < 0) return false;
		
		int i2 = errmsg.indexOf(s2);
		if (i2 < 0) return false;
		if (i2 < i1) return false;
		
		return true;
	}

	public static Matcher<QueryResult> hasValue(String dataName, Matcher<String> valueMatcher) {
		return new BaseMatcher<QueryResult>() {

			@Override
			public boolean matches(Object item) {
				if(item instanceof QueryResult) {
					QueryResult queryResult = (QueryResult)item;
					return valueMatcher.matches(queryResult.getValue(dataName));
				} else {
					return false;
				}
			}

			@Override
			public void describeTo(Description description) {
				description.appendText("query result with field ").appendValue(dataName).appendText(" that is ").appendDescriptionOf(valueMatcher);
			}
			
		    @Override
		    public void describeMismatch(Object item, Description description) {
				if(item instanceof QueryResult) {
					QueryResult queryResult = (QueryResult)item;
					description.appendText("field  ").appendValue(dataName).appendText(" was ");
					valueMatcher.describeMismatch(queryResult.getValue(dataName), description);
				} else {
					description.appendText("not a QueryResult");
				}
		    }
			
		};
	}
	public static Matcher<QueryResult> hasValue(String dataName, String value) {
		return hasValue(dataName, Matchers.equalTo(value));
	}
	
	public static Matcher<QueryResult> noValue(String dataName) {
		return hasValue(dataName, Matchers.nullValue(String.class));
	}
	
	public static Matcher<QueryResult> hasData(String dataName, Matcher<String> valueMatcher) {
		return new BaseMatcher<QueryResult>() {

			@Override
			public boolean matches(Object item) {
				if(item instanceof QueryResult) {
					QueryResult queryResult = (QueryResult)item;
					if (null == queryResult.findResultFor(dataName)) {
						return false;
					}
					return valueMatcher.matches(queryResult.getValue(dataName));
				} else {
					return false;
				}
			}

			@Override
			public void describeTo(Description description) {
				description.appendText("query result with field ").appendValue(dataName).appendText(" that is ").appendDescriptionOf(valueMatcher);
			}
			
		    @Override
		    public void describeMismatch(Object item, Description description) {
				if(item instanceof QueryResult) {
					QueryResult queryResult = (QueryResult)item;
					if (null == queryResult.findResultFor(dataName)) {
						description.appendText("findResult for ").appendValue(dataName).appendText(" returned null");
					} else {
						description.appendText("field ").appendValue(dataName).appendText(" was ");
						valueMatcher.describeMismatch(queryResult.getValue(dataName), description);
					}
				} else {
					description.appendText("is not a QueryResult");
				}
		    }
			
		};
	}
	
	public static Matcher<QueryResult> hasData(String dataName, String value) {
		return hasData(dataName, Matchers.equalTo(value));
	}
	
	public static Matcher<QueryResult> noData(String dataName) {
		return hasData(dataName, Matchers.nullValue(String.class));
	}
	
	@Deprecated()
	public static boolean data(QueryResult res, String dataName, String val) {
		
		if (null == res.findResultFor(dataName)) {
			System.err.println("No result for " + dataName);
			return false;
		}
		
		Object value = res.getValue(dataName);
		if (val == null) {
			return value == null;
		}

		boolean isEqual = val.equals(value);
		if (! isEqual) {
			System.err.println("Expected " + val + ", found " + value);
		}
		return isEqual;
	}

	static final Pattern NUMBER_MATCHER = Pattern.compile("^-?(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?$");
	public static Matcher<String> isNumber() {
		return new BaseMatcher<String>() {

			@Override
			public boolean matches(Object item) {
				return NUMBER_MATCHER.matcher(item.toString()).matches();
			}

			@Override
			public void describeTo(Description description) {
				description.appendText("a string that can be parsed as a number");
			}
		};
	}


}
