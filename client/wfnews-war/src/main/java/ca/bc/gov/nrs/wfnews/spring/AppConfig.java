package ca.bc.gov.nrs.wfnews.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.springframework.web.servlet.view.JstlView;
import org.springframework.web.servlet.view.UrlBasedViewResolver;

@Configuration
@EnableWebMvc
@ComponentScan("ca.bc.gov.nrs.wfnews.web.controller")
@Import({
  PropertiesSpringConfig.class
})
public class AppConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(AppConfig.class);

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
       // registry.addViewController("/").setViewName("index");
    }
    
    @Bean
    public UrlBasedViewResolver viewResolver() {
        logger.info("<viewResolver");

        UrlBasedViewResolver resolver = new UrlBasedViewResolver();
        resolver.setPrefix("/");
        resolver.setSuffix(".jsp");
        resolver.setViewClass(JstlView.class);

        logger.info(">viewResolver");
        return resolver;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
        .allowCredentials(true)
        .allowedOriginPatterns("*")
        .allowedHeaders("*")
        .allowedMethods("GET", "POST", "OPTIONS");
    }

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
      configurer.enable();
    }

    @Bean
    public ViewResolver internalResourceViewResolver() {
      InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
      
      viewResolver.setViewClass(JstlView.class);
      viewResolver.setPrefix("/");
      viewResolver.setSuffix(".jsp");
      
      return viewResolver;
    }
}