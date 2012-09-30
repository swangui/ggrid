import cgi
import os
import webapp2
from mako.template import Template
from mako.lookup import TemplateLookup

class MainHandler(webapp2.RequestHandler):
  def post(self):
    file = self.request.get('file')
    self.render(file)
  def get(self):
    file = 'templates/homepage.tmpl'
    self.render(file)
  def render(self, file):
    files = [
             'templates/homepage.tmpl', 
             'web/controllers/home.js'
            ]
    file_path = os.path.join(os.path.dirname(__file__), file)
    f = open(file_path, 'r')
    source = f.read()
    template_values = {
      'path': 'editor.tmpl',
      'file': file,
      'files': files,
      'source': source
    }
    
    # the template file in our GAE app directory
    path = os.path.join(os.path.dirname(__file__), 'templates/master.tmpl')
    # make a new template instance
    mylookup = TemplateLookup(directories=['/'])
    templ = Template(filename=path, lookup=mylookup)
    # unpack the dictionary to become keyword arguments and render
    self.response.out.write(templ.render(**template_values))
    
app = webapp2.WSGIApplication([('/editor', MainHandler)], debug=True)




