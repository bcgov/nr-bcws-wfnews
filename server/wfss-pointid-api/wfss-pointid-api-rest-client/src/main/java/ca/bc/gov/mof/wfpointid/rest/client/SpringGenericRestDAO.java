package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.collections4.MultiValuedMap;
import org.apache.http.client.utils.URIBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import ca.bc.gov.mof.wfpointid.rest.resource.HeaderConstants;
import ca.bc.gov.mof.wfpointid.rest.resource.Messages;
import ca.bc.gov.mof.wfpointid.rest.resource.transformers.Transformer;
import ca.bc.gov.mof.wfpointid.rest.resource.transformers.TransformerException;


public class SpringGenericRestDAO<T> extends GenericRestDAO<T> {
	
	private static final Logger logger = LoggerFactory
			.getLogger(SpringGenericRestDAO.class);

	public SpringGenericRestDAO(Class<T> clazz, String clientVersion, String requestIdHeader, String log4jRequestIdMdcKey) {
		super(clazz, clientVersion, requestIdHeader, log4jRequestIdMdcKey);
	}
		
	@Override
	public Response<T> Process(Transformer transformer, String urlString, String method, String eTag, Object resource, MultipartData[] files, Map<String,String> headerParams, MultiValuedMap<String,String> queryParams, RestTemplate restTemplate) throws RestDAOException {
		logger.debug("<Process "+urlString);
		
		Response<T> result = null;
		
		try {
		
			long startTime = System.currentTimeMillis();
			
			boolean isMultipart = (files!=null&&files.length>0);
			logger.info("isMultipart="+isMultipart);
			
			logger.info("Rest call: "+urlString);
			
			if(urlString==null) {
				throw new UnsupportedOperationException("URL cannot be blank");
			}
			
			URIBuilder uriBuilder = new URIBuilder(urlString);
			
			if(queryParams != null) {
				for(Entry<String, String> entry:queryParams.entries()) {
					String key = entry.getKey();

					if (!queryParams.get(key).isEmpty()) {
						for (String val : queryParams.get(key)) {
							uriBuilder.addParameter(key, val);
						}
					} else {
						uriBuilder.addParameter(key, "");
					}
				}
				
				urlString = uriBuilder.build().toString();
				
				logger.debug("urlString="+urlString);
			}
	
			// Save the error handler to be restored later
			ResponseErrorHandler errorHandler = restTemplate.getErrorHandler();
			
			// We don't want to treat these codes as errors
			restTemplate.setErrorHandler(new DefaultResponseErrorHandler() {
				@Override
				protected boolean hasError(HttpStatus statusCode) {
					return false;
				}
			});
			
			try {
			
			URL url = new URL(urlString);
			
			String queryString = url.getQuery();
			logger.debug("query="+queryString);
			
			if(queryString!=null) {
				urlString = urlString.substring(0, (urlString.length()-queryString.length())-1);
				
				logger.debug("urlString="+urlString);
				
				urlString = urlString +"?" + queryString;
				
			} 
			
			logger.debug("urlString="+urlString);
			
			url = new URL(urlString);
	
				HttpHeaders headers = new HttpHeaders();
				
				if (headerParams != null) {
					
					for (String key : headerParams.keySet()) {
						
						String value = headerParams.get(key);
	
						if (value != null) {
							
							if (key.contains("\n") || value.contains("\n")) {
								
								logger.warn("Ignoring header with invalid value: " + key);
							} else {
								
								logger.debug("Adding header "+key+"=" + value);
								headers.set(key, value);
							}
						}
					}
				}
				
				if(eTag!=null) {
				
					headers.set("If-Match", eTag);
					
					logger.debug("If-Match:"+eTag);
				}
				
				headers.set("Accept", transformer.getContentType());
				
				if(getLog4jRequestIdMdcKey()!=null&&getLog4jRequestIdMdcKey().trim().length()>0&&getRequestIdHeader()!=null&&getRequestIdHeader().trim().length()>0) {
					String requestId = MDC.get(getLog4jRequestIdMdcKey());
					if(requestId!=null) {
						logger.debug("requestId=" + requestId);
						headers.set(getRequestIdHeader(), requestId);
					}
				}
				
				if(getClientVersion()!=null&&getClientVersion().trim().length()>0) {
					headers.set(HeaderConstants.VERSION_HEADER, getClientVersion());
				}
				
				HttpEntity<?> requestEntity = null;
				
				if("GET".equals(method) || "DELETE".equals(method)) {
					
					requestEntity = new HttpEntity<byte[]>(headers);
					
				} else if("POST".equals(method) || "PUT".equals(method)) {
					
					String resourceString = transformer.marshall(resource);
	
					byte[] resourceBytes = resourceString.getBytes("UTF-8");
				
					if(isMultipart) {
						headers.setContentType(MediaType.MULTIPART_FORM_DATA);
	
						MultiValueMap<String ,Object> parts = new LinkedMultiValueMap<String ,Object>();
						
						HttpHeaders resourceHeaders = new HttpHeaders();
						resourceHeaders.setContentType(MediaType.parseMediaType(transformer.getContentType()));
						HttpEntity<byte[]> resourceEntity = new HttpEntity<byte[]>(resourceBytes, resourceHeaders);
						parts.add("resource", resourceEntity);
						
						for(int i=0;i<files.length;++i) {
							MultipartData file = files[i];
							
							final String fileName = file.getFileName();
							logger.debug("fileName="+fileName);
							
							String fileContentType = file.getContentType();
							logger.debug("fileContentType="+fileContentType);
							if(fileContentType==null||fileContentType.trim().length()==0) {
								throw new IllegalArgumentException("MultipartData contentType is required.");
							}
							byte[] fileBytes = file.getBytes();
							logger.debug("fileBytes="+fileBytes);
							if(fileBytes==null||fileBytes.length==0) {
								throw new IllegalArgumentException("MultipartData bytes is required.");
							}
							
							HttpHeaders fileHeaders = new HttpHeaders();
							
							String partName = i==0?"file":"file"+1;
							
							fileHeaders.setContentType(MediaType.parseMediaType(fileContentType));
							if(fileName!=null&&fileName.trim().length()>0) {
								fileHeaders.setContentDispositionFormData(partName, fileName);
							}
							HttpEntity<byte[]> fileEntity = new HttpEntity<byte[]>(fileBytes, fileHeaders);
							parts.add(partName, fileEntity);
						}
						
						requestEntity = new HttpEntity<MultiValueMap<String ,Object>>(parts, headers);
					} else {
						headers.setContentType(MediaType.parseMediaType(transformer.getContentType()));
	
						requestEntity = new HttpEntity<byte[]>(resourceBytes, headers);
					}
					
				} 
				
				ResponseEntity<byte[]> responseEntity;
				try {
					responseEntity = restTemplate.exchange(url.toURI(), HttpMethod.valueOf(method), requestEntity, byte[].class);
					HttpStatus statusCode = responseEntity.getStatusCode();
					logger.info("Rest call response: "+statusCode.value()+":"+statusCode.getReasonPhrase());
					
					headers = responseEntity.getHeaders();
					if(statusCode.value() >= 500) {
						result = serverError(statusCode, responseEntity.getBody(), headers, transformer);
					} else if(statusCode.value() >= 400) {
						result = clientError(statusCode, responseEntity.getBody(), headers, transformer);
					} else if(statusCode.value() >= 300) {
						result = redirect(statusCode, responseEntity.getBody(), headers, transformer);
					} else {
						result = ok(statusCode, responseEntity.getBody(), headers, transformer);
					}
				} catch (HttpServerErrorException ex) {
					result = serverError(ex.getStatusCode(), ex.getResponseBodyAsByteArray(), ex.getResponseHeaders(), transformer);
				} catch (HttpClientErrorException ex) {
					result = clientError(ex.getStatusCode(), ex.getResponseBodyAsByteArray(), ex.getResponseHeaders(), transformer);
				}
				
				eTag = headers.getETag();
				logger.debug("eTag="+eTag);
				
				String responseVersion = headers.getFirst(HeaderConstants.VERSION_HEADER);
				logger.debug("responseVersion="+responseVersion);
				if(getClientVersion()!=null&&getClientVersion().trim().length()>0) {
					if(!getClientVersion().equals(responseVersion)) {
						String message = "The reponse version '"+responseVersion+"' does not match the client version '"+getClientVersion()+"'.";
						logger.warn(message);
					}
				}
				
				Long cacheExpiresMillis = Long.valueOf(headers.getExpires());
				logger.debug("cacheExpiresMillis="+cacheExpiresMillis);
	
				
			} catch (MalformedURLException e) {
				throw new RestDAOException(e);		
			} catch (UnsupportedEncodingException e) {
				throw new RestDAOException(e);		
			} catch (URISyntaxException e) {
				throw new RestDAOException(e);		
			} catch (TransformerException e) {
				throw new RestDAOException(e);		
			} finally {
				// Restore the saved error handler
				restTemplate.setErrorHandler(errorHandler);
			}
	
			long duration = System.currentTimeMillis() - startTime;
			
			double seconds = (double)duration / (double)1000;
			
			logger.info("Rest call completed: "+seconds+" seconds");
		
		} catch (URISyntaxException e) {
			
			throw new RestDAOException(e);
		}
		
		logger.debug(">Process");
		return result;
	}
	
