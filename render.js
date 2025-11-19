async function initWebGPU() {
  if (!navigator.gpu) {
    console.error("WebGPU is not supported in this browser.");
    return;
  }
  // get adapter if available
  const adapter = await navigator.gpu.requestAdapter();
  // if webgpu adapter is found, log its details
  if (!adapter) {
    console.error("No WebGPU adapter found.");
    return;
  } else {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.log("No appropriate GPUAdapter found.");
        return;
      }
      console.log("GPU Architecture:", adapter.info.architecture);
      console.log("GPU Supported Features:", adapter.info.description);
      console.log("GPU Supported Limits:", adapter.info.device);
      console.log("GPU Vendor:", adapter.info.vendor);
    } catch (error) {
      console.error("Error requesting WebGPU adapter:", error);
    }
  }
  // get device from adapter
  const device = await adapter.requestDevice();
  console.log("Device: ", device);
  const canvas = document.getElementById("webgpu-canvas"); // set initial canvas size to window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log("Canvas: ", canvas);
  const context = canvas.getContext("webgpu");
  console.log("Context: ", context);
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  console.log("Presentation Format: ", presentationFormat);
  // configure context
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "opaque", // or 'premultiplied' if transparency is needed
  });
  ////////////////////////
  // create shader module
  const module = device.createShaderModule({
    label: "our hardcoded red triangle shaders",
    code: `
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( 0.0,  0.5),  // top center
          vec2f(-0.5, -0.5),  // bottom left
          vec2f( 0.5, -0.5)   // bottom right
        );
 
        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }
 
      @fragment fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
      }
    `,
  });
  ////////////////////////
  // create a render pipeline
  const pipeline = device.createRenderPipeline({
    label: "our hardcoded red triangle pipeline",
    layout: "auto",
    vertex: {
      //  entryPoint: 'vs',  // set if more than one vertex shader
      module,
    },
    fragment: {
      //  entryPoint: 'fs',  // set if there is more than one fragment shader
      module,
      targets: [{ format: presentationFormat }],
    },
  });
  ////////////////////////
  // function to encode drawing commands
  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };
  ////////////////////////
  // draw function
  function render() {
    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();
    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: "our encoder" });
    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3); // call our vertex shader 3 times
    pass.end();
    const commandBuffer = encoder.finish();
    // submit is the time that things are actually drawn
    device.queue.submit([commandBuffer]);
  }
  // window resize handler
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // draw();
    render();
  });
  // // Call draw initially
  // draw();
  render();
}

// ... after context configuration ...
initWebGPU();
