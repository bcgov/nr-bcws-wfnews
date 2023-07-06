package ca.bc.gov.mof.wfpointid.dataprovider.geoserver;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class GeoserverResponseTests {
	
	static String WMS_GETFEATUREINFO_RESPONSE = "<?xml version='1.0' encoding='UTF-8'?><wfs:FeatureCollection xmlns='http://www.opengis.net/wfs' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:wf='http:/nrs.gov.bc.ca/wildfire' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs https://wf1geot.nrs.gov.bc.ca:443/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd http:/nrs.gov.bc.ca/wildfire https://wf1geot.nrs.gov.bc.ca:443/geoserver/wfs?service=WFS&amp;version=1.0.0&amp;request=DescribeFeatureType&amp;typeName=wf%3AFM_FUEL_TYPE_BC'><gml:boundedBy><gml:Box srsName='http://www.opengis.net/gml/srs/epsg.xml#3005'><gml:coordinates xmlns:gml='http://www.opengis.net/gml' decimal='.' cs=',' ts=' '>1192523.295,380662.501 1200087.5,390754.101</gml:coordinates></gml:Box></gml:boundedBy><gml:featureMember><wf:FM_FUEL_TYPE_BC fid='FM_FUEL_TYPE_BC.737892'><wf:Fuel_Type_CD>N</wf:Fuel_Type_CD></wf:FM_FUEL_TYPE_BC></gml:featureMember></wfs:FeatureCollection>";

	@Test
	public void testWMSGetFeatureInfoProperty() {
		GeoserverResponse res = new GeoserverResponse(WMS_GETFEATUREINFO_RESPONSE);
		assertEquals(res.extractGMLPropertyValue("Fuel_Type_CD"), "N");
	}
	
	static String WFS_GETFEATURE_RESPONSE = "<?xml version='1.0' encoding='UTF-8'?><wfs:FeatureCollection xmlns:xs='http://www.w3.org/2001/XMLSchema' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:ows='http://www.opengis.net/ows' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:wf='http:/nrs.gov.bc.ca/wildfire' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' numberOfFeatures='1' timeStamp='2017-06-07T17:25:47.949Z' xsi:schemaLocation='http://www.opengis.net/wfs https://wf1geot.nrs.gov.bc.ca:443/geoserver/schemas/wfs/1.1.0/wfs.xsd http:/nrs.gov.bc.ca/wildfire https://wf1geot.nrs.gov.bc.ca:443/geoserver/wfs?service=WFS&amp;version=1.1.0&amp;request=DescribeFeatureType&amp;typeName=wf%3ABNDY_FIRE_DEPARTMENTS'><gml:boundedBy><gml:Envelope srsDimension='2' srsName='http://www.opengis.net/gml/srs/epsg.xml#3005'><gml:lowerCorner>1157288.847 438070.43</gml:lowerCorner><gml:upperCorner>1164422.95 446753.079</gml:upperCorner></gml:Envelope></gml:boundedBy><gml:featureMembers><wf:BNDY_FIRE_DEPARTMENTS gml:id='BNDY_FIRE_DEPARTMENTS.6617'><gml:boundedBy><gml:Envelope srsName='urn:x-ogc:def:crs:EPSG:3005' srsDimension='2'><gml:lowerCorner>1157288.847 438070.43</gml:lowerCorner><gml:upperCorner>1164422.95 446753.079</gml:upperCorner></gml:Envelope></gml:boundedBy><wf:FIRE_DPT>Ladysmith FD</wf:FIRE_DPT></wf:BNDY_FIRE_DEPARTMENTS></gml:featureMembers></wfs:FeatureCollection>";

	@Test
	public void testWFSGetFeatureProperty() {
		GeoserverResponse res = new GeoserverResponse(WFS_GETFEATURE_RESPONSE);
		assertEquals(res.extractGMLPropertyValue("FIRE_DPT"), "Ladysmith FD");
	}
	
	static String OWS_EXCEPTION = "<ows:ExceptionReport xmlns:xs='http://www.w3.org/2001/XMLSchema' xmlns:ows='http://www.opengis.net/ows' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/ows https://wf1geot.nrs.gov.bc.ca:443/geoserver/schemas/ows/1.0.0/owsExceptionReport.xsd'>  <ows:Exception exceptionCode='InvalidParameterValue' locator='typeName'>    <ows:ExceptionText>Feature type :XXX unknown</ows:ExceptionText>  </ows:Exception></ows:ExceptionReport>";

	@Test
	public void testOWSException() {
		GeoserverResponse res = new GeoserverResponse(OWS_EXCEPTION);
		assertEquals(res.exceptionMsg(), "Feature type :XXX unknown");
	}
	
	static String SERVICE_EXCEPTION = "<?xml version='1.0' encoding='UTF-8' standalone='no'?><!DOCTYPE ServiceExceptionReport SYSTEM 'https://wf1geot.nrs.gov.bc.ca:443/geoserver/schemas/wms/1.1.1/WMS_exception_1_1_1.dtd'> <ServiceExceptionReport version='1.1.1' >   <ServiceException code='LayerNotDefined' locator='layers'>      Could not find layer XXX_BAD_LAYER</ServiceException></ServiceExceptionReport>";

	@Test
	public void testServiceException() {
		GeoserverResponse res = new GeoserverResponse(SERVICE_EXCEPTION);
		assertEquals(res.exceptionMsg(), "Could not find layer XXX_BAD_LAYER");
	}
	

}
