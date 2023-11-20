package ca.bc.gov.nrs.wfnews.web.controller;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.impl.TokenServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.CheckedToken;

import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
public class YouTubeController {
	
	private static final Logger logger = LoggerFactory.getLogger(YouTubeController.class);

	@GetMapping(value="/youtube", headers="Accept=*/*", produces={"application/json", "text/xml"})
	@ResponseBody
	protected String youtubeFetch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		logger.debug("<youtubeFetch");

		String result = "ERROR";

		try {
			String apiKey = System.getenv("YOUTUBE_API_KEY");
			String apiUrl = "https://content-youtube.googleapis.com/youtube/v3";

			// call youtube API, fetch latest video data
			HttpRequest apiRequest = HttpRequest.newBuilder(new URI(apiUrl + "/videos?part=snippet%2CcontentDetails%2Cstatistics&myRating=like&key=" + apiKey)).GET().build();
			HttpResponse<String> apiResponse = HttpClient.newBuilder().build()
			.send(apiRequest, BodyHandlers.ofString());
			result = apiResponse.body();
		} catch (Exception e) {
			logger.error("Failed to call Youtube API", e);
		}

		logger.debug(">youtubeFetch");
		return result;
	}
}
