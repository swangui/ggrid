home = {
  init: function(){
    
  },
  homepage: function(){
    var sample = [];
    for(var i = 0; i<5000; i++){
      sample.push({
        A:'A'+i%2,
        B:'B'+i%2,
        C:'C'+i,
        D:'D'+i,
        E:'E'+i
      })
    }

    var yql = 'select * from geo.countries';
    var yql_url = 'http://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent(yql)+'&format=json';
    var google_ft = 'http://ft2json.appspot.com/q?sql=SELECT%20*%20FROM%201m9d3Nu3M5hg1kXV5Z53HUjb7YX73MqILibHM3xg&limit=10000';
    $.ajax({
      url: google_ft,
      dataType: 'json',
      success: function(data){
        //var dataSource = data.query.results.place; //yql
        var dataSource = data.data;
        $('#sample-homepage').ggrid({
          dataSource: dataSource,
          fieldSortability: ['Country', 'CITY'],
          fieldFilterability: [],
          fieldOrder: ['Country', 'CITY'],
          fieldInvisible: ['placeTypeName'],
          style:{
            height: 400
          }
        })
      }
    })
  }
}