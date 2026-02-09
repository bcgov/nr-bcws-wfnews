package ca.bc.gov.nrs.wfnews.web.controller;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class YouTubeController {

	private static final Logger logger = LoggerFactory.getLogger(YouTubeController.class);

	private String youtubeResponseCache;
	private Long cacheTimestamp;

	@GetMapping(value = "/youtube-embed", produces = "text/html")
	@ResponseBody
	protected String youtubeEmbed(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String videoId = request.getParameter("v");
		String autoplay = request.getParameter("autoplay");
		String playsinline = request.getParameter("playsinline");

		if (videoId == null || videoId.isEmpty()) {
			return "<html><body style='background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100%; margin: 0; font-family: sans-serif;'>Video ID missing</body></html>";
		}

		String origin = request.getScheme() + "://" + request.getServerName();
		if (request.getServerPort() != 80 && request.getServerPort() != 443) {
			origin += ":" + request.getServerPort();
		}

		StringBuilder html = new StringBuilder();
		html.append("<!doctype html>");
		html.append("<html lang=\"en\">");
		html.append("<head>");
		html.append("<meta charset=\"utf-8\" />");
		html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />");
		html.append("<meta name=\"referrer\" content=\"strict-origin-when-cross-origin\" />");
		html.append("<title>YouTube Embed Relay</title>");
		html.append("<style>");
		html.append("html, body { height: 100%; margin: 0; background: #000; overflow: hidden; }");
		html.append("iframe { width: 100%; height: 100%; border: 0; display: block; }");
		html.append("</style>");
		html.append("</head>");
		html.append("<body>");
		html.append("<iframe id=\"player\" ");
		html.append(
				"allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen\" ");
		html.append("allowfullscreen referrerpolicy=\"strict-origin-when-cross-origin\" ");

		String src = "https://www.youtube-nocookie.com/embed/" + videoId + "?enablejsapi=1&rel=0&modestbranding=1";
		if (autoplay != null)
			src += "&autoplay=" + autoplay;
		if (playsinline != null)
			src += "&playsinline=" + playsinline;
		else
			src += "&playsinline=1";
		src += "&origin=" + origin;

		html.append("src=\"" + src + "\">");
		html.append("</iframe>");
		html.append("</body>");
		html.append("</html>");

		return html.toString();
	}

	@GetMapping(value = "/youtube", headers = "Accept=*/*", produces = { "application/json", "text/xml" })
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
				HttpRequest apiRequest = HttpRequest
						.newBuilder(new URI("https://www.googleapis.com/youtube/v3/search?channelId=" + channelId
								+ "&maxResults=10&part=id,snippet&type=video&order=date&key=" + apiKey))
						.GET().build();
				HttpResponse<String> apiResponse = HttpClient.newBuilder().build()
						.send(apiRequest, BodyHandlers.ofString());
				result = apiResponse.body();
			} catch (Exception e) {
				logger.error("Failed to call Youtube API", e);
				// log and return failure to client
				// the client will show video feeds from latest attached instead
			}

			youtubeResponseCache = result;
			cacheTimestamp = new Date().getTime() + 86400000;
		}

		logger.debug(">youtubeFetch");
		return result;
	}
}
