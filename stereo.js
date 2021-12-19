/*
	This script provides the functionality of the stereogram viewer. It provides the functions which process button inputs and
	the functions which format the stereoscopic pair into the chosen format, such as SBS or anaglyph.
*/

// Images for the left eye and right eye.
var left;
var right;

// Canvas
var canvas;

// Drawing context
var ctx;

/* Anaglyph rgb functions */
function red_cyan(r1, g1, b1, r2, g2, b2) {
	return [r1, g2, b2];
}

function red_blue(r1, g1, b1, r2, g2, b2) {
	return [r1, (g1 + g2)/2, b2];
}

// Used by set_anaglyph_type()
var anaglyphs = [red_cyan, red_blue];

/* Variables representing the output type */

// Scaling factor for images
var zoom = 1;

// If true, images are swapped prior to all other processing.
var do_cross = true;

// If true, produces an anaglyph. If false, produces an SBS or O/U
var make_anaglyph = false;

// If make_anaglyph is true, this defines the function for combining two RGB triplets from each image into
// a single rgb triplet for the final anaglyph.
var merge_rgb = red_cyan;

// If make_anaglyph is false:
// If this is true, makes an SBS, if this is false, makes an O/U
var make_SBS = true;

// If make_anaglyph is false and make_SBS is true:
// If this is true, centers the images on their respective halves of the window for VR viewing.
// If false, centers the images together in the middle of the window for freeviewing.
var for_VR = false;

// If make_anaglyph is false and (make_SBS is false or (make_SBS is true and for_VR is true)):
// If this is true, squeezes images so that the final output (the combined SBS or O/U) has the same aspect ratio
// as either of the original views. This squeezed effect should be undone by the stereogram viewing device.
// If this is false, the combined images will have twice the aspect ratio of either of the original images if it is an SBS,
// or half the aspect ratio if it is an O/U
var do_halve = false;

// Redraw whenever the window changes size
window.addEventListener("resize", draw);

/* Functions to set variables in response to GUI events. */

function toggle_do_cross() {
	do_cross = !do_cross;
	
	if (do_cross) {
		document.getElementById("tog_do_cross_button").innerHTML = "Cross-Eyed";
	}
	else {
		document.getElementById("tog_do_cross_button").innerHTML = "Wall-Eyed";
	}
	
	draw();
}

function toggle_make_anaglyph() {
	make_anaglyph = !make_anaglyph;
	
	if (make_anaglyph) {
		document.getElementById("tog_make_anaglyph_button").innerHTML = "Anaglyphic";
		
		document.getElementById("set_anaglyph_button").style.display = "inline";
		document.getElementById("tog_make_SBS_button").style.display = "none";
		document.getElementById("tog_for_VR_button").style.display = "none";
		document.getElementById("tog_do_halve_button").style.display = "none";
	}
	else {
		document.getElementById("tog_make_anaglyph_button").innerHTML = "Stereoscopic";
		
		document.getElementById("set_anaglyph_button").style.display = "none";
		document.getElementById("tog_make_SBS_button").style.display = "inline";
		
		if (make_SBS) {
			document.getElementById("tog_for_VR_button").style.display = "inline";
			
			if (for_VR) {
				document.getElementById("tog_do_halve_button").style.display = "inline";
			}
			else {
				document.getElementById("tog_do_halve_button").style.display = "none";
			}
		}
		else {
			document.getElementById("tog_for_VR_button").style.display = "none";
			document.getElementById("tog_do_halve_button").style.display = "inline";
		}
	}
	
	draw();
}

function toggle_make_SBS() {
	make_SBS = !make_SBS;
	
	if (make_SBS) {
		document.getElementById("tog_make_SBS_button").innerHTML = "SBS";
		
		document.getElementById("tog_for_VR_button").style.display = "inline";
		
		if (for_VR) {
			document.getElementById("tog_do_halve_button").style.display = "inline";
		}
		else {
			document.getElementById("tog_do_halve_button").style.display = "none";
		}
	}
	else {
		document.getElementById("tog_make_SBS_button").innerHTML = "O/U";
		
		document.getElementById("tog_for_VR_button").style.display = "none";
		document.getElementById("tog_do_halve_button").style.display = "inline";
	}
	
	draw();
}

function toggle_for_VR() {
	for_VR = !for_VR;
	
	if (for_VR) {
		document.getElementById("tog_for_VR_button").innerHTML = "For VR Viewing";
		
		document.getElementById("tog_do_halve_button").style.display = "inline";
	}
	else {
		document.getElementById("tog_for_VR_button").innerHTML = "For Normal Viewing";
		
		document.getElementById("tog_do_halve_button").style.display = "none";
	}
	
	draw();
}

