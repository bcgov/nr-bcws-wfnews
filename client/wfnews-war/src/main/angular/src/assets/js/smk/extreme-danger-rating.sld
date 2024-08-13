<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld"
	xmlns:sld="http://www.opengis.net/sld"
	xmlns:ogc="http://www.opengis.net/ogc"
	xmlns:gml="http://www.opengis.net/gml" version="1.0.0">
	<NamedLayer>
		<Name>pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP</Name>
		<UserStyle>
			<Name>style</Name>
			<IsDefault>1</IsDefault>
			<FeatureTypeStyle>
				<Rule>
					<Name>Very Low (0-1.5)</Name>
					<Title>Very Low</Title>
					<Filter>
						<PropertyIsLessThan>
							<PropertyName>DANGER_RATING</PropertyName>
							<Literal>1.500000</Literal>
						</PropertyIsLessThan>
					</Filter>
					<PolygonSymbolizer>
						<Stroke>
							<CssParameter name="stroke">#415FC1</CssParameter>
						</Stroke>
						<Fill>
							<CssParameter name="fill">#647efc</CssParameter>
							<CssParameter name="fill-opacity">0.8</CssParameter>
						</Fill>
					</PolygonSymbolizer>
				</Rule>
				<Rule>
					<Name>Low (1.5-2.5)</Name>
					<Title>Low</Title>
					<Filter>
						<And>
							<PropertyIsGreaterThanOrEqualTo>
								<PropertyName>DANGER_RATING</PropertyName>
								<Literal>1.500000</Literal>
							</PropertyIsGreaterThanOrEqualTo>
							<PropertyIsLessThan>
								<PropertyName>DANGER_RATING</PropertyName>
								<Literal>2.500000</Literal>
							</PropertyIsLessThan>
						</And>
					</Filter>
					<PolygonSymbolizer>
						<Stroke>
							<CssParameter name="stroke">#6b8749</CssParameter>
						</Stroke>
						<Fill>
							<CssParameter name="fill">#a6c96d</CssParameter>
							<CssParameter name="fill-opacity">0.8</CssParameter>
						</Fill>
					</PolygonSymbolizer>
				</Rule>
				<Rule>
					<Name>Moderate (2.5-3.5)</Name>
					<Title>Moderate</Title>
					<Filter>
						<And>
							<PropertyIsGreaterThanOrEqualTo>
								<PropertyName>DANGER_RATING</PropertyName>
								<Literal>2.500000</Literal>
							</PropertyIsGreaterThanOrEqualTo>
							<PropertyIsLessThan>
								<PropertyName>DANGER_RATING</PropertyName>
								<Literal>3.500000</Literal>
							</PropertyIsLessThan>
						</And>
					</Filter>
					<PolygonSymbolizer>
						<Stroke>
							<CssParameter name="stroke">#d1c708</CssParameter>
						</Stroke>
						<Fill>
							<CssParameter name="fill">#f4fc03</CssParameter>
							<CssParameter name="fill-opacity">0.5</CssParameter>
						</Fill>
					</PolygonSymbolizer>
				</Rule>
				<Rule>
					<Name>High (3.5-4.5)</Name>
					<Title>High</Title>
					<Filter>
						<And>
							<PropertyIsGreaterThanOrEqualTo>
								<PropertyName>DANGER_RATING</PropertyName>
								<Literal>3.500000</Literal>
							</PropertyIsGreaterThanOrEqualTo>
							<PropertyIsLessThan>
								<PropertyName>DANGER_RATING</PropertyName>
								<Literal>4.500000</Literal>
							</PropertyIsLessThan>
						</And>
					</Filter>
					<PolygonSymbolizer>
						<Stroke>
							<CssParameter name="stroke">#995c00</CssParameter>
						</Stroke>
						<Fill>
							<CssParameter name="fill">#ff9900</CssParameter>
							<CssParameter name="fill-opacity">0.8</CssParameter>
						</Fill>
					</PolygonSymbolizer>
				</Rule>
				<Rule>
					<Name>Extreme (4.5)</Name>
					<Title>Extreme</Title>
					<Filter>
						<PropertyIsGreaterThanOrEqualTo>
							<PropertyName>DANGER_RATING</PropertyName>
							<Literal>4.500000</Literal>
						</PropertyIsGreaterThanOrEqualTo>
					</Filter>
					<PolygonSymbolizer>
						<Fill>
							<CssParameter name="fill">#FF9080</CssParameter>
						</Fill>
						<Stroke>
							<CssParameter name="stroke">#f55a42</CssParameter>
							<CssParameter name="stroke-opacity">1</CssParameter>
							<CssParameter name="stroke-width">10</CssParameter>
						</Stroke>
					</PolygonSymbolizer>
				</Rule>
			</FeatureTypeStyle>
		</UserStyle>
	</NamedLayer>
</StyledLayerDescriptor>
