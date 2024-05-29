# Cuda Visualization Tool

This is a simple tool I made to visualize the multidimensional thread space of a CUDA kernel. I found it to be a little tricky to manage my threads and make sure I had enough threads to cover all elements, so I made this tool as a supporting piece for my behrend sigma xi research conference [presentation](https://www.canva.com/design/DAGBarqQhIg/iXZTmmIkRJWQa0lMyL3DIQ/view?utm_content=DAGBarqQhIg&utm_campaign=designshare&utm_medium=link&utm_source=editor)

## How to use

Just go to https://cuda-viz.netlify.app and start messing around with the block dimensions. Remember threads are organized in 3D space within a block and blocks are organized in 3D space within a grid. The tool will show you the total number of threads with the current configuration.

![diagram](https://docs.nvidia.com/cuda/cuda-c-programming-guide/_images/grid-of-thread-blocks.png)
