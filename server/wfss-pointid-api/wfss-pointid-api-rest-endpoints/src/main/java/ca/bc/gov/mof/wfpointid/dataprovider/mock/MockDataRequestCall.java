package ca.bc.gov.mof.wfpointid.dataprovider.mock;

import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;

class MockDataRequestCall implements DataRequestCall {

	public static final String ERROR = "ERROR";
	
	private MockDataProvider dataProvider;

	MockDataRequestCall(MockDataProvider dataProvider) {
		this.dataProvider = dataProvider;
	}
	
	@Override
	public DataResult perform(DataRequest req) throws Exception {
		DataRequestDef dataQueryDef = req.getDataRequestDef();
		
		DataResult res = computeValues(req, dataQueryDef);
		
		Thread.sleep(MockDataProvider.MOCK_COMPUTE_TIME);
		
		return res;
	}

	private DataResult computeValues(DataRequest req,
			DataRequestDef dataQueryDef) {
		DataResult res;
		if (dataQueryDef.getDatasetName().equalsIgnoreCase(ERROR)) {
			res = DataResult.createError(dataQueryDef, ERROR);
			return res;
		}
		
		Object[] values = new Object[dataQueryDef.getItems().length];
		for (int i = 0; i < values.length; i++) {
			// default is data missing value
			String val = DataResult.RESULT_VALUE_EMPTY;
			if (isValidPt(req)) {
				val = dataProvider.getName() 
						+ "-" + dataQueryDef.getDatasetName()
						+ "-" + dataQueryDef.getItems()[i].getAttributeName();
			}
			
			values[i ] = val;
			
		}
		res = DataResult.createValue(dataQueryDef, values);
		return res;
	}

	private static boolean isValidPt(DataRequest req) {
		return req.getQueryPt().getLon() > 0 || req.getQueryPt().getLat() > 0;
	}

}
