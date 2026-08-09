import { ReactNode, useEffect, useRef, useState } from "react"

export const Tooltip = ({
  x,
  y,
  children,
}: {
  x: number
  y: number
  children: ReactNode
}) => {
  const [{ top, left }, setTopLeft] = useState({ top: y, left: x })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const boundingDiv = ref.current?.getBoundingClientRect() as DOMRect

    setTopLeft({
      top: y - (boundingDiv.height + 13),
      left: x - boundingDiv.width / 2,
    })
  }, [x, y, setTopLeft])

  return (
    <div
      ref={ref}
      style={{
        top,
        left,
        position: "absolute",
        zIndex: 600,
      }}
    >
      <div
        className="radix-themes rt-TooltipContent rt-r-max-w"
        style={{
          maxWidth: 360,
        }}
      >
        {children}

        <span
          style={{
            position: "absolute",
            bottom: "1px",
            transform: "translateY(100%)",
            left: "calc(50% - 8px)",
          }}
        >
          <svg
            className="rt-TooltipArrow"
            width="16"
            height="10"
            viewBox="0 0 30 10"
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <polygon points="0,0 30,0 15,10"></polygon>
          </svg>
        </span>
        <span
          id="radix-_r_3_"
          role="tooltip"
          style={{
            position: "absolute",
            border: "0px",
            width: "1px",
            height: "1px",
            padding: "0px",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0px, 0px, 0px, 0px)",
            whiteSpace: "nowrap",
            overflowWrap: "normal",
          }}
        >
          <p className="rt-Text rt-r-size-1 rt-TooltipText">Add to library</p>
        </span>
      </div>
    </div>
  )
}
