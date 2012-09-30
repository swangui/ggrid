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
    $.ajax({
      url: 'http://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent(yql)+'&format=json',
      dataType: 'json',
      success: function(data){
        var dataSource = data.query.results.place
        $('#sample-homepage').ggrid({
          dataSource: dataSource,
          fieldSortability: ['name'],
          fieldFilterability: [],
          fieldOrder: ['name', 'woeid'],
          fieldInvisible: ['placeTypeName']
        })
      }
    })
  }
}