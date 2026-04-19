package sk.gemerbarbier.web.rest.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

  @RequestMapping(value = "/")
  public String root() {
    return "forward:/index.html";
  }

  @RequestMapping(value = "/{path:[^.]*}")
  public String redirect() {
    return "forward:/index.html";
  }

  @RequestMapping(value = "/{path:^(?!api$).*$}/**")
  public String redirectNested() {
    return "forward:/index.html";
  }
}
