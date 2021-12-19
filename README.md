# Stereogram Viewer

This viewer written in Javascript loads the two images "left.png" and "right.png" and automatically presents them in the format selected on the page.

## Functionality

This viewer can present the images as an SBS (Side-By-Side), either wall-eyed or cross-eyed, for freeviewing. It can also center them on either half of the screen, either in SBS or O/U (Over/Under) format, for use with VR stereoscope viewers that split the screen down the middle. For both SBS and O/U VR formats, both half and full aspect ratio options exist.

This viewer can also create anaglyphs from the two images. Currently only red-cyan and red-blue anaglyphs are supported, but additional options are easy to add.

## A Note about Anaglyphs

It is important to note that the process of generating the anaglyph involves reading from an HTML canvas which the images are drawn to. Unless the page is hosted by and retreived from an actual HTML server, the images will be considered by the browser as having been loaded from an insecure source. As such, reading this data from the canvas will not be allowed for security reasons. **In order to use the anaglyph generator without putting the page on a server, this security feature must be disabled. With chrome, this can be done by launching the browser from the command line with the --disable-web-security option. Never browse the internet with this feature disabled.**

## Opportunities for Improvement

Currently, all operations are performed using an HTML canvas. The process of writing images to a canvas is slow, noticeably for the larger images, and only the anaglyph generator requires it. By using CSS for the other formats, client response time can be improved significantly. This would also allow gif and webm stereograms to be displayed.

When the window is split by a stereogram viewer, the GUI controls will appear only to one eye. This difference can be disorienting because the two images presented to each eye can't be properly fused. The solution is to have the controls appear on both halves of the screen by duplicating them. Although this is fairly simple for the dedicated viewer, attempting to duplicate an entire webpage with an embedded viewer may not be feasible.

Currently, it is not possible to zoom and pan. This would require extra accomodations due to the nature of the HTML canvas. The most reliable technique would be to include a zoom control in the page, and ignore browser zooming.

