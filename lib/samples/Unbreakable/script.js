function beforeRender(req, res, done) {
    require('request')({
      url:"http://jsonplaceholder.typicode.com/posts",
      json:true
    }, function(err, response, body){
        console.log(JSON.stringify(body))
        req.data = { posts: body };
        done();
    });
}
