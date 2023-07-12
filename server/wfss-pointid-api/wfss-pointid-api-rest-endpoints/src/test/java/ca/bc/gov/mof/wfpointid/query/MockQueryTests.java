package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.dataprovider.mock.MockDataProvider;
import ca.bc.gov.mof.wfpointid.test.util.QueryCheck;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;

public class MockQueryTests {

	static final DataRequestDef[] SIMPLE_REQ = new DataRequestDef[] {
		DataRequestDef.request("MOCK1", "ds1", 500,
				DataItemDef.item("attr1")),
		DataRequestDef.request("MOCK1", "ds2", 500,
			new DataItemDef[] { 
				DataItemDef.item("attr2.1"),
				DataItemDef.item("attr2.2") }),
		DataRequestDef.request("MOCK2", "ds3", 500,
				DataItemDef.item("attr3")) };

	static final DataRequestDef[] REQ_DATASET_ERROR = new DataRequestDef[] {
		DataRequestDef.request("MOCK1", "ds1", 500,
				DataItemDef.item("attr1")),
		DataRequestDef.request("MOCK1", "ERROR", 500,
			new DataItemDef[] { 
				DataItemDef.item("attr2.1"),
				DataItemDef.item("attr2.2") }),
		DataRequestDef.request("MOCK2", "ds3", 500,
				DataItemDef.item("attr3")) };

	@Test
	public void testQuery() throws Exception {

		QueryEngine engine = createEngine();

		QueryResult res = QueryTestUtil.runQuery(engine, 1, 1, true, SIMPLE_REQ);

		assertThat(res, isSuccess());
		assertThat(res,QueryCheck.hasData("attr1", "MOCK1-ds1-attr1"));
		assertThat(res,QueryCheck.hasData("attr2.1", "MOCK1-ds2-attr2.1"));
		assertThat(res,QueryCheck.hasData("attr2.2", "MOCK1-ds2-attr2.2"));
		assertThat(res,QueryCheck.hasData("attr3", "MOCK2-ds3-attr3"));
	}

	@Test
	public void testFeatureNotFound() throws Exception {

		QueryEngine engine = createEngine();

		QueryResult res = QueryTestUtil.runQuery(engine, -1, -1, true, SIMPLE_REQ);

		assertThat(res, isSuccess());
		assertThat(res,QueryCheck.hasData("attr1", DataResult.RESULT_VALUE_EMPTY));
		assertThat(res,QueryCheck.hasData("attr2.1", DataResult.RESULT_VALUE_EMPTY));
		assertThat(res,QueryCheck.hasData("attr2.2", DataResult.RESULT_VALUE_EMPTY));
		assertThat(res,QueryCheck.hasData("attr3", DataResult.RESULT_VALUE_EMPTY));
	}

	@Test
	public void testDatasetError() throws Exception {

		QueryEngine engine = createEngine();

		QueryResult res = QueryTestUtil.runQuery(engine, 1, 1, true, REQ_DATASET_ERROR);

		assertTrue(QueryCheck.isError(res));
		assertThat(res,QueryCheck.hasData("attr1", "MOCK1-ds1-attr1"));
		assertThat(res,QueryCheck.noData("attr2.1"));
		assertThat(res,QueryCheck.noData("attr2.2"));
		assertThat(res,QueryCheck.hasData("attr3", "MOCK2-ds3-attr3"));
	}

	private static QueryEngine createEngine() {
		QueryEngine engine = new QueryEngine();
		engine.addProvider(new MockDataProvider("MOCK1", 4, 1000));
		engine.addProvider(new MockDataProvider("MOCK2", 4, 1000));
		return engine;
	}

}
