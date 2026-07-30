package sk.gemerbarbier.web.rest.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

  @GetMapping(value = {
      "/",
      "/admin-dashboard",
      "/admin-dashboard/**"
  })
  public String forward(HttpServletResponse response) {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Pragma", "no-cache");
    return "forward:/index.html";
  }

  @GetMapping("/reservation")
  public String redirectReservation() {
    return "redirect:/";
  }
}