function toggle_do_halve() {
	do_halve = !do_halve;
	
	if (do_halve) {
		document.getElementById("tog_do_halve_button").innerHTML = "Half";
	}
	else {
		document.getElementById("tog_do_halve_button").innerHTML = "Full";
	}
	
	draw();
}

function set_anaglyph_type(ind) {
	merge_rgb = anaglyphs[ind];
	
	draw();
}

function draw() {
	canvas = document.getElementById("display");
	
	document.getElementById("content").style.height = window.innerHeight + "px";
	
	document.getElementById("display").style.height = (document.getElementById("content").clientHeight - document.getElementById("options").clientHeight) + "px";

	// Only execute this code if this browser supports canvases.
	if (canvas.getContext) {
		ctx = canvas.getContext("2d");
		
		left = document.getElementById("left");
		right = document.getElementById("right");
		
		compose();
	}
}

function compose() {
	if (do_cross) {
		var tmp = left;
		left = right;
		right = tmp;
	}
	
	// Refers to the width and height of one of the two stereograms in the output.
	// This may be scaled down to fit inside the canvas, and is affected by do_halve
	// For anaglyphs, this is just the resolution of the output.
	var out_width = left.naturalWidth;
	var out_height = right.naturalHeight;
	
	canvas.width  = document.getElementById("display").clientWidth;
	canvas.height = document.getElementById("display").clientHeight;
	
	// Scale image to fit the canvas
	if (!make_anaglyph && make_SBS && !for_VR) {
		// SBS images for freeviewing may need to be scaled down extra to fit both images.
		var scaling = Math.max(out_width / canvas.width * 2, out_height / canvas.height);
	}
	else {
		var scaling = Math.max(out_width / canvas.width, out_height / canvas.height);
	}
	
	out_width /= scaling;
	out_height /= scaling;
	
	if (make_anaglyph) {
		// Get the raw pixel data by drawing the images to off-screen canvases and then reading the pixels from that,
		// which is apparently not considered a hack.
		let temp_canvas = document.createElement('canvas');
		temp_canvas.width = out_width;
		temp_canvas.height = out_height;
		
		let temp_ctx = temp_canvas.getContext("2d");
		
		temp_ctx.drawImage(left, 0, 0, out_width, out_height);
		let left_im_data  = temp_ctx.getImageData(0, 0, temp_canvas.width, temp_canvas.height);
		let left_data = left_im_data.data;
		
		temp_ctx.drawImage(right, 0, 0, out_width, out_height);
		let right_im_data = temp_ctx.getImageData(0, 0, temp_canvas.width, temp_canvas.height);
		let right_data = right_im_data.data;
		
		anaglyph_im_data = temp_ctx.createImageData(left_im_data);
		
		// Combine the images into an anaglyph
		let ind = 0;
		let triple = (0, 0, 0);
		for (let x = 0; x < left_im_data.width; x++) {
			for (let y = 0; y < left_im_data.height; y++) {
				ind = (x + y * left_im_data.width)*4;
				triple = merge_rgb(left_data[ind],  left_data[ind+1],  left_data[ind+2],
				                   right_data[ind], right_data[ind+1], right_data[ind+2]);
				
				left_data[ind  ] = triple[0];
				left_data[ind+1] = triple[1];
				left_data[ind+2] = triple[2];
			}
		}
		
		ctx.putImageData(left_im_data, canvas.width/2 - out_width/2, canvas.height/2 - out_height/2);
	}
	else {
		if (make_SBS) {
			if (for_VR) {
				out_width /= 2;
				if (!do_halve) {
					out_height /= 2;
				}
				
				ctx.drawImage(left,  (canvas.width/2 - out_width)/2,                  canvas.height/2 - out_height/2, out_width, out_height);
				ctx.drawImage(right, (canvas.width/2 - out_width)/2 + canvas.width/2, canvas.height/2 - out_height/2, out_width, out_height);
			}
			else {
				ctx.drawImage(left,  canvas.width/2 - out_width, canvas.height/2 - out_height/2, out_width, out_height);
				ctx.drawImage(right, canvas.width/2            , canvas.height/2 - out_height/2, out_width, out_height);
			}
		}
		else {
			out_height /= 2;
			if (!do_halve) {
				out_width /= 2;
			}
			
			ctx.drawImage(left,  canvas.width/2 - out_width/2, (canvas.height/2 - out_height)/2,                   out_width, out_height);
			ctx.drawImage(right, canvas.width/2 - out_width/2, (canvas.height/2 - out_height)/2 + canvas.height/2, out_width, out_height);
		}
	}
}
