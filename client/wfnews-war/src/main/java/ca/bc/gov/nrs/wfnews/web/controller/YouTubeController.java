package ca.bc.gov.nrs.wfnews.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
public class YouTubeController {
	
	private static final Logger logger = LoggerFactory.getLogger(YouTubeController.class);

	private String youtubeResponseCache;
	private Long cacheTimestamp;

	@GetMapping(value="/youtube", headers="Accept=*/*", produces={"application/json", "text/xml"})
	@ResponseBody
	protected String youtubeFetch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		logger.debug("<youtubeFetch");

		String result = "ERROR";

		if (youtubeResponseCache != null && youtubeResponseCache.length() > 0 && cacheTimestamp >= new Date().getTime()) {
			result = youtubeResponseCache;
		} else {
			try {
				String apiKey = System.getenv("YOUTUBE_API_KEY");
				String channelId = System.getenv("YOUTUBE_CHANNEL_ID");
				
				// call youtube API, fetch latest video data
				HttpRequest apiRequest = HttpRequest.newBuilder(new URI("https://www.googleapis.com/youtube/v3/search?channelId=" + channelId + "&maxResults=10&part=id,snippet&type=video&order=date&key=" + apiKey)).GET().build();
				HttpResponse<String> apiResponse = HttpClient.newBuilder().build()
				.send(apiRequest, BodyHandlers.ofString());
				result = apiResponse.body();
			} catch (Exception e) {
				logger.error("Failed to call Youtube API", e);
				// log and return failure to client
				// the client will show video feeds from latest attached instead
			}

			youtubeResponseCache = result;
			if (cacheTimestamp == null) {
				cacheTimestamp = new Date().getTime() + 86400000;
			}
		}

		logger.debug(">youtubeFetch");
		return result;
	}
}
