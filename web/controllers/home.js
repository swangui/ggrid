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
    //sorting without filter will cause error
    $('#sample-homepage').ggrid({
      dataSource: sample,
      fieldSortability: ['A','B','C','D','E'],
      fieldFilterability: []
    })
  }
}