	private Response<T> ok(HttpStatus statusCode, byte[] body, HttpHeaders headers, Transformer transformer) throws RestDAOException, TransformerException {
		String contentType = null;
		if(headers.getContentType()!=null) {
			contentType = headers.getContentType().toString();
		}
		
		if(statusCode.value() == 205) {
			return new Response<T>(statusCode.value(), null);
		} else if(statusCode.value() == 204) {
			return new Response<T>(statusCode.value(), null);
		} else if(statusCode.value() == 203 || statusCode.value() == 202|| statusCode.value() == 201 || statusCode.value() == 200) {
			
			if(body==null) {
				return new Response<T>(statusCode.value(), null);
			} else {
				
				String contentDisposition = headers.getFirst("Content-Disposition");
				logger.debug("contentDisposition="+contentDisposition);
				Map<String, String> parameters = parseHeaderDirectives(contentDisposition);
				String filename = parameters.get("filename");
				logger.debug("filename="+filename);
				Object responseResource = transformer.unmarshall(body, getClazz());
				
				T genericResource = cast(responseResource);
				
				return new Response<T>(statusCode.value(), genericResource, contentType);
			}
			
		} else {
			throw new RestDAOException("Unsupported HTTP Response: "+statusCode.value()+" "+statusCode.getReasonPhrase());
		}
	}
	private Response<T> redirect(HttpStatus statusCode, byte[] body, HttpHeaders headers, Transformer transformer) throws RedirectException {
		if(statusCode.value() == 307) {
			
			String location = headers.getFirst("Location");
			throw new RedirectException(statusCode.value(), statusCode.getReasonPhrase(), location);
			
		} else if(statusCode.value() == 305) {
			
			String location = headers.getFirst("Location");
			throw new RedirectException(statusCode.value(), statusCode.getReasonPhrase(), location);
		
		} else if(statusCode.value() == 304) {
			
			return new Response<T>(statusCode.value(), null);
			
		} else if(statusCode.value() == 303) {
			
			String location = headers.getFirst("Location");
			throw new RedirectException(statusCode.value(), statusCode.getReasonPhrase(), location);
			
		} else if(statusCode.value() == 302) {	
			
			String location = headers.getFirst("Location");
			throw new RedirectException(statusCode.value(), statusCode.getReasonPhrase(), location);
			
		} else if(statusCode.value() == 301) {	
			
			String location = headers.getFirst("Location");
			throw new RedirectException(statusCode.value(), statusCode.getReasonPhrase(), location);
			
		} else {
			throw new IllegalArgumentException(statusCode+" is not a redirect");
		}
	}

