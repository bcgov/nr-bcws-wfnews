package ca.bc.gov.mof.wfpointid.rest.client.v1;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum StageOfControl {
	OUT_CNTRL,
	HOLDING,
	UNDER_CNTRL,
	OUT
	;
	public static Set<StageOfControl> ACTIVE = Collections.unmodifiableSet(EnumSet.complementOf(EnumSet.of(OUT)));
	public static Set<StageOfControl> ALL = Collections.unmodifiableSet(EnumSet.allOf(StageOfControl.class));
}
