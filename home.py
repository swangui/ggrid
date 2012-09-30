import os
import webapp2
from mako.template import Template
from mako.lookup import TemplateLookup

class MainHandler(webapp2.RequestHandler):
  def get(self):
    template_values = {
      'path': 'homepage.tmpl'
    }
    # the template file in our GAE app directory
    path = os.path.join(os.path.dirname(__file__), 'templates/master.tmpl')
    # make a new template instance
    mylookup = TemplateLookup(directories=['/'])
    templ = Template(filename=path, lookup=mylookup)
    # unpack the dictionary to become keyword arguments and render
    self.response.out.write(templ.render(**template_values))

app = webapp2.WSGIApplication([('/', MainHandler)], debug=True)