	private Response<T> clientError(HttpStatus statusCode, byte[] body, HttpHeaders headers, Transformer transformer) throws ClientErrorException {
		if(statusCode.value() == 417) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());			
		} else if(statusCode.value() == 416) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());		
		} else if(statusCode.value() == 415) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());		
		} else if(statusCode.value() == 414) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());		
		} else if(statusCode.value() == 413) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());
		} else if(statusCode.value() == 412) {
			throw new PreconditionFailedException(statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 411) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 410) {
			throw new GoneException(statusCode.getReasonPhrase());
		} else if(statusCode.value() == 409) {
			throw new ConflictException(statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 408) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 407) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 406) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 405) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());				
		} else if(statusCode.value() == 404) {
			return new Response<T>(statusCode.value(), null);
		} else if(statusCode.value() == 403) {
			throw new ForbiddenException(statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 402) {
			throw new ClientErrorException(statusCode.value(), statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 401) {
			throw new UnauthorizedException(statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 400) {
			
			Messages messages = null;
			if(body!=null) {
				try {
					messages = (Messages) transformer.unmarshall(body, Messages.class);
				} catch(ClassCastException e) {
					logger.warn(e.getMessage());
					String responseString = new String(body);
					logger.debug("responseString=\n"+responseString);
					messages = new Messages(responseString);
				} catch(TransformerException e) {
					logger.warn(e.getMessage());
					String responseString = new String(body);
					logger.debug("responseString=\n"+responseString);
					messages = new Messages(responseString);
				}
			}
			
			throw new BadRequestException(messages);
			
		} else {
			throw new IllegalArgumentException(statusCode+" is not a client error");
		}
	}

	private Response<T> serverError(HttpStatus statusCode, byte[] body, HttpHeaders headers, Transformer transformer) throws ServerErrorException {
		if(statusCode.value() > 500) {
			throw new ServerErrorException(statusCode.value(), statusCode.getReasonPhrase());	
		} else if(statusCode.value() == 500) {
			logger.warn(new String(body));
			Messages messages = null;
			if(new String(body)!=null) {
				try {
					messages = (Messages) transformer.unmarshall(new String(body), Messages.class);
				} catch(ClassCastException e) {
					logger.warn(e.getMessage());
					String responseString = new String(body);
					logger.debug("responseString=\n"+responseString);
					messages = new Messages(responseString);
				} catch(TransformerException e) {
					logger.warn(e.getMessage());
					String responseString = new String(body);
					logger.debug("responseString=\n"+responseString);
					messages = new Messages(responseString);
				}
			}
			
			throw new ServerErrorException(statusCode.value(), messages);	

		} else {
			throw new IllegalArgumentException(statusCode+" is not a server error");
		}
	}
	
}
