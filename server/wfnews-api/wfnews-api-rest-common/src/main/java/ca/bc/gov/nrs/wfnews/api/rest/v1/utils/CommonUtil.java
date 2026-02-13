package ca.bc.gov.nrs.wfnews.api.rest.v1.utils;

import java.time.Year;
import java.util.Calendar;

/**
 * Common utility methods for the WFNEWS API.
 */
public class CommonUtil {

  /**
   * Get the current fire year based on the fire season (April to March).
   * If the current month is before April (0-2), return the previous year.
   * Otherwise, return the current year.
   * 
   * @return the current fire year
   */
  public static int getCurrentFireYear() {
    int currentYear = Year.now().getValue();
    if (Calendar.getInstance().get(Calendar.MONTH) < 3) {
      currentYear -= 1;
    }
    return currentYear;
  }
}
