package ca.bc.gov.mof.wfpointid.dataprovider;


public interface DataRequestCall {

	DataResult perform(DataRequest req) throws Exception;

}
