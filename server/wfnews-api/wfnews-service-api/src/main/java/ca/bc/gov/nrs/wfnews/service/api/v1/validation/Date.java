package ca.bc.gov.nrs.wfnews.service.api.v1.validation;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

@Target({ METHOD })
@Retention(RUNTIME)
@Constraint(validatedBy = DateValidator.class)
@Documented
public @interface Date {
	String message() default "{javax.validation.constraints.Date.message}";
	
	String mask() default "YYYY-MM-DD";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
