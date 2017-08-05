const express = require('express')
const svg2img = require('svg2img')
const mathjax_api = require('mathjax-node')

/*
  Configure mathjax
*/
mathjax_api.config({
	MathJax: {}
})
mathjax_api.start()

/*
 Configure application
*/
const app = express()

app.get('/mathml2image', function(req, res) {
	const mathml = req.query.input
	const output = req.query.output
	const out_width = req.query.width || 320
	const out_height = req.query.height || 150

	console.log('MathML: ', mathml)

	// Convert mathml to svg
	mathjax_api.typeset({
		width: out_width,
		linebreaks: true,
		math: mathml,
		format: "MathML",
		svg: true
	}, function(data) {
		if (data.errors) {
			res.status(409).json({status: 'Error', message: 'Cannot convert the mathml expression'})
		} else {
			const svg_string = data.svg
			const svg_width = parseFloat(data.width)
			const svg_height = parseFloat(data.height)
			const scale = out_width / svg_width

			svg2img(svg_string, {width: svg_width * scale, height: svg_height * scale}, function(error, buffer) {
				res.writeHead(200, {'Content-Type': 'image/png'})
				res.end(buffer, 'binary');
			})
		}
	})
	

})

app.get('/images/mathml', function(req, res) {
	const mathml = req.query.input;
	res.json({data: mathml});
})

// catch 404 error and forward to error handler
app.use(function(req, res, next) {
	var error = new Error('Not Found');
	error.status = 404
	next(error)
})

app.use(function(err, req, res, next) {
	res.status(err.status| 500)
	res.json({
		message: err.message,
		error: {}
	})
})

app.listen(3000, function() {
	console.log('Mathjax service running on port: 3000!')
});

