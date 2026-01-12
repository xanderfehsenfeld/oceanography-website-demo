import * as React from "react"



function Slider({ src,  ...props }: React.ComponentProps<"input">) {
  return (
    <input type="range" className="not-prose"  {...props}/>
  )
}

export { Slider }
