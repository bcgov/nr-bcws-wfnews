package ca.bc.gov.mof.wfpointid.dataprovider;

interface DataProvider {

	String getName();
	
	DataRequestCall prepareCall(DataRequest req) throws InterruptedException;

}
