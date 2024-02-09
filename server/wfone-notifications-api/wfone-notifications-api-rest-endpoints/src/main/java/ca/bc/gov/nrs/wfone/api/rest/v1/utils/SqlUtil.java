package ca.bc.gov.nrs.wfone.api.rest.v1.utils;

public class SqlUtil {

	private SqlUtil() {}

	public static final String[] sqlKeywords = {"\\bSELECT\\b", "\\bINSERT\\b", "\\bUPDATE\\b", "\\bDELETE\\b", "\\bALTER\\b", "\\bDROP\\b", "\\bCREATE\\b"};

}
