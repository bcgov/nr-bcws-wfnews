package ca.bc.gov.nrs.wfone.web.controller;

import ca.bc.gov.nrs.wfone.resource.BanProhibitionDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;


@Controller
public class BansProhibitionsController {

    private static final Logger logger = LoggerFactory.getLogger(BansProhibitionsController.class);

    @RequestMapping(value="/retrieveBansProhibitions", method=RequestMethod.GET, headers="Accept=*/*")
    @ResponseBody
    protected List<BanProhibitionDetail> bansProhibitions(HttpServletRequest request, HttpServletResponse response) throws Exception {
        logger.debug("<retrieveBansProhibitions");
        List<BanProhibitionDetail> result = new ArrayList<BanProhibitionDetail>();

        try {

            BanProhibitionDetail brd = new BanProhibitionDetail();
            brd.setFireCentre("Coastal");
            brd.setOpenFiresStatus(BanProhibitionDetail.FireStatus.PROHIBITIONS);
            brd.setCampfiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setForestUseStatus(BanProhibitionDetail.FireStatus.UNRESTRICTED);
            result.add(brd);

            brd = new BanProhibitionDetail();
            brd.setFireCentre("Northwest");
            brd.setOpenFiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setCampfiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setForestUseStatus(BanProhibitionDetail.FireStatus.UNRESTRICTED);
            result.add(brd);

            brd = new BanProhibitionDetail();
            brd.setFireCentre("Prince George");
            brd.setOpenFiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setCampfiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setForestUseStatus(BanProhibitionDetail.FireStatus.UNRESTRICTED);
            result.add(brd);

            brd = new BanProhibitionDetail();
            brd.setFireCentre("Kamloops");
            brd.setOpenFiresStatus(BanProhibitionDetail.FireStatus.PROHIBITIONS);
            brd.setCampfiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setForestUseStatus(BanProhibitionDetail.FireStatus.UNRESTRICTED);
            result.add(brd);

            brd = new BanProhibitionDetail();
            brd.setFireCentre("Southeast");
            brd.setOpenFiresStatus(BanProhibitionDetail.FireStatus.PROHIBITIONS);
            brd.setCampfiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setForestUseStatus(BanProhibitionDetail.FireStatus.UNRESTRICTED);
            result.add(brd);

            brd = new BanProhibitionDetail();
            brd.setFireCentre("Cariboo");
            brd.setOpenFiresStatus(BanProhibitionDetail.FireStatus.PROHIBITIONS);
            brd.setCampfiresStatus(BanProhibitionDetail.FireStatus.PERMITTED);
            brd.setForestUseStatus(BanProhibitionDetail.FireStatus.UNRESTRICTED);
            result.add(brd);


            return result;
        } catch(Throwable t) {
            response.sendError(500, t.getMessage());
        }

        logger.debug(">retrieveBansProhibitions");
        return result;
    }

    @RequestMapping(value="/retrieveBansProhibitionsRSS", method=RequestMethod.GET, headers="Accept=text/xml", produces = { MediaType.APPLICATION_XML_VALUE })
    @ResponseBody
    protected String bansProhibitionsRSS(HttpServletRequest request, HttpServletResponse response) throws Exception {
        logger.debug("<retrieveBansProhibitionsRSS");
        String result = null;
        try {
            URL url = new URL("http://bcfireinfo.for.gov.bc.ca/FTP/!Project/WildfireNews/xml/All-OpenFireBan.xml");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.setRequestProperty("Accept", "text/xml");
            con.setRequestProperty("Content-Type", "text/xml");
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer xmlResponse = new StringBuffer();

            while ((inputLine = in.readLine()) != null) {
                xmlResponse.append(inputLine);
            }
            in.close();
            result = xmlResponse.toString();
        } catch(Throwable t) {
            response.sendError(500, t.getMessage());
        }

        logger.debug(">retrieveBansProhibitionsRSS");
        return result;
    }
}
