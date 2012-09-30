import os
import webapp2
from mako.template import Template
from mako.lookup import TemplateLookup

class MainHandler(webapp2.RequestHandler):
  def get(self):
    template_values = {
      'some_foo': 'foo',
      'some_bar': 'bar'
    }
    # the template file in our GAE app directory
    path = os.path.join(os.path.dirname(__file__), 'templates/foobar.tmpl')
    # make a new template instance
    templ = Template(filename=path)
    # unpack the dictionary to become keyword arguments and render
    self.response.out.write(templ.render(**template_values))

app = webapp2.WSGIApplication([('/foobar', MainHandler)], debug=True)




