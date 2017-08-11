const express = require('express')
const svg2img = require('svg2img')
const mathjax_api = require('mathjax-node')

const DEFAULT_WIDTH = 320

/*
  Configure mathjax
*/
mathjax_api.config({
	MathJax: {
		SVG: {linebreaks: {automatic: true}},
                    showMathMenu: false,
                    messageStyle: 'none',
                    displayAlign: 'left',
                    tex2jax: {preview: 'none'},
                    mml2jax: {preview: 'none'}
	}
})
mathjax_api.start()

/*
 Configure application
*/
const app = express()

app.get('/mathml2svg', function(req, res) {
        const mathml = req.query.input
        const output = req.query.ouput
        mathjax_api.typeset({
                math: mathml,
                format: "MathML",
		svg: true
        }, function(data) {
                if (data.errors) {
                        res.status(409).json({status: 'Error', message: 'Cannot convert the mathml expression'})
                } else {
                        const svg_content = `<html><body><svg>${data.svg}</svg></body></html>`
//                      res.writeHead(200, {'Content-Type': 'text/html'})
                        res.send(svg_content)
                }
        })
})

app.get('/mathml2html', function(req, res) {
	const mathml = req.query.input
	const output = req.query.ouput
	mathjax_api.typeset({
		math: mathml,
		format: "MathML",
		html: true,
		css: true
	}, function(data) {
		if (data.errors) {
			res.status(409).json({status: 'Error', message: 'Cannot convert the mathml expression'})
		} else {
			const html_content = `<html><head><style>${data.css}</style></head><body>${data.html}</body></html>`
//			res.writeHead(200, {'Content-Type': 'text/html'})
			res.send(html_content)
		}
	})
})

app.get('/mathml2image', function(req, res) {
	const mathml = req.query.input
	const output = req.query.output
	const out_width = req.query.width || DEFAULT_WIDTH

	console.log('MathML: ', mathml)

	// Convert mathml to svg
	mathjax_api.typeset({
		width: out_width,
		linebreaks: true,
		math: mathml,
		format: "MathML",
		html: true,
		css: true,
		svg: true
	}, function(data) {
		if (data.errors) {
			res.status(409).json({status: 'Error', message: 'Cannot convert the mathml expression'})
		} else {
			const svg_string = `<svg>${data.svg}</svg>`
			const svg_width = parseFloat(data.width)
			const svg_height = parseFloat(data.height)
			const scale = out_width / svg_width	// Calculate the scale for output image

			console.log('svg: ', svg_string);
			console.log('html: ', data.html);
			console.log('css: ', data.css);

			/*
			 Convert svg string to png image
			*/
			svg2img(svg_string, {width: svg_width * scale, height: svg_height * scale}, function(error, buffer) {
				res.writeHead(200, {'Content-Type': 'image/png'})
				res.end(buffer, 'binary');
			})
		}
	})
	

})

app.get('/images/mathml', function(req, res) {
	const mathml = req.query.input
        const output = req.query.output
        const out_width = req.query.width || DEFAULT_WIDTH

        console.log('MathML: ', mathml)

        // Convert mathml to svg
        mathjax_api.typeset({
                ex: 1,
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
			res.json({mathml: mathml, svg: svg_string})
                }
        })
})

// catch 404 error and forward to error handler
app.use(function(req, res, next) {
	var error = new Error('Not Found');
	error.status = 404
	next(error)
})

app.use(function(err, req, res, next) {
	res.status(err.status || 500)
	res.json({
		message: err.message,
		error: {}
	})
})

// Start the application
app.listen(3000, function() {
	console.log('Mathjax service running on port: 3000!')
});

