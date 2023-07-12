package ca.bc.gov.mof.wfpointid.test.util;

import static org.hamcrest.Matchers.any;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.ResultMatcher;

public class QueryResponseChecker {
	private static final String REGEX_TIMESTAMP = "\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d";
	
	public static final String NOT_NULL = "***NOT NULL***";
	public static final String STRING = "***STRING***";
	public static final String NUMBER = "***NUMBER***";

	public static void checkQuery(MockMvc mockMvc, String query,
			Object... prop) throws Exception {
		Property[] propNV = Property.create(prop);
		checkQuery(mockMvc, query, propNV, null);
	}
	
	public static void checkQuery(MockMvc mockMvc, String query, 
			Property[] propNV1) throws Exception {
		checkQuery(mockMvc, query, propNV1, null);
	}
	
	public static void checkQuery(MockMvc mockMvc, String query, 
			Property[] propNV1, 
			Property[] propNV2) throws Exception {
				
		ResultActions actions = mockMvc
				.perform(
						get(query).accept(MediaType
										.parseMediaType("application/json;charset=UTF-8")));
		
		String response = actions.andReturn().getResponse().getContentAsString();
		System.out.println( "Query Response JSON: " + response );
		
		try {
			actions
				.andExpect(
						content().contentType("application/json;charset=UTF-8"))
				//.andExpect(jsonPath("$.lat", is( lat )))
				//.andExpect(jsonPath("$.lon", is( lon )))
				
				.andExpect(jsonPath("$.errorCount", is(Integer.valueOf(0))))
				.andExpect(jsonPath("$.errorMsg", 	is("")))
				.andExpect(jsonPath("$.errorDetail", 	is("")))
				
				.andExpect(jsonPath("$.timestamp", any(String.class)))
				.andExpect(jsonPath("$.timestamp",	RegexMatcher.matches(REGEX_TIMESTAMP)))
				.andExpect(status().isOk())
				;
			
			checkPropertyNameValues(actions, propNV1);
			checkPropertyNameValues(actions, propNV2);
		} 
		catch (AssertionError e) {
			// print failing result
			System.out.println( "Query " + query + " : " + e );
			System.out.println( "Query Response JSON: " + response );
			throw e;
		}
	}

	public static void checkError(MockMvc mockMvc, String query, int statusCode) throws Exception {
				
		ResultActions actions = mockMvc
				.perform(
						get(query).accept(MediaType
										.parseMediaType("application/json;charset=UTF-8")));
		
		String response = actions.andReturn().getResponse().getContentAsString();
		System.out.println( "Query Response JSON: " + response );
		
		try {
			actions
				.andExpect(
						content().contentType("application/json;charset=UTF-8"))
				.andExpect(jsonPath("$.errorCount", greaterThan(Integer.valueOf(0))))
				.andExpect(status().is(statusCode))
				;
		} 
		catch (AssertionError e) {
			// print failing result
			System.out.println( "Query " + query + " : " + e );
			System.out.println( "Query Response JSON: " + response );
			throw e;
		}
	}

	private static void checkPropertyNameValues(ResultActions actions, Property[] propNV) throws Exception {

		if (propNV != null) {
			for (int i = 0; i < propNV.length; i++) {
				String name = propNV[i].getName();
				Object value = propNV[i].getValue();
				String path = constructPath(name);
				ResultMatcher matcher;
				if (isString(value, "*")) {
					matcher = jsonPath(path, any(String.class) );
				} else if (isString(value, STRING)) {
					matcher = jsonPath(path, any(String.class) );
				} else if (isString(value, NUMBER)) {
					matcher = jsonPath(path, any(Number.class) );
				}
				else {
					matcher = jsonPath(path, is( value ));
				}

				actions.andExpect(matcher);
			}
		}
	}

	private static boolean isString(Object o, String s) {
		if (o instanceof String) {
			String so = (String) o;
			return so.equalsIgnoreCase(s);
		}
		return false;
	}
	private static String constructPath(String name) {
		if (name.startsWith("$")) return name;
		if (name.startsWith("[")) return "$" + name;
		return "$." + name;
	}

}
