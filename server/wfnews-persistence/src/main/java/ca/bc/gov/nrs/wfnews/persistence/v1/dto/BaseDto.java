package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.io.Serializable;
import java.util.Calendar;
import java.util.Date;

import org.slf4j.Logger;

import com.vividsolutions.jts.geom.Geometry;

public abstract class BaseDto<T> implements Serializable {

	private static final long serialVersionUID = 1L;

	private T _dirtyCopy;
	
	public final boolean isDirty() {
		boolean result = !this.equalsAll(_dirtyCopy);
		return result;
	}
	
	public final void resetDirty() {
		this.getLogger().debug("<resetDirty");
		
		_dirtyCopy = copy();
		
		this.getLogger().debug(">resetDirty");
	}
	
	public abstract T copy();
	
	public abstract Logger getLogger();
	
	public abstract boolean equalsBK(T other);
	
	public abstract boolean equalsAll(T other);
	
	protected boolean equals(String propertyName, String v1, String v2) {
		boolean result = false;
		
		v1 = v1==null?"":v1;
		v2 = v2==null?"":v2;
		
		result = v1.equals(v2);
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Boolean v1, Boolean v2) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {
			
			result = v1.equals(v2);
		} else {
			
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Integer v1, Integer v2) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {
			
			result = v1.equals(v2);
		} else {
			
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Long v1, Long v2) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {
			
			result = v1.equals(v2);
		} else {
			
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Geometry v1, Geometry v2) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {

			Geometry n1 = v1.norm();
			Geometry n2 = v2.norm();

	        double tolerance = 0.0000001;
			
			result = n1.equalsExact(n2, tolerance);
		} else {
			
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Double v1, Double v2, int precision) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {
			double diff = v1.doubleValue()-v2.doubleValue();
			double abs = Math.abs(diff);
            double multiplier = (int) Math.pow(10, precision);
			result = (abs*multiplier)<1.0;
		} else {
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Date v1, Date v2, int percision) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {
			
			result = (v1.getTime()/percision)==(v2.getTime()/percision);
		} else {
			
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
	
	protected boolean equals(String propertyName, Date v1, Date v2) {
		boolean result = false;
		
		if(v1==null&&v2==null) {
			
			result = true;
		} else if(v1!=null&&v2!=null) {
			
			Calendar c1 = Calendar.getInstance();
			c1.setTime(v1);
			
			Calendar c2 = Calendar.getInstance();
			c2.setTime(v2);
			
			result = (c1.get(Calendar.YEAR)==c2.get(Calendar.YEAR))&&(c1.get(Calendar.MONTH)==c2.get(Calendar.MONTH))&&(c1.get(Calendar.DATE)==c2.get(Calendar.DATE));
		} else {
			
			result = false;
		}
		
		if(!result&&propertyName!=null) {
			getLogger().info(propertyName+" is dirty. old:"+v2+" new:"+v1);
		}
		
		return result;
	}
}
