package ca.bc.gov.mof.wfpointid.dataprovider;

public class DataItemDef {

	public static DataItemDef item(String attributeName, String alias) {
		return new DataItemDef( attributeName, alias);
	}
	
	public static DataItemDef item(String name) {
		return new DataItemDef(name, name);
	}
	
	protected String attributeName;
	protected String name;

	public DataItemDef(
			String attributeName,
			String alias
			) {
		this.name = alias;
		this.attributeName = attributeName;
	}

	/**
	 * The name to be used in the result
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 * The name to look for in the source
	 * @return
	 */
	public String getAttributeName() {
		return attributeName;
	}

	public String toString() {
		return name	+ "(" +  attributeName + ")";
	}


}